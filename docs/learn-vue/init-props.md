---
title: 属性
date: 2023-03-08 12:18:33
tag:
  - vue
category:
  - vue
description: vue中属性的初始化
footer: true
---

## 引入

首先我先说明 这里的 `属性`, 你可以理解为 `h` 方法的 第二个参数 `props`, 这个的范围其实是比我们在组件中使用的 `props: ["change"]` 的范围更大, 因为还包含了 我们传入的 `class`, `style`, `id` 之类的 `HTML元素`的属性

直接在 组件里面写属性的 其实 不光 `props`, 还有 `emit`, 还有 `directive`, 这里我主要讲下 `props`

下面是我调试的代码

```html
<div id="app"></div>
<script src="../../dist/vue.global.js"></script>
<script>
  const { defineComponent, createApp, h, ref } = Vue;

  const compC = defineComponent({
    name: 'compC',
    props: ['change'],
    setup(props) {
      return () =>
        h('p', `props.change is: ${props.change ? 'true' : 'false'}`);
    },
  });

  const App = defineComponent({
    name: 'app',
    props: ['change'],
    setup(props) {
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
  createApp(App, { class: 'app' }).mount('#app');
</script>
```

### createApp 与 h

如果我们需要对我们创建的 `App` 传入 设置属性, 我们应该作为 `createApp` 的第二个参数传入, 如上 我们传入了一个 `{ class: 'app' }` 最后渲染的样子如下

```html
<div id="app" data-v-app="">
  <div class="app">
    <!-- 省略 -->
  </div>
</div>
```

其实这个效果 和 我们在返回的 `h` 函数 第二个参数加是一样的效果

```typescript
h('div', { class: 'app1' }, [
  h(
    'button',
    { onClick: () => (change.value = !change.value) },
    'click to change value',
  ),
  h(compC, { change: change.value }),
]);
```

结果如下:

```html
<div class="app1 app">
  <!-- 省略 -->
</div>
```

但是如果我们需要 在 App 中使用 `props` 时, 在 `h` 那个里指定对应的 `props` 是不会生效的

```typescript
h('div', { class: 'app1', change: 1 }, [
  /**省略 */
]);
```

渲染成这样

```html
<div class="app1 app" change="1">
  <!-- 省略 -->
</div>
```

为啥会这样? 很简单 `props` 可以理解为 `父传子`, 所以我们在 `createApp` 里面加

```html
<script>
  // 省略
  const App = defineComponent({
    name: 'app',
    props: ['change'],
    setup(props) {
      console.log(`props:`, props.change);
      // 省略
    },
  });
  createApp(App, { class: 'app', change: 1 }).mount('#app');
</script>
```

渲染结果如下, 同时控制台会打印出来 `props: 1`

```html
<div class="app1 app">
  <!--省略-->
</div>
```

::: tip

首先上面的内容让我们知道了 怎么在 `rootComponent` 中使用 `props` 属性, 也能知道 `h` 方法的 第二个参数 可以传一个对象, 里面可以用`HTML元素`的属性, 也可以有 component 中定义 `props` 的值,

通过例子 我们可以大胆的猜测, 只有在 子组件 `props` 里面的 才会当做 父传子的 `props`

:::

### componentProps

挂载组件之前是不是需要初始化组件的 `props`?

我们定位到 方法 `mountComponent`

```typescript
const mountComponent: MountComponentFn = (/** */) => {
  /**省略代码 */
  const instance: ComponentInternalInstance = createComponentInstance(
    initialVNode,
    parentComponent,
    parentSuspense,
  );

  /**省略代码 */

  setupComponent(instance);

  /**省略代码 */

  setupRenderEffect(/** */);
};
```

::: note mountComponent

1. 创建 组件的 instance
2. 执行 组件中的 setup
3. 创建 组件的 renderEffect

:::

### createComponentInstance

