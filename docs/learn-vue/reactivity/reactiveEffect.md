---
title: reactiveEffect
date: 2023-03-12 09:37:54
tag:
  - vue
category:
  - vue
description: vue3.x 响应式的另外一个核心 reactiveEffect
footer: true
---

## 引入

`vue2.x` 的响应式 是通过 `Watcher`, `Observer`, `Dep` 来实现的 即 `观察者模式-发布订阅模式`

`Observer` 通过 `Object.defineProperty` 来劫持对象的 `key`
`Dep` 即依赖, 主要做两件事, `get` 时 收集依赖, `set` 时通知 `Watcher`
`Watcher` 接收到通知 调用自己的 `update` 去 触发 `render`(不一定都是`render`, 只是举个例子)

那么 `vue3.x` 呢?

1. `trigger`, `track` 实现了 `派发更新` 与 `收集依赖`
2. `targetMap` 实现了 依赖的对应关系
3. `reactiveEffect` 就是实现了调用 `render` (举例)部分

## 简单实现

::: code-tabs

@tab 初始化项目

```shell
pnpm init

pnpm i rollup -D

pnpm i rollup-typescript2 typescript -D

npx tsc --init
```

@tab src/index.ts

```typescript
console.log(123);
```

@tab rollup.config.mjs

```typescript
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
  },
  plugins: [typescript()],
};
```

@tab package.json

```json
{
  "scripts": {
    "build": "rollup --config"
  }
}
```

:::

> 有报错自己看报错信息

执行 `pnpm run build` 看是否生成了 `dist/bundle.js`

### Proxy 基础代码, 以及 reactive 简单实现

::: code-tabs

@tab src/baseHandlers.ts

```ts
import { track, trigger } from './effect';

function get(target: object, key: string | symbol, receiver: object) {
  const res = Reflect.get(target, key, receiver);

  track(target, key);

  return res;
}

function set(
  target: object,
  key: string | symbol,
  value: unknown,
  receiver: object,
): boolean {
  const result = Reflect.set(target, key, value, receiver);
  trigger(target, key);
  return result;
}

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
};
```

@tab src/reactive.ts

```typescript
import { mutableHandlers } from './baseHandlers';

export const reactiveMap = new WeakMap<object, any>();

export function reactive<T extends object>(target: T): T;
export function reactive(target: object) {
  if (target !== null && typeof target !== 'object') {
    return target;
  }
  const existingProxy = reactiveMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}
```

:::

### reactiveEffect 实现

1. 接收一个参数 `fn`
2. 需要有一个 `run` 方法 去执行 那个 `fn`
3. 还需要指明一个全局的 `activeReactiveEffect` 方便被收集

```typescript
class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {}
  run() {
    try {
      activeEffect = this;
      return this.fn();
    } finally {
      activeEffect = undefined;
    }
  }
}
```

### effect 实现

1. `effect` 应该和 `reactiveEffect` 一样接收一个 `fn`
2. `effect` 需要立刻执行
3. `effect` 需要返回一个 `runner`

```typescript
export interface ReactiveEffectRunner<T = any> {
  (): T;
  effect: ReactiveEffect;
}

export function effect<T = any>(fn: () => T): ReactiveEffectRunner {
  if ((fn as ReactiveEffectRunner).effect) {
    fn = (fn as ReactiveEffectRunner).effect.fn;
  }

  const _effect = new ReactiveEffect(fn);
  _effect.run();
  const runner = _effect.run.bind(_effect) as ReactiveEffectRunner;
  runner.effect = _effect;
  return runner;
}
```

### 实现 track

1. 接收一个`对象` 和 触发的 `key`
2. 获取 `key` 对应 的 `dep` , 然后 将当前的 `activeEffect` 收集进去

```typescript
export function track(target: object, key: unknown) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = new Set()));
    }
    dep!.add(activeEffect!);
  }
}
```

### 实现 trigger

1. 接收一个`对象` 和 触发的 `key`
2. 获取 `key` 对应 的 `dep` , 存进 `deps`
3. 遍历 deps, 并执行 `reactiveEffect` 的 `run` 方法

```typescript
export function trigger(target: object, key?: unknown) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let deps: (Dep | undefined)[] = [];

  if (key !== void 0) {
    deps.push(depsMap.get(key));
  }
  if (deps.length === 1) {
    if (deps[0]) {
      triggerEffects(deps[0]);
    }
  } else {
    const effects: ReactiveEffect[] = [];
    for (const dep of deps) {
      if (dep) {
        effects.push(...dep);
      }
    }
    triggerEffects(new Set(effects));
  }
}

export function triggerEffects(dep: Dep | ReactiveEffect[]) {
  const effects = Array.isArray(dep) ? dep : [...dep];

  for (const effect of effects) {
    if (effect !== activeEffect) {
      effect.run();
    }
  }
}
```

> [代码仓库](https://github.com/WangMaoquan/mini-reactiveEffect)
