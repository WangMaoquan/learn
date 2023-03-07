---
title: 挂载与更新
date: 2023-03-07 09:57:35
tag:
  - vue
category:
  - vue
description: 针对vue3.x的挂载与更新流程的简略说明
footer: true
---

## 引入

就我来说, 挂载和更新其实就是一个方法, 只是通过参数来控制是去 `mount` or `update`

因为 `vue` 是 `组件级更新`, 什么是 `组件级更新` 就是 每次更新都是 以`组件` 为单位去更新

这里的 `mount` 可以分为 `app` 和 `component`

这里的 `update` 也可以分为`app` 和 `component`, 但是 `app` 的 更新只有 `unmount`

下面是我进行断点调试的例子

```html
<div id="app"></div>
<script src="../../dist/vue.global.js"></script>
<script>
  const { defineComponent, createApp, h, ref } = Vue;

  const compA = defineComponent({
    name: 'compA',
    setup() {
      return () => h('div', 'this is A component');
    },
  });
  const compB = defineComponent({
    name: 'compB',
    setup() {
      return () => h('div', 'this is B component');
    },
  });

  const compC = defineComponent({
    name: 'compC',
    props: ['change'],
    setup(props) {
      return () => (props.change ? h(compA) : h(compB));
    },
  });

  const App = defineComponent({
    name: 'app',
    setup() {
      const change = ref(false);

      return () =>
        h('div', [
          h(
            'button',
            { onClick: () => (change.value = !change.value) },
            'click to change value',
          ),
          h(compC, { change: change.value }),
        ]);
    },
  });
  createApp(App).mount('#app');
</script>
```

## app

主要是 `app` 的 `mount` 与 `unmount`

### createApp

是由 `createAppApi` 方法 返回的, 所以我们主要讲讲 `createAppApi` 就好

```typescript
export function createAppAPI<HostElement>(
  render: RootRenderFunction<HostElement>,
  hydrate?: RootHydrateFunction,
): CreateAppFunction<HostElement> {
  return function createApp(rootComponent, rootProps = null) {
    // 省略代码

    const context = createAppContext();
    const installedPlugins = new Set();

    let isMounted = false;

    const app: App = (context.app = {
      _uid: uid++,
      _component: rootComponent as ConcreteComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,

      version,

      get config() {
        return context.config;
      },

      set config(v) {
        if (__DEV__) {
          warn(
            `app.config cannot be replaced. Modify individual options instead.`,
          );
        }
      },

      use(plugin: Plugin, ...options: any[]) {
        // 省略代码
        return app;
      },

      mixin(mixin: ComponentOptions) {
        // 省略代码
        return app;
      },

      component(name: string, component?: Component): any {
        // 省略代码
        return app;
      },

      directive(name: string, directive?: Directive) {
        // 省略代码
        return app;
      },

      mount(
        rootContainer: HostElement,
        isHydrate?: boolean,
        isSVG?: boolean,
      ): any {
        // 省略代码
      },

      unmount() {
        // 省略代码
      },

      provide(key, value) {
        // 省略代码
      },
    });

    // 省略代码

    return app;
  };
}
```

::: note createAppApi

1. 接收的参数一共两个 `render` 与 `hydrate`, 渲染方法 与 注水的方法(字面翻译 `同构渲染` 会用到)
2. 主要返回的是一个 `app` 对象, 这个对象包含了, 我们注册插件的 `use`, 注册组件的 `component`, 注册指令的 `directive`, 注入依赖的 `provide`, 使用混入的 `minix`, 以及 `mount`, `unmount`

这里我们主要看 `mount`

:::

### mount

其实 `app` 的 `mount` 最主要做的就两件事

1. 挂载 `app` 的 `rootComponent`
2. 修改 `isMounted` 状态

下面我们看代码

```typescript
const app = {
  // 省略
  /**
   * rootContainer 就是我们传入的 id为app 的那个dom
   * isHydrate 是否是注水
   * isSVG 是否是svg 元素
   */
  mount(rootContainer: HostElement, isHydrate?: boolean, isSVG?: boolean): any {
    if (!isMounted) {
      // 这里就是挂载 自己的 rootComponent
      const vnode = createVNode(rootComponent as ConcreteComponent, rootProps);
      render(vnode, rootContainer, isSVG);
      isMounted = true; // 修改状态
    }
  },
};
```

### unmount

其实 `app` 的 `unmount` 最主要做的就一件事

1. 卸载 `app` 的 `rootComponent`

下面我们看代码

```typescript
const app = {
  unmount() {
    if (isMounted) {
      render(null, app._container);
    }
  },
};
```