```typescript
export function createComponentInstance(
  vnode: VNode,
  parent: ComponentInternalInstance | null,
  suspense: SuspenseBoundary | null,
) {
  /**省略 */
  const instance: ComponentInternalInstance = {
    /**省略 */
    propsOptions: normalizePropsOptions(type, appContext), // 正常化我们的 propsOptions, 因为我们 props 可以传对象也可以传数组, 需要统一处理成想要的样子
    /**省略 */
  };

  /**省略 */

  return instance;
}
```

::: code-tabs

@tab normalizePropsOptions

```typescript
export function normalizePropsOptions(
  comp: ConcreteComponent,
  appContext: AppContext,
  asMixin = false,
): NormalizedPropsOptions {
  const cache = appContext.propsCache; // 取缓存
  const cached = cache.get(comp); // 看是否有缓存
  if (cached) {
    // 有就直接返回
    return cached;
  }

  const raw = comp.props; // 取出 组件的 props
  const normalized: NormalizedPropsOptions[0] = {}; // props 会处理成对象形式
  const needCastKeys: NormalizedPropsOptions[1] = []; // { type: Boolean } 和包含 default 默认值的

  if (!raw) {
    // 没有定义props
    if (isObject(comp)) {
      // cache set 空数组
      cache.set(comp, EMPTY_ARR as any);
    }
    return EMPTY_ARR as any;
  }

  if (isArray(raw)) {
    for (let i = 0; i < raw.length; i++) {
      if (__DEV__ && !isString(raw[i])) {
        warn(`props must be strings when using array syntax.`, raw[i]);
      }
      const normalizedKey = camelize(raw[i]); // key 可以是连字符 (a-b-c) 也可以是 (abc) 统一成小驼峰
      if (validatePropName(normalizedKey)) {
        // 校验
        normalized[normalizedKey] = EMPTY_OBJ;
      }
    }
  } else if (raw) {
    // 是对象
    if (__DEV__ && !isObject(raw)) {
      warn(`invalid props options`, raw);
    }
    // 遍历
    for (const key in raw) {
      const normalizedKey = camelize(key); // 统一成小驼峰
      if (validatePropName(normalizedKey)) {
        const opt = raw[key]; // 因为 值可以是一个 构造器 也可以是一个对象 还可以是一个返回默认值的函数, 还可以是数组, 所以需要统一
        const prop: NormalizedProp = (normalized[normalizedKey] =
          isArray(opt) || isFunction(opt) ? { type: opt } : extend({}, opt));
        if (prop) {
          const booleanIndex = getTypeIndex(Boolean, prop.type); // 看type 是否包含(数组) 或者就是 Boolean
          const stringIndex = getTypeIndex(String, prop.type); // 看type 是否包含(数组) 或者就是 String
          prop[BooleanFlags.shouldCast] = booleanIndex > -1; // shouldCast 意味是否需要重铸, 这里可以看出来只是针对 Boolean
          prop[BooleanFlags.shouldCastTrue] =
            stringIndex < 0 || booleanIndex < stringIndex; //  Boolean 是否需要 重铸为 true 针对 <compA disabled /> 或者 <compA disabled="disabled" /> 这样应该 让disabled 生效
          if (booleanIndex > -1 || hasOwn(prop, 'default')) {
            // 只有存在 Boolean 或者有默认值才会 push
            needCastKeys.push(normalizedKey);
          }
        }
      }
    }
  }

  const res: NormalizedPropsOptions = [normalized, needCastKeys]; // 最后结果
  if (isObject(comp)) {
    // 设置缓存
    cache.set(comp, res);
  }
  return res;
}
```

:::

### setupComponent

```typescript
export function setupComponent(
  instance: ComponentInternalInstance,
  isSSR = false,
) {
  // ...
  const { props } = instance.vnode;
  // ...
  initProps(instance, props, isStateful, isSSR);
  // ...
}
```

这里我们还有个疑问 `instance.vnode.props` 也就是 vnode 的 `props` 哪来的? 答案是 `h` 方法的第二个参数

### h

```typescript
export function h(type: any, propsOrChildren?: any, children?: any): VNode {
  //省略
  return createVNode(/** */);
}
```

