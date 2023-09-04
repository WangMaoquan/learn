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

## HookCodeFactory.js