## component

`rootComponent` 其实就是一个 `component`, 所以我们可以看 `render` 方法的实现

### render

```typescript
const render: RootRenderFunction = (vnode, container, isSVG) => {
  if (vnode == null) {
    if (container._vnode) {
      unmount(container._vnode, null, null, true);
    }
  } else {
    patch(container._vnode || null, vnode, container, null, null, null, isSVG);
  }
  container._vnode = vnode;
};
```

其实主要做的就是 根据 `vnode` 是否是 `null`, 来卸载 `unmount` 或者 挂载(更新) `patch`

`patch` 意为打补丁 `挂载`其实就是一种特殊的`更新`

### unmount

思考一下 unmount 会干些啥?

1. 首先想到的是 会删除 `vnode` 对应的 `dom`
2. `dom` 都想到了, 是不是还会想到 `dom` 的引用 `ref`
3. 触发钩子(`beforeUnmount`, `unmounted`)
4. 修改 `isUnmounted` 状态

下面看代码

```typescript
const unmount: UnmountFn = (
  vnode,
  parentComponent,
  parentSuspense,
  doRemove = false,
  optimized = false,
) => {
  const {
    type,
    props,
    ref,
    children,
    dynamicChildren,
    shapeFlag,
    patchFlag,
    dirs,
  } = vnode;

  // 解除ref
  if (ref != null) {
    setRef(ref, null, parentSuspense, vnode, true);
  }

  // 省略代码

  // 如果 是 element 元素 且存在 指令
  const shouldInvokeDirs = shapeFlag & ShapeFlags.ELEMENT && dirs;

  // vnode 是不是一个异步的
  const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);

  // 执行 onVnodeBeforeUnmount
  let vnodeHook: VNodeHook | undefined | null;
  if (
    shouldInvokeVnodeHook &&
    (vnodeHook = props && props.onVnodeBeforeUnmount)
  ) {
    invokeVNodeHook(vnodeHook, parentComponent, vnode);
  }

  //  卸载 component
  if (shapeFlag & ShapeFlags.COMPONENT) {
    unmountComponent(vnode.component!, parentSuspense, doRemove);
  } else {
    // 省略

    if (shouldInvokeDirs) {
      invokeDirectiveHook(vnode, null, parentComponent, 'beforeUnmount');
    }

    // 卸载 子组件 代码

    // 移出真实dom
    if (doRemove) {
      remove(vnode);
    }
  }

  // onVnodeUnmounted / unmounted hook
  if (
    (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted)) ||
    shouldInvokeDirs
  ) {
    queuePostRenderEffect(() => {
      vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
      shouldInvokeDirs &&
        invokeDirectiveHook(vnode, null, parentComponent, 'unmounted');
    }, parentSuspense);
  }
};
```

### unmountComponent

这是卸载`函数组件或者状态组件`的 component

```typescript
const unmountComponent = (
  instance: ComponentInternalInstance,
  parentSuspense: SuspenseBoundary | null,
  doRemove?: boolean,
) => {
  // 取出 bum(beforeUnmount) um(unmounted)
  const { bum, scope, update, subTree, um } = instance;

  // call beforeUnmount
  if (bum) {
    invokeArrayFns(bum);
  }

  // 卸载子组件
  unmount(subTree, instance, parentSuspense, doRemove);

  // call unmounted hook
  if (um) {
    queuePostRenderEffect(um, parentSuspense);
  }

  // 修改状态
  queuePostRenderEffect(() => {
    instance.isUnmounted = true;
  }, parentSuspense);
};
```

### patch