其实我们可以看出就是处理参数 然后传给 `createVNode`

::: code-tabs

@tab createVNode

```typescript
function _createVNode(
  type: VNodeTypes | ClassComponent | typeof NULL_DYNAMIC_COMPONENT,
  props: (Data & VNodeProps) | null = null,
  children: unknown = null,
  patchFlag: number = 0,
  dynamicProps: string[] | null = null,
  isBlockNode = false,
): VNode {
  // 代码省略

  // 这里开始就相当于 把 <compA  xxx="xxx" class="xxx" disabled="xxx" /> 拿到
  if (props) {
    props = guardReactiveProps(props)!; // 避免修改到 响应式的props
    let { class: klass, style } = props; // 处理 style class
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass); // 字符串是我们本来就要的, 所以我们需要处理 数组或者对象形式的
    }
    if (isObject(style)) {
      if (isProxy(style) && !isArray(style)) {
        style = extend({}, style);
      }
      props.style = normalizeStyle(style); // 同 class
    }
  }

  // 省略代码

  return createBaseVNode(
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    shapeFlag,
    isBlockNode,
    true,
  );
}
```

@tab createBaseVNode

```typescript
function createBaseVNode(
  type: VNodeTypes | ClassComponent | typeof NULL_DYNAMIC_COMPONENT,
  props: (Data & VNodeProps) | null = null,
  children: unknown = null,
  patchFlag = 0,
  dynamicProps: string[] | null = null,
  shapeFlag = type === Fragment ? 0 : ShapeFlags.ELEMENT,
  isBlockNode = false,
  needFullChildrenNormalization = false,
) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
  } as VNode;

  return vnode;
}
```

:::

这里我们 传入的就变成了 `vnode.props`

### initProps

```typescript
export function initProps(
  instance: ComponentInternalInstance,
  rawProps: Data | null,
  isStateful: number,
  isSSR = false,
) {
  const props: Data = {}; // 存放 组件中的 props
  const attrs: Data = {}; // 存放 除了 props 别的 如id class 啥的
  def(attrs, InternalObjectKey, 1); // 标记attrs 主要是防止污染

  instance.propsDefaults = Object.create(null); // 初始化默认props

  setFullProps(instance, rawProps, props, attrs); // 给所有的props 赋值

  // 因为有时候我们props 定义了 age 但是我们 <compA /> 没有接收到这个 age, 但是我们需要保证 props.age 不会报错, 所以赋值为undefined
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) {
      props[key] = undefined;
    }
  }

  instance.props = shallowReactive(props);
  instance.attrs = attrs;
}
```

::: code-tabs

@tab setFullProps

```ts
function setFullProps(
  instance: ComponentInternalInstance,
  rawProps: Data | null,
  props: Data,
  attrs: Data,
) {
  const [options, needCastKeys] = instance.propsOptions; // 拿到props配置
  let rawCastValues: Data | undefined;
  if (rawProps) {
    for (let key in rawProps) {
      // 过滤 ref, key 还有vnode的hook
      if (isReservedProp(key)) {
        continue;
      }

      const value = rawProps[key]; // 取值
      let camelKey;
      // key 可以能也是下划线的形式 但是我们options 是已经 小驼峰化的 所以这里也要小驼峰化
      if (options && hasOwn(options, (camelKey = camelize(key)))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          // needCastKeys 不存在或者不包含当前key
          props[camelKey] = value;
        } else {
          (rawCastValues || (rawCastValues = {}))[camelKey] = value; // 这里是为了处理 重铸的 Boolean 或者 包含默认值的
        }
      }
    }
  }

  if (needCastKeys) {
    const rawCurrentProps = toRaw(props); // 拿到最原始的props
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i = 0; i < needCastKeys.length; i++) {
      // 遍历 需要重铸的keys
      const key = needCastKeys[i];
      props[key] = resolvePropValue(
        options!,
        rawCurrentProps,
        key,
        castValues[key],
        instance,
        !hasOwn(castValues, key),
      );
    }
  }
}
```

