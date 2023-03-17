---
title: Directive
date: 2023-03-15 08:08:10
tag:
  - vue
category:
  - vue
description: 简单提一嘴vue3.x中指令的实现
footer: true
---

## 引入

说起 指令`Directive` 用的最多还是 `v-model`, `v-show`, `v-if`, `v-else` 这些内置的, 当然还有我们平时自定义的

还记得之前分析渲染流程中, 基本都有着 这么一行 `dirs && invokeDirectiveHook(vnode, null, parentComponent, hookName)` 代码

即调用 `指令` 中的生命周期钩子, 下面我们来看看

```typescript
const myDirective = {
  created(el, binding, vnode, prevVnode) {},
  beforeMount(el, binding, vnode, prevVnode) {},
  mounted(el, binding, vnode, prevVnode) {},
  beforeUpdate(el, binding, vnode, prevVnode) {},
  updated(el, binding, vnode, prevVnode) {},
  beforeUnmount(el, binding, vnode, prevVnode) {},
  unmounted(el, binding, vnode, prevVnode) {},
};
```

如果我们只需要 指令生命周期中的 `mounted`, `updated` 的话我们可以只传入一个函数

```typescript
app.directive('test', (el, binding) => {
  // todo
});
```

### Directive 类型

前面介绍了用法, 大概可以理解 有两种类型, 一种是 `function` 另一种是 `object`

```typescript
export interface DirectiveBinding<V = any> {
  instance: ComponentPublicInstance | null; // 实例
  value: V; // 当前值
  oldValue: V | null; // 之前值
  arg?: string; // 参数
  modifiers: DirectiveModifiers; // 修饰符 比如 .number
  dir: ObjectDirective<any, V>;
}

export type DirectiveHook<T = any, Prev = VNode<any, T> | null, V = any> = (
  el: T, // 宿主元素
  binding: DirectiveBinding<V>, // 相应的数据
  vnode: VNode<any, T>, // 当前 vnode
  prevVNode: Prev, // 之前的 vnode
) => void;

// 对象指令
export interface ObjectDirective<T = any, V = any> {
  // 在绑定元素的 attribute 前
  // 或事件监听器应用前调用
  created?: DirectiveHook<T, null, V>;
  // 在元素被插入到 DOM 前调用
  beforeMount?: DirectiveHook<T, null, V>;
  // 在绑定元素的父组件
  // 及他自己的所有子节点都挂载完成后调用
  mounted?: DirectiveHook<T, null, V>;
  // 绑定元素的父组件更新前调用
  beforeUpdate?: DirectiveHook<T, VNode<any, T>, V>;
  // 在绑定元素的父组件
  // 及他自己的所有子节点都更新后调用
  updated?: DirectiveHook<T, VNode<any, T>, V>;
  // 绑定元素的父组件卸载前调用
  beforeUnmount?: DirectiveHook<T, null, V>;
  // 绑定元素的父组件卸载后调用
  unmounted?: DirectiveHook<T, null, V>;
}

// 函数指令
export type FunctionDirective<T = any, V = any> = DirectiveHook<T, any, V>;

export type Directive<T = any, V = any> =
  | ObjectDirective<T, V>
  | FunctionDirective<T, V>;
```

这里会有个疑问, 为啥 函数指令 会作为 `mounted, updated`

其实是调用了 `withDirectives` 方法

### withDirectives

::: code-tabs

@tab withDirectives

```typescript
export function withDirectives<T extends VNode>(
  vnode: T,
  directives: DirectiveArguments,
): T {
  // 获取render实例
  const internalInstance = currentRenderingInstance;
  // withDirectives 方法只能 在render里面用
  if (internalInstance === null) {
    __DEV__ && warn(`withDirectives can only be used inside render functions.`);
    return vnode;
  }
  const instance =
    (getExposeProxy(internalInstance) as ComponentPublicInstance) ||
    internalInstance.proxy;
  // 生成 binding
  const bindings: DirectiveBinding[] = vnode.dirs || (vnode.dirs = []);
  for (let i = 0; i < directives.length; i++) {
    let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
    if (dir) {
      // 如果是方法, 作为 mounted, updated
      if (isFunction(dir)) {
        dir = {
          mounted: dir,
          updated: dir,
        } as ObjectDirective;
      }
      // binding 参数
      bindings.push({
        dir,
        instance,
        value,
        oldValue: void 0,
        arg,
        modifiers,
      });
    }
  }
  return vnode;
}
```