```typescript
/***
 * n1 旧vnode
 * n2 新vnode
 * container 容器
 * anchor 锚点
 */
const patch: PatchFn = (
  n1,
  n2,
  container,
  anchor = null,
  parentComponent = null,
  parentSuspense = null,
  isSVG = false,
  slotScopeIds = null,
  optimized = __DEV__ && isHmrUpdating ? false : !!n2.dynamicChildren,
) => {
  // 相等话 是不需要 patch的
  if (n1 === n2) {
    return;
  }

  // n1存在 且 ni n2 type 不一样 直接卸载n1 且重置为null
  // 重置 就是相当于就是 patch(null, n2, container, ...)
  if (n1 && !isSameVNodeType(n1, n2)) {
    anchor = getNextHostNode(n1);
    unmount(/** */);
    n1 = null;
  }

  // 省略代码

  // 下面就是针对不同的type 快速命中

  const { type, ref, shapeFlag } = n2;
  switch (type) {
    case Text: // 处理文本
      processText(/** */);
      break;
    case Comment: // 处理 注释
      processCommentNode(/** */);
      break;
    case Static: // 处理静态
      if (n1 == null) {
        mountStaticNode(/** */);
      } else if (__DEV__) {
        patchStaticNode(/** */);
      }
      break;
    case Fragment: // 处理 fragment
      processFragment(/** */);
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // 处理 div 之类的
        processElement(/** */);
      } else if (shapeFlag & ShapeFlags.COMPONENT) {
        // 处理 状态组件或者函数组件
        processComponent(/** */);
      } else if (shapeFlag & ShapeFlags.TELEPORT) {
        // 处理 teleport
        (type as typeof TeleportImpl).process(/** */);
      } else if (__FEATURE_SUSPENSE__ && shapeFlag & ShapeFlags.SUSPENSE) {
        // 处理 suspense
        (type as typeof SuspenseImpl).process(/** */);
      } else if (__DEV__) {
        warn('Invalid VNode type:', type, `(${typeof type})`);
      }
  }

  // 设置ref
  if (ref != null && parentComponent) {
    setRef(/** */);
  }
};
```

我就举个 `processElement`, 最基本的肯定是 `patch element`了

### processElement

就做一件事, n1 是否是 null, 是 `mount` 不是 `update`

```typescript
const processElement = (
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor: RendererNode | null,
  parentComponent: ComponentInternalInstance | null,
  parentSuspense: SuspenseBoundary | null,
  isSVG: boolean,
  slotScopeIds: string[] | null,
  optimized: boolean,
) => {
  if (n1 == null) {
    mountElement(/** */);
  } else {
    patchElement(/** */);
  }
};
```

### mountElement

1. 创建对应的 dom, 先创建 是为了 `挂载子节点` 时 提供挂载的地方
2. 挂载子节点
3. 触发指令的 `created` 钩子
4. 设置 props
5. 触发 vnode 的 `onVnodeBeforeMount` 钩子
6. 触发指令的 `beforeMount` 钩子
7. 判断是否需要触发 transition 的 `beforeEnter`
8. 触发 指令的 `mounted`, vnode 的 `onVnodeMounted`, transition 的 `enter`

```typescript
const mountElement = (
  vnode: VNode,
  container: RendererElement,
  anchor: RendererNode | null,
  parentComponent: ComponentInternalInstance | null,
  parentSuspense: SuspenseBoundary | null,
  isSVG: boolean,
  slotScopeIds: string[] | null,
  optimized: boolean,
) => {
  let el: RendererElement;
  let vnodeHook: VNodeHook | undefined | null;
  const { type, props, shapeFlag, transition, dirs } = vnode;

  el = vnode.el = hostCreateElement(/** */);

  // children 要么是字符串 要么是 数组
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // 插入文本
    hostSetElementText(/** */);
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // mountChildren 遍历挂载
    mountChildren(/** */);
  }

  // 触发 指令 created 钩子
  if (dirs) {
    invokeDirectiveHook(/** */ 'created');
  }

  // 初始化 props
  if (props) {
    for (const key in props) {
      if (key !== 'value' && !isReservedProp(key)) {
        hostPatchProp(/** */);
      }
    }
    // 这里有个 边界case
    if ('value' in props) {
      hostPatchProp(el, 'value', null, props.value);
    }
    // 调用 onVnodeBeforeMount
    if ((vnodeHook = props.onVnodeBeforeMount)) {
      invokeVNodeHook(/** */);
    }
  }

  // 调用 beforeMount
  if (dirs) {
    invokeDirectiveHook(/** */ 'beforeMount');
  }

  // 是否需要 调用 transform hook
  const needCallTransitionHooks =
    (!parentSuspense || (parentSuspense && !parentSuspense.pendingBranch)) &&
    transition &&
    !transition.persisted;
  if (needCallTransitionHooks) {
    transition!.beforeEnter(el);
  }
  // 插入 dom
  hostInsert(el, container, anchor);

  // 调用 mounted, onVnodeMounted, transition.enter
  if (
    (vnodeHook = props && props.onVnodeMounted) ||
    needCallTransitionHooks ||
    dirs
  ) {
    queuePostRenderEffect(() => {
      vnodeHook && invokeVNodeHook(/** */);
      needCallTransitionHooks && transition!.enter(el);
      dirs && invokeDirectiveHook(/** */ 'mounted');
    }, parentSuspense);
  }
};
```

### mountChildren

就是对每个 `child` 执行 `patch`,