@tab isReservedProp

```ts
export const isReservedProp = makeMap(
  ',key,ref,ref_for,ref_key,' +
    'onVnodeBeforeMount,onVnodeMounted,' +
    'onVnodeBeforeUpdate,onVnodeUpdated,' +
    'onVnodeBeforeUnmount,onVnodeUnmounted',
);
```

@tab resolvePropValue

```typescript
function resolvePropValue(
  options: NormalizedProps,
  props: Data,
  key: string,
  value: unknown,
  instance: ComponentInternalInstance,
  isAbsent: boolean,
) {
  const opt = options[key]; // 拿到对应值
  if (opt != null) {
    const hasDefault = hasOwn(opt, 'default'); // 看是否定义了 default
    if (hasDefault && value === undefined) {
      // 存在且没有 赋值
      const defaultValue = opt.default; // 拿到 defaultValue
      if (opt.type !== Function && isFunction(defaultValue)) {
        // 返回默认值我们需要注意 type 不能是function
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          // 是否存在
          value = propsDefaults[key];
        } else {
          setCurrentInstance(instance);
          // 调用获取 value
          value = propsDefaults[key] = defaultValue.call(
            __COMPAT__ &&
              isCompatEnabled(DeprecationTypes.PROPS_DEFAULT_THIS, instance)
              ? createPropsDefaultThis(instance, props, key)
              : null,
            props,
          );
          unsetCurrentInstance();
        }
      } else {
        value = defaultValue; // 不是方法 直接赋值
      }
    }

    // 重铸 Boolean
    if (opt[BooleanFlags.shouldCast]) {
      // 记得之前的代码 只有 booleanIndex > -1 才会为true, 所以这里是有 Boolean 才会进来
      if (isAbsent && !hasDefault) {
        // isAbsent 是否缺席 同时没有默认值
        value = false;
      } else if (
        opt[BooleanFlags.shouldCastTrue] &&
        (value === '' || value === hyphenate(key))
      ) {
        // 这就是 <compA disabled /> 或者 <compA disabled="disabled" />
        value = true;
      }
    }
  }
  return value;
}
```

:::

### patchProps

::: tip

其实我们最后主要看得都是 挂载到 dom 上的 属性, 所以我们 直接看 `mountElement` 中 `props` 那部分

```typescript
if (props) {
  for (const key in props) {
    if (key !== 'value' && !isReservedProp(key)) {
      hostPatchProp(/** */);
    }
  }
  if ('value' in props) {
    hostPatchProp(el, 'value', null, props.value);
  }
}
```

:::

```typescript
export const patchProp: DOMRendererOptions['patchProp'] = (
  el,
  key,
  prevValue,
  nextValue,
  isSVG = false,
  prevChildren,
  parentComponent,
  parentSuspense,
  unmountChildren,
) => {
  if (key === 'class') {
    // 处理 class
    patchClass(/** */);
  } else if (key === 'style') {
    // 处理 style
    patchStyle(/** */);
  } else if (isOn(key)) {
    // 处理自定义事件
    if (!isModelListener(key)) {
      // 过滤了 v-model
      patchEvent(/** */);
    }
  } else if (
    key[0] === '.'
      ? ((key = key.slice(1)), true)
      : key[0] === '^'
      ? ((key = key.slice(1)), false)
      : shouldSetAsProp(el, key, nextValue, isSVG)
  ) {
    // ^ 开头或者 .开头的key 会被强制当做 dom 的属性来 patch
    patchDOMProp(/** */);
  } else {
    // 特别处理  <input v-model type="checkbox"> with
    // :true-value & :false-value
    if (key === 'true-value') {
      (el as any)._trueValue = nextValue;
    } else if (key === 'false-value') {
      (el as any)._falseValue = nextValue;
    }
    patchAttr(/** */);
  }
};
```

::: code-tabs

@tab patchClass

