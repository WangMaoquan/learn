---
title: tapable 第二篇
date: 2023-09-04 11:36:17
tag:
  - tapable
category:
  - webpack
description: 简单深入一下 tapable
footer: true
---

<!-- more -->

# 准备

```shell
git clone https://github.com/webpack/tapable
cd tapable
yarn
```

# 项目结构

```
│  tapable.d.ts
│
├─lib
│  │  AsyncParallelBailHook.js
│  │  AsyncParallelHook.js
│  │  AsyncSeriesBailHook.js
│  │  AsyncSeriesHook.js
│  │  AsyncSeriesLoopHook.js
│  │  AsyncSeriesWaterfallHook.js
│  │  Hook.js
│  │  HookCodeFactory.js
│  │  HookMap.js
│  │  index.js
│  │  MultiHook.js
│  │  SyncBailHook.js
│  │  SyncHook.js
│  │  SyncLoopHook.js
│  │  SyncWaterfallHook.js
│  │  util-browser.js
│  │
│  └─__tests__
│
└─node_modules
```

目录很简单明了, 代码存放在 `lib` 目录下, 也有对应的 单测 `__tests__`, 单测其实也是我们学习的重要途径!

## 调试

你可以通过 `vscode` 的 `javascript调试终端` 在代码中打上断点, 然后通过 `node xxx.js` 来

## 阅读源码

我提过一嘴, 所有的 `XxxHook` 都是基于 `Hook` 这个类 来实现的, 所以我们可以先关注 `Hook.js`, `HookCodeFactory.js` 这两个文件

## Hook.js

先来看 Hook 这个类

```javascript
class Hook {
  constructor(args = [], name = undefined) {
    this._args = args;
    this.name = name;
    this.taps = [];
    this.interceptors = [];
    this._call = CALL_DELEGATE;
    this.call = CALL_DELEGATE;
    this._callAsync = CALL_ASYNC_DELEGATE;
    this.callAsync = CALL_ASYNC_DELEGATE;
    this._promise = PROMISE_DELEGATE;
    this.promise = PROMISE_DELEGATE;
    this._x = undefined;

    this.compile = this.compile;
    this.tap = this.tap;
    this.tapAsync = this.tapAsync;
    this.tapPromise = this.tapPromise;
  }

  compile(options) {
    /** */
  }

  _createCall(type) {
    /** */
  }

  _tap(type, options, fn) {
    /** */
  }

  tap(options, fn) {
    /** */
  }

  tapAsync(options, fn) {
    /** */
  }

  tapPromise(options, fn) {
    /** */
  }

  _runRegisterInterceptors(options) {
    /** */
  }

  withOptions(options) {
    /** */
  }

  isUsed() {
    /** */
  }

  intercept(interceptor) {
    /** */
  }

  _resetCompilation() {
    /** */
  }

  _insert(item) {
    /** */
  }
}
```

当我们执行 `new Hook` 会初始化一堆属性

- `_args` 保存的使我们传入的第一个参数
- `name` 是我们传入的第二个参数
- `taps` 和 `interceptors` 初始化为一个空数组
- `_call` 和 `call`, `_callAsync` 和 `callAsync`, `promise` 和 `_promise` 都初始化对应 `委托函数`
- `_x` 初始化为 undefined
- `complie, tap, tapAsync, tapPromise` 分别初始化为 `this.XXX`

对于前面几个的初始化我们或许没有太大的问题, 但是我们通过查看 `Hook` 时, 其实内部已经实现 `complie, tap, tapAsync, tapPromise` 那为啥 `constructor` 里面还要在赋值一遍呢?

定位到 `complie` 这个方法, 我们可以发现

```js
class Hook {
  /** */
  complie(options) {
    throw new Error('Abstract: should be overridden');
  }
  /** */
}
```

原来如此, 这个方法也就是需要我们的 `SyncXxx`, `AsyncXxx` 去实现, 这里我们记录一下

> 后续的 各类 Hook 都需要是实现 自己的 `compile`

### `tap, tapAsync, tapPromise`

实例化一个 `Hook` 后我们接着需要 注册对应的 钩子, 所以我们看看 `tap, tapAsync, tapPromise` 方法的实现

```javascript
class Hook {
  tap(options, fn) {
    this._tap('sync', options, fn);
  }

  tapAsync(options, fn) {
    this._tap('async', options, fn);
  }

  tapPromise(options, fn) {
    this._tap('promise', options, fn);
  }
}
```

我们发现三个方法其实都是调用的 `_tap` 这个方法, 我们进入 `_tap` 这个方法

### `_tap`

```javascript
class Hook {
  _tap(type, options, fn) {
    if (typeof options === 'string') {
      options = {
        name: options.trim(),
      };
    } else if (typeof options !== 'object' || options === null) {
      throw new Error('Invalid tap options');
    }
    if (typeof options.name !== 'string' || options.name === '') {
      throw new Error('Missing name for tap');
    }
    if (typeof options.context !== 'undefined') {
      deprecateContext();
    }
    options = Object.assign({ type, fn }, options);
    options = this._runRegisterInterceptors(options);
    this._insert(options);
  }
}
```

做了下面几件事

1. 对象化 `options`
2. 处理 特殊情况
3. 整合 `options`
4. 赋值为最新的 `options`, 这里的最新就是 `intercept` 的 `register` 钩子返回的 `options`
5. 调用 `_insert`

### `_insert`