```typescript
const mountChildren: MountChildrenFn = (
  children,
  container,
  anchor,
  parentComponent,
  parentSuspense,
  isSVG,
  slotScopeIds,
  optimized,
  start = 0,
) => {
  for (let i = start; i < children.length; i++) {
    const child = children[i];
    patch(null, child /** */);
  }
};
```

### patchElement

对应着 mountElement 做的事来

1. 将新 vnode 的 el, 指向旧 vnode 的 el
2. 调用 指令的 `beforeUpdate` 钩子
3. 调用 vnode 的 `onVnodeBeforeUpdate` 钩子
4. 遍历 patch children
5. patch props
6. 调用 vnode 的 `onVnodeUpdated`, 指令的 `updated`

```typescript
const patchElement = (
  n1: VNode,
  n2: VNode,
  parentComponent: ComponentInternalInstance | null,
  parentSuspense: SuspenseBoundary | null,
  isSVG: boolean,
  slotScopeIds: string[] | null,
  optimized: boolean,
) => {
  const el = (n2.el = n1.el!);
  let { patchFlag, dynamicChildren, dirs } = n2;
  patchFlag |= n1.patchFlag & PatchFlags.FULL_PROPS;
  const oldProps = n1.props || EMPTY_OBJ;
  const newProps = n2.props || EMPTY_OBJ;
  let vnodeHook: VNodeHook | undefined | null;

  if ((vnodeHook = newProps.onVnodeBeforeUpdate)) {
    invokeVNodeHook(/** */);
  }
  if (dirs) {
    invokeDirectiveHook(/** */ 'beforeUpdate');
  }

  const areChildrenSVG = isSVG && n2.type !== 'foreignObject';
  if (dynamicChildren) {
    // 处理动态子节点数组
    patchBlockChildren(/** */);
  } else if (!optimized) {
    // patch 所有的子节点
    patchChildren(/** */);
  }

  if (patchFlag > 0) {
    if (patchFlag & PatchFlags.FULL_PROPS) {
      // style class props 都需要patch
      patchProps(/** */);
    } else {
      // patch class
      if (patchFlag & PatchFlags.CLASS) {
        if (oldProps.class !== newProps.class) {
          hostPatchProp(el, 'class', null, newProps.class, isSVG);
        }
      }

      // patch style
      if (patchFlag & PatchFlags.STYLE) {
        hostPatchProp(el, 'style', oldProps.style, newProps.style, isSVG);
      }

      // patch props
      if (patchFlag & PatchFlags.PROPS) {
        const propsToUpdate = n2.dynamicProps!;
        for (let i = 0; i < propsToUpdate.length; i++) {
          const key = propsToUpdate[i];
          // value是强制patch
          if (next !== prev || key === 'value') {
            hostPatchProp(/** */);
          }
        }
      }
    }

    // children 是文本
    if (patchFlag & PatchFlags.TEXT) {
      if (n1.children !== n2.children) {
        hostSetElementText(el, n2.children as string);
      }
    }
  } else if (!optimized && dynamicChildren == null) {
    // patch children
    patchProps(/** */);
  }

  if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
    queuePostRenderEffect(() => {
      vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
      dirs && invokeDirectiveHook(n2, n1, parentComponent, 'updated');
    }, parentSuspense);
  }
};
```

### patchChildren

::: info

首先我们要明确, `children` 的 有哪几类:

1. text
2. array
3. null

两个 vnode 的 children 是不是一共就有 `9` 种可能

:::

```typescript
const patchChildren: PatchChildrenFn = (
  n1,
  n2,
  container,
  anchor,
  parentComponent,
  parentSuspense,
  isSVG,
  slotScopeIds,
  optimized = false,
) => {
  const c1 = n1 && n1.children;
  const prevShapeFlag = n1 ? n1.shapeFlag : 0;
  const c2 = n2.children;

  const { patchFlag, shapeFlag } = n2;

  // 新的是 text
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // 新的是text 但 旧的是 数组
    if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 我们直接卸载 旧的children
      unmountChildren(c1 as VNode[], parentComponent, parentSuspense);
    }
    // 旧的 是text, 但是不与 新的值相同
    // 旧的 是 null
    if (c2 !== c1) {
      hostSetElementText(container, c2 as string);
    }
  } else {
    // 旧的是 array
    if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 新的也是 array
      if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // patchchildren
        patchKeyedChildren(/** */);
      } else {
        // 没有新的 直接卸载
        unmountChildren(c1 as VNode[], parentComponent, parentSuspense, true);
      }
    } else {
      // 旧的 text / null
      // 新的 array / null

      //  旧的是文本, 卸载
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '');
      }
      // 挂载新的
      if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(/** */);
      }
    }
  }
};
```