```ts
export function patchClass(el: Element, value: string | null, isSVG: boolean) {
  // 如果被 transition 包裹 会有下面的属性
  const transitionClasses = (el as ElementWithTransition)._vtc;
  if (transitionClasses) {
    value = (
      value ? [value, ...transitionClasses] : [...transitionClasses]
    ).join(' ');
  }
  // 主要逻辑还是下面
  if (value == null) {
    // 没有值 删除
    el.removeAttribute('class');
  } else if (isSVG) {
    // svg 使用 class
    el.setAttribute('class', value);
  } else {
    // 给element 添加class 有三种方式
    /**
     * 1. el.classList
     * 2. el.setAttribute
     * 3. el.className
     *
     * 其中className 更好
     */
    el.className = value;
  }
}
```

@tab patchStyle

```typescript
export function patchStyle(el: Element, prev: Style, next: Style) {
  const style = (el as HTMLElement).style; // 获取dom 的style
  const isCssString = isString(next); // 判断新的style 是不是 string
  if (next && !isCssString) {
    // 是对象
    if (prev && !isString(prev)) {
      for (const key in prev) {
        if (next[key] == null) {
          // 在旧中不在新的中
          setStyle(style, key, '');
        }
      }
    }
    for (const key in next) {
      // 设置新的
      setStyle(style, key, next[key]);
    }
  } else {
    const currentDisplay = style.display;
    if (isCssString) {
      if (prev !== next) {
        // 两个字符串不相等 就重置为next
        style.cssText = next as string;
      }
    } else if (prev) {
      // 不存在新的 移出
      el.removeAttribute('style');
    }
    // 控制v-show的
    if ('_vod' in el) {
      style.display = currentDisplay;
    }
  }
}
```

@tab patchDOMProp

```typescript
export function patchDOMProp(
  el: any,
  key: string,
  value: any,
  prevChildren: any,
  parentComponent: any,
  parentSuspense: any,
  unmountChildren: any,
) {
  if (key === 'innerHTML' || key === 'textContent') {
    // 处理 innerHTML textContent 是需要调用 ummount 的
    if (prevChildren) {
      unmountChildren(prevChildren, parentComponent, parentSuspense);
    }
    el[key] = value == null ? '' : value;
    return;
  }

  if (
    key === 'value' &&
    el.tagName !== 'PROGRESS' &&
    !el.tagName.includes('-')
  ) {
    // 保存到 _value 上
    el._value = value;
    const newValue = value == null ? '' : value;
    // options 是需要强制更新的
    if (el.value !== newValue || el.tagName === 'OPTION') {
      el.value = newValue;
    }
    if (value == null) {
      el.removeAttribute(key);
    }
    return;
  }

  let needRemove = false;
  if (value === '' || value == null) {
    const type = typeof el[key];
    if (type === 'boolean') {
      // 处理布尔类型的
      value = includeBooleanAttr(value);
    } else if (value == null && type === 'string') {
      //  <div :id="null">
      value = '';
      needRemove = true;
    } else if (type === 'number') {
      // <img :width="null">
      value = 0;
      needRemove = true;
    }
  }

  // some properties perform value validation and throw,
  // some properties has getter, no setter, will error in 'use strict'
  // eg. <select :type="null"></select> <select :willValidate="null"></select>
  try {
    el[key] = value;
  } catch (e: any) {
    // do not warn if value is auto-coerced from nullish values
    if (__DEV__ && !needRemove) {
      warn(
        `Failed setting prop "${key}" on <${el.tagName.toLowerCase()}>: ` +
          `value ${value} is invalid.`,
        e,
      );
    }
  }
  needRemove && el.removeAttribute(key);
}
```

@tab patchAttr

```typescript
export function patchAttr(
  el: Element,
  key: string,
  value: any,
  isSVG: boolean,
  instance?: ComponentInternalInstance | null,
) {
  // 处理svg
  if (isSVG && key.startsWith('xlink:')) {
    if (value == null) {
      el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    const isBoolean = isSpecialBooleanAttr(key);
    if (value == null || (isBoolean && !includeBooleanAttr(value))) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, isBoolean ? '' : value);
    }
  }
}
```

:::