```javascript
class Hook {
  _insert(item) {
    this._resetCompilation();
    let before;
    if (typeof item.before === 'string') {
      before = new Set([item.before]);
    } else if (Array.isArray(item.before)) {
      before = new Set(item.before);
    }
    let stage = 0;
    if (typeof item.stage === 'number') {
      stage = item.stage;
    }
    let i = this.taps.length;
    while (i > 0) {
      i--;
      const x = this.taps[i];
      this.taps[i + 1] = x;
      const xStage = x.stage || 0;
      if (before) {
        if (before.has(x.name)) {
          before.delete(x.name);
          continue;
        }
        if (before.size > 0) {
          continue;
        }
      }
      if (xStage > stage) {
        continue;
      }
      i++;
      break;
    }
    this.taps[i] = item;
  }
}
```

`insert` 插入, 也就是插入到 `taps` 的那个位置, 所以这个方法主要做的就是, 我们 `注册的回调`的 排序, 所以 `taps` 里面存放的就是 `normalize 后的 回调`

主要是 通过 `options` 中的 `stage` 和 `before` 字段决定的, 通过代码得知, `before` 的优先级比 `stage` 高

::: note 简单总结

`tap, tapAsync, tapPromise` 其实调用的都是内部的 `_tap` 方法

`_tap` 主要做的是 将参数处理成统一的对象形式, 处理主要有两种

1. 传入的基本配置
2. 通过 `interceptor` 的 `register` 钩子修改的配置

最后调用的 `_insert` 方法 根据 `options` 中的 `before` `stage` 参数排序, 存放进 `taps` 里面
:::

### intercept

处理 `options` 时 提到了 `interceptor`, 我们查看一下是怎么注册的

```javascript
class Hook {
  intercept(interceptor) {
    this._resetCompilation();
    this.interceptors.push(Object.assign({}, interceptor));
    if (interceptor.register) {
      for (let i = 0; i < this.taps.length; i++) {
        this.taps[i] = interceptor.register(this.taps[i]);
      }
    }
  }
}
```

主要做的就是 将 我们传入的 `interceptor`, 添加进 `interceptors` 里面,

然后判断 是否有 `register` 这个方法, 有就调用更新 `taps` 里面的每一项

::: tip 发现

我们发现, 在修改或者添加 tap 对象时, 都会调用 `this._resetCompilation()`

:::

### `_resetCompilation`

```javascript
class Hook {
  _resetCompilation() {
    this.call = this._call;
    this.callAsync = this._callAsync;
    this.promise = this._promise;
  }
}
```

::: note 猜想

主要做的就是重置 `call, callAsync, promise`

初始化时其实 我们会发现 `call` 与 `_call` 其实是一个方法, `callSync` 与 `_callAsync`, `promise` 与 `_promise` 也都是同一个方法, 所以为啥会这么去重置?

我是不是可以这么觉得?

`call` 在哪一步发生了改变?

下面就去印证我的猜想!

:::

我们先来看看 `call, _call, callAsync, _callAsync, promise, _promise` 的委托方法

::: code-tabs

@tab `call, _call`

```javascript
const CALL_DELEGATE = function (...args) {
  this.call = this._createCall('sync');
  return this.call(...args);
};
```

@tab `callAsync, _callAsync`

```javascript
const CALL_ASYNC_DELEGATE = function (...args) {
  this.call = this._createCall('async');
  return this.call(...args);
};
```

@tab `promise, _promise`

```javascript
const PROMISE_DELEGATE = function (...args) {
  this.promise = this._createCall('promise');
  return this.promise(...args);
};
```

:::

发现都指向 了`_createCall` 这个方法

### `_createCall`

```javascript
class Hook {
  _createCall(type) {
    return this.compile({
      taps: this.taps,
      interceptors: this.interceptors,
      args: this._args,
      type: type,
    });
  }
}
```

::: note 理解

`_createCall` 从名字来就是返回一个 触发 `taps` 里面的每一项 的方法

所以在 `委拖方法` 里, 需要将 `call/callAsync/promise` 指向返回的方法, 如果不重新指向, 也就是 多次调用`call/callAsync/promise` 就会多次去 `_createCall`, 简单的理解就是 `空间换时间`,

找到了`call/callAsync/promise` 赋值的地方, 我们也要知道哪些原因是需要去将 `call/callAsync/promise` 重置为 `委托函数`

通过 `this.compile` 的 参数就可以看出来, `taps, interceptor, args, type`,

但是实际上我们使用的时候 变化的最多的其实是 `taps`, 因为我们可以 无限次 `tap/tapAsync/tapPromise` 去注册

:::

下面我们去分析 `this.compile`

首先我们知道 `Hook 类` 的 `complie` 抛出的是一个异常, 所以 肯定是 `XxxHook` 实现了 `complie` 这个方法

我就拿 `SyncHook` 来看

```javascript
function SyncHook(args = [], name = undefined) {
  const hook = new Hook(args, name);
  hook.constructor = SyncHook;
  /** */
  hook.compile = COMPILE;
  return hook;
}

const COMPILE = function (options) {
  factory.setup(this, options);
  return factory.create(options);
};
```

我们注意到通过 `factory.create` 返回的 `compile`, 那么这个 `factory` 是啥, 还记得我最开始说的, `tapable` 最核心的两个 `Hook` 与 `HookCodeFactory` 嘛?

接下来我们瞅瞅 `HookCodeFactory` 是干啥的

## HookCodeFactory.js