@tab DirectiveArguments

```typescript
// 指令 | value | 参数 | 修饰符
export type DirectiveArguments = Array<
  | [Directive | undefined]
  | [Directive | undefined, any]
  | [Directive | undefined, any, string]
  | [Directive | undefined, any, string, DirectiveModifiers]
>;

// 例子

const oD: Directive = {
  mounted(el, binding) {
    console.log('object directive');
    console.log('value', binding.value);
    console.log('arg', binding.arg);
  },
};

const fD: Directive = () => {
  console.log('function directive');
};

const d: DirectiveArguments = [[oD, 'decade', 'xx'], [fD]];
```

:::

### resolveAsset

```typescript
export const DIRECTIVES = 'directives';

export type AssetTypes = typeof DIRECTIVES;

export function resolveDirective(name: string): Directive | undefined {
  return resolveAsset(DIRECTIVES, name);
}

function resolveAsset(
  type: typeof DIRECTIVES,
  name: string,
): Directive | undefined;
function resolveAsset(
  type: AssetTypes,
  name: string,
  warnMissing = true,
  maybeSelfReference = false,
) {
  const instance = currentRenderingInstance || currentInstance;
  if (instance) {
    // 获取 组件里面注册的
    // 获取 全局的
    const res =
      resolve(instance[type] || (Component as ComponentOptions)[type], name) ||
      resolve(instance.appContext[type], name);

    if (!res && maybeSelfReference) {
      return Component;
    }
    return res;
  } else if (__DEV__) {
    warn(
      `resolve${capitalize(type.slice(0, -1))} ` +
        `can only be used in render() or setup().`,
    );
  }
}

function resolve(registry: Record<string, any> | undefined, name: string) {
  return (
    registry &&
    (registry[name] ||
      registry[camelize(name)] ||
      registry[capitalize(camelize(name))])
  );
}
```

其实 `resolveAsset` 还可以实现返回组件

### v-model 实现

我就分析 `input` 的 `v-model` 实现

```typescript
export const vModelText: ModelDirective<
  HTMLInputElement | HTMLTextAreaElement
> = {
  created(el, { modifiers: { lazy, trim, number } }, vnode) {
    // 获取回调
    el._assign = getModelAssigner(vnode);
    // 是否需要转成 number
    const castToNumber =
      number || (vnode.props && vnode.props.type === 'number');
    // 注册事件
    addEventListener(el, lazy ? 'change' : 'input', (e) => {
      // 输入法是否正在输入, vue自定义的
      if ((e.target as any).composing) return;
      // 获取value
      let domValue: string | number = el.value;
      if (trim) {
        // 是否去空格
        domValue = domValue.trim();
      }
      if (castToNumber) {
        //是否需要 number 化
        domValue = looseToNumber(domValue);
      }
      // 传入值
      el._assign(domValue);
    });
    if (trim) {
      // 去空格
      addEventListener(el, 'change', () => {
        el.value = el.value.trim();
      });
    }
    if (!lazy) {
      addEventListener(el, 'compositionstart', onCompositionStart);
      addEventListener(el, 'compositionend', onCompositionEnd);
      addEventListener(el, 'change', onCompositionEnd);
    }
  },
  mounted(el, { value }) {
    // mounted 赋值
    el.value = value == null ? '' : value;
  },
  beforeUpdate(el, { value, modifiers: { lazy, trim, number } }, vnode) {
    el._assign = getModelAssigner(vnode);
    // 正在输入直接返回
    if ((el as any).composing) return;
    if (document.activeElement === el && el.type !== 'range') {
      if (lazy) {
        return;
      }
      if (trim && el.value.trim() === value) {
        return;
      }
      if (
        (number || el.type === 'number') &&
        looseToNumber(el.value) === value
      ) {
        return;
      }
    }
    const newValue = value == null ? '' : value;
    if (el.value !== newValue) {
      el.value = newValue;
    }
  },
};
```
