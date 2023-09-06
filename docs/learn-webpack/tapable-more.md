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

```javascript
class HookCodeFactory {
  constructor(config) {
    /** */
  }

  create(options) {
    /** */
  }

  setup(instance, options) {
    /** */
  }

  init(options) {
    /** */
  }

  deinit() {
    /** */
  }

  contentWithInterceptors(options) {
    /** */
  }

  header() {
    /** */
  }

  needContext() {
    /** */
  }

  callTap(tapIndex, { onError, onResult, onDone, rethrowIfPossible }) {
    /** */
  }

  callTapsSeries({
    onError,
    onResult,
    resultReturns,
    onDone,
    doneReturns,
    rethrowIfPossible,
  }) {
    /** */
  }

  callTapsLooping({ onError, onDone, rethrowIfPossible }) {
    /** */
  }

  callTapsParallel({
    onError,
    onResult,
    onDone,
    rethrowIfPossible,
    onTap = (i, run) => run(),
  }) {
    /** */
  }

  args({ before, after } = {}) {
    /** */
  }

  getTapFn(idx) {
    /** */
  }

  getTap(idx) {
    /** */
  }

  getInterceptor(idx) {
    /** */
  }
}
```

### constructor & setup

```javascript
class HookCodeFactory {
  constructor(config) {
    this.config = config;
    this.options = undefined;
    this._args = undefined;
  }
  setup(instance, options) {
    instance._x = options.taps.map((t) => t.fn);
  }
}
```

`构造函数` 主要做的就是 `config, options, _args` 的初始化
`setup` 主要做的是对 `hook._x` 进行赋值

### create

```javascript
class HookCodeFactory {
  create(options) {
    this.init(options);
    let fn;
    switch (this.options.type) {
      case 'sync':
        fn = new Function(/** */);
        break;
      case 'async':
        fn = new Function(/** */);
        break;
      case 'promise':
        fn = new Function(/** */);
        break;
    }
    this.deinit();
    return fn;
  }
}
```

中间还有两个方法 `init` 与 `deinit`

::: code-tabs

@tab init

```javascript
function init(options) {
  this.options = options;
  this._args = options.args.slice();
}
```

@tab deinit

```javascript
function deinit() {
  this.options = undefined;
  this._args = undefined;
}
```

:::

这俩方法做的事情也就是 `options` 与 `_args` 的 `赋值` 与 `重置`

::: note create

回忆下 `options` 中的 字段

- `taps:` 存放注册回调整合后的对象的数组
- `interceptors:` 拦截器的数组
- `args:` 初始化传入的 参数数组
- `type:` sync/async/promise

create 的主要逻辑, 这么一看也就不复杂了, 如下:

1. 调用 `init` 初始化 `options` 与 `_args`
2. 通过 `options.type` 字段 生成对应的 `fn`
3. 调用 `deinit` 重置 `options` 与 `_args`
4. 返回 fn

:::

所以我们接下来关注的就是 `生成对应的 fn` 这个过程, 进一步之前, 先补充下 `new Function()` 的知识点

::: tip Function

`Function` 接收的参数其实就两个 `形参` 与 `函数体`, 具体怎么使用可以参考下面代码:

```javascript
const print = new Function(`console.log('decade')`);

print();

const add = new Function('a', 'b', `console.log(a + b)`);

add(2, 6);

let x = 10;

function createFunction1() {
  const x = 20;
  return new Function(`console.log(x)`);
}

createFunction1()();
```

可以看出 `new Function` 的最后一个参数是 `函数体`

还可以看出 `new Function` 中的作用域是 `全局作用域`

:::

所以其实 `create` 的第二步, 可以再细一点, 生成 `new Function` 要用到的 `形参`, 以及`函数体`,
下面我们具体看看那个 `switch(this.options.type)` 的 每个分支

::: code-tabs

@tab sync

```javascript
fn = new Function(
  this.args(),
  '"use strict";\n' +
    this.header() +
    this.contentWithInterceptors({
      onError: (err) => `throw ${err};\n`,
      onResult: (result) => `return ${result};\n`,
      resultReturns: true,
      onDone: () => '',
      rethrowIfPossible: true,
    }),
);
```

@tab async

```javascript
fn = new Function(
  this.args({
    after: '_callback',
  }),
  '"use strict";\n' +
    this.header() +
    this.contentWithInterceptors({
      onError: (err) => `_callback(${err});\n`,
      onResult: (result) => `_callback(null, ${result});\n`,
      onDone: () => '_callback();\n',
    }),
);
```

@tab promise

```javascript
let errorHelperUsed = false;
const content = this.contentWithInterceptors({
  onError: (err) => {
    errorHelperUsed = true;
    return `_error(${err});\n`;
  },
  onResult: (result) => `_resolve(${result});\n`,
  onDone: () => '_resolve();\n',
});
let code = '';
code += '"use strict";\n';
code += this.header();
code += 'return new Promise((function(_resolve, _reject) {\n';
if (errorHelperUsed) {
  code += 'var _sync = true;\n';
  code += 'function _error(_err) {\n';
  code += 'if(_sync)\n';
  code += '_resolve(Promise.resolve().then((function() { throw _err; })));\n';
  code += 'else\n';
  code += '_reject(_err);\n';
  code += '};\n';
}
code += content;
if (errorHelperUsed) {
  code += '_sync = false;\n';
}
code += '}));\n';
fn = new Function(this.args(), code);
```

:::

三部分代码 做的事情十分明确, 就是生成 `new Function()` 的 `形参` 与 `函数体`

注意其中的几个方法 `args`, `header`, `contentWithInterceptors`

`args` 对应的就是 `形参` 那部分嘛

`header` 和 `contentWithInterceptors` 就是 `函数体` 那部分

### args

```javascript
class HookCodeFactory {
  args({ before, after } = {}) {
    let allArgs = this._args;
    if (before) allArgs = [before].concat(allArgs);
    if (after) allArgs = allArgs.concat(after);
    if (allArgs.length === 0) {
      return '';
    } else {
      return allArgs.join(', ');
    }
  }
}
```

`args` 主要是生成 `Function` 的 `形参` 部分, 最后返回的 `所有参数` 的字符串,

我们传入的 `_args` 能代表 所有嘛? 不一定, 举例就是 `async` 的需要的形参会多一个 `cb`, 用于通知该 `异步任务已经完成`

这时, 我们也就是知道 解构出来的 `before`, `after` 接收的特殊的参数, 然后放在 `allArgs` 的 `头` 或者 `尾`

### header

```javascript
class HookCodeFactory {
  header() {
    let code = '';
    if (this.needContext()) {
      code += 'var _context = {};\n';
    } else {
      code += 'var _context;\n';
    }
    code += 'var _x = this._x;\n';
    if (this.options.interceptors.length > 0) {
      code += 'var _taps = this.taps;\n';
      code += 'var _interceptors = this.interceptors;\n';
    }
    return code;
  }
}
```

`header` 可以理解为 在函数里面 `声明变量` 那部分代码

比如 `var _x = this._x` 这里其实就是拿到, 我们注册的 `回调函数` 数组

如果传入的 `options.interceptors` 长度大于 0, 便会生成 `拦截器代码字符串`

### contentWithInterceptors

`contentWithInterceptors` 名字就能知道 代码的功能, 包含于不包含 `interceptors` 的 `content`

```javascript
class HookCodeFactory {
  contentWithInterceptors(options) {
    if (this.options.interceptors.length > 0) {
      const onError = options.onError;
      const onResult = options.onResult;
      const onDone = options.onDone;
      let code = '';
      for (let i = 0; i < this.options.interceptors.length; i++) {
        const interceptor = this.options.interceptors[i];
        if (interceptor.call) {
          code += `${this.getInterceptor(i)}.call(${this.args({
            before: interceptor.context ? '_context' : undefined,
          })});\n`;
        }
      }
      code += this.content(
        Object.assign(options, {
          onError:
            onError &&
            ((err) => {
              let code = '';
              for (let i = 0; i < this.options.interceptors.length; i++) {
                const interceptor = this.options.interceptors[i];
                if (interceptor.error) {
                  code += `${this.getInterceptor(i)}.error(${err});\n`;
                }
              }
              code += onError(err);
              return code;
            }),
          onResult:
            onResult &&
            ((result) => {
              let code = '';
              for (let i = 0; i < this.options.interceptors.length; i++) {
                const interceptor = this.options.interceptors[i];
                if (interceptor.result) {
                  code += `${this.getInterceptor(i)}.result(${result});\n`;
                }
              }
              code += onResult(result);
              return code;
            }),
          onDone:
            onDone &&
            (() => {
              let code = '';
              for (let i = 0; i < this.options.interceptors.length; i++) {
                const interceptor = this.options.interceptors[i];
                if (interceptor.done) {
                  code += `${this.getInterceptor(i)}.done();\n`;
                }
              }
              code += onDone();
              return code;
            }),
        }),
      );
      return code;
    } else {
      return this.content(options);
    }
  }
}
```

`withInterceptors` 到底是怎么去 `with` 的, 其实不难猜出来, 把 `interceptor` 对应的钩子, 拼接进 `content`

主要处理了 `onResult, onError, onDone` 这三个钩子

然后就是, 接下来的了 `content` 方法, 还记得在哪见过吗? `XxxHook.js` 中都会实现一个 继承自 `HookCodeFactory` 的 `Factory`, 其中刚好实现了 `this.content`

我们其实也注意到 `HookCodeFactory` 中还有着 `callTap`, `callTapsSeries`, `callTapsLooping`, `callTapsParallel` 这么几个 `call` 方法, 在哪里调用呢? 答案刚好就是 `this.content`

### content

还是拿的 `SyncHook` 中的

```javascript
class SyncHookCodeFactory extends HookCodeFactory {
  content({ onError, onDone, rethrowIfPossible }) {
    return this.callTapsSeries({
      onError: (i, err) => onError(err),
      onDone,
      rethrowIfPossible,
    });
  }
}
```

来, 正如我们所料, 主要就是调用 `callTapsXxxx` 方法, 下面我们进入 `callTapsXxx` 方法

### callTapsXxx

为啥只有 `callTapsSeries`, `callTapsLooping`, `callTapsParallel`, 却没有 `Waterfall`, `Bail`, 先留个疑问

::: code-tabs

@tab callTapsSeries

```javascript
function callTapsSeries({
  onError,
  onResult,
  resultReturns,
  onDone,
  doneReturns,
  rethrowIfPossible,
}) {
  if (this.options.taps.length === 0) return onDone(); // 没有注册直接返回 onDone
  // 找到第一个不是同步的 tap
  const firstAsync = this.options.taps.findIndex((t) => t.type !== 'sync');
  // 是否有返回值
  const somethingReturns = resultReturns || doneReturns;
  // code 初始化
  let code = '';
  // current 指向 onDone, 保留的就是 串联执行的 上一个 fn
  let current = onDone;
  // 同步方法是不需要 在生成的函数里面去调用下一个的, 所以这个代表着 异步 tap 之间 同步tap 的数量
  let unrollCounter = 0;
  // 遍历, 逆序 为啥要逆序? onDone 是不是应该由最后一个 fn 完成后去触发
  for (let j = this.options.taps.length - 1; j >= 0; j--) {
    const i = j;
    // 判断是否需要 生成 next
    const unroll =
      current !== onDone &&
      (this.options.taps[i].type !== 'sync' || unrollCounter++ > 20);
    if (unroll) {
      // 恢复为0
      unrollCounter = 0;
      code += `function _next${i}() {\n`;
      code += current();
      code += `}\n`;
      // 指向上一个 fn
      current = () => `${somethingReturns ? 'return ' : ''}_next${i}();\n`;
    }
    const done = current;
    const doneBreak = (skipDone) => {
      if (skipDone) return '';
      return onDone();
    };
    // 每一部分都要调用 callTap 去生成
    const content = this.callTap(i, {
      onError: (error) => onError(i, error, done, doneBreak),
      onResult:
        onResult &&
        ((result) => {
          return onResult(i, result, done, doneBreak);
        }),
      onDone: !onResult && done,
      rethrowIfPossible:
        rethrowIfPossible && (firstAsync < 0 || i < firstAsync),
    });
    // 指向 处理完成的 content
    current = () => content;
  }
  code += current();
  return code;
}
```

@tab callTapsLooping

```javascript
function callTapsLooping({ onError, onDone, rethrowIfPossible }) {
  if (this.options.taps.length === 0) return onDone();
  // 是否全部都是 同步
  const syncOnly = this.options.taps.every((t) => t.type === 'sync');
  let code = '';
  if (!syncOnly) {
    code += 'var _looper = (function() {\n';
    code += 'var _loopAsync = false;\n';
  }
  code += 'var _loop;\n';
  code += 'do {\n';
  code += '_loop = false;\n';
  // 拼接 interceptor 的 loop
  for (let i = 0; i < this.options.interceptors.length; i++) {
    const interceptor = this.options.interceptors[i];
    if (interceptor.loop) {
      code += `${this.getInterceptor(i)}.loop(${this.args({
        before: interceptor.context ? '_context' : undefined,
      })});\n`;
    }
  }
  // 调用 callTapsSeries
  code += this.callTapsSeries({
    onError,
    onResult: (i, result, next, doneBreak) => {
      let code = '';
      code += `if(${result} !== undefined) {\n`;
      code += '_loop = true;\n';
      if (!syncOnly) code += 'if(_loopAsync) _looper();\n';
      code += doneBreak(true);
      code += `} else {\n`;
      code += next();
      code += `}\n`;
      return code;
    },
    onDone:
      onDone &&
      (() => {
        let code = '';
        code += 'if(!_loop) {\n';
        code += onDone();
        code += '}\n';
        return code;
      }),
    rethrowIfPossible: rethrowIfPossible && syncOnly,
  });
  code += '} while(_loop);\n';
  if (!syncOnly) {
    code += '_loopAsync = true;\n';
    code += '});\n';
    code += '_looper();\n';
  }
  return code;
}
```

@tab callTapsParallel

```javascript
function callTapsParallel({
  onError,
  onResult,
  onDone,
  rethrowIfPossible,
  onTap = (i, run) => run(),
}) {
  // 只有一个或者没有的情况 视为串联
  if (this.options.taps.length <= 1) {
    return this.callTapsSeries({
      onError,
      onResult,
      onDone,
      rethrowIfPossible,
    });
  }
  let code = '';
  code += 'do {\n';
  code += `var _counter = ${this.options.taps.length};\n`;
  if (onDone) {
    code += 'var _done = (function() {\n';
    code += onDone();
    code += '});\n';
  }
  for (let i = 0; i < this.options.taps.length; i++) {
    const done = () => {
      if (onDone) return 'if(--_counter === 0) _done();\n';
      else return '--_counter;';
    };
    const doneBreak = (skipDone) => {
      if (skipDone || !onDone) return '_counter = 0;\n';
      else return '_counter = 0;\n_done();\n';
    };
    code += 'if(_counter <= 0) break;\n';
    code += onTap(
      i,
      () =>
        this.callTap(i, {
          onError: (error) => {
            let code = '';
            code += 'if(_counter > 0) {\n';
            code += onError(i, error, done, doneBreak);
            code += '}\n';
            return code;
          },
          onResult:
            onResult &&
            ((result) => {
              let code = '';
              code += 'if(_counter > 0) {\n';
              code += onResult(i, result, done, doneBreak);
              code += '}\n';
              return code;
            }),
          onDone:
            !onResult &&
            (() => {
              return done();
            }),
          rethrowIfPossible,
        }),
      done,
      doneBreak,
    );
  }
  code += '} while(false);\n';
  return code;
}
```

简单的注释了一下, 但是我们知道, 最主要的还是 `callTap`

### callTap

```javascript
class HookCodeFactory {
  callTap(tapIndex, { onError, onResult, onDone, rethrowIfPossible }) {
    let code = '';
    let hasTapCached = false;
    for (let i = 0; i < this.options.interceptors.length; i++) {
      const interceptor = this.options.interceptors[i];
      if (interceptor.tap) {
        if (!hasTapCached) {
          code += `var _tap${tapIndex} = ${this.getTap(tapIndex)};\n`;
          hasTapCached = true;
        }
        code += `${this.getInterceptor(i)}.tap(${
          interceptor.context ? '_context, ' : ''
        }_tap${tapIndex});\n`;
      }
    }
    code += `var _fn${tapIndex} = ${this.getTapFn(tapIndex)};\n`;
    const tap = this.options.taps[tapIndex];
    switch (tap.type) {
      case 'sync':
        if (!rethrowIfPossible) {
          code += `var _hasError${tapIndex} = false;\n`;
          code += 'try {\n';
        }
        if (onResult) {
          code += `var _result${tapIndex} = _fn${tapIndex}(${this.args({
            before: tap.context ? '_context' : undefined,
          })});\n`;
        } else {
          code += `_fn${tapIndex}(${this.args({
            before: tap.context ? '_context' : undefined,
          })});\n`;
        }
        if (!rethrowIfPossible) {
          code += '} catch(_err) {\n';
          code += `_hasError${tapIndex} = true;\n`;
          code += onError('_err');
          code += '}\n';
          code += `if(!_hasError${tapIndex}) {\n`;
        }
        if (onResult) {
          code += onResult(`_result${tapIndex}`);
        }
        if (onDone) {
          code += onDone();
        }
        if (!rethrowIfPossible) {
          code += '}\n';
        }
        break;
      case 'async':
        let cbCode = '';
        if (onResult)
          cbCode += `(function(_err${tapIndex}, _result${tapIndex}) {\n`;
        else cbCode += `(function(_err${tapIndex}) {\n`;
        cbCode += `if(_err${tapIndex}) {\n`;
        cbCode += onError(`_err${tapIndex}`);
        cbCode += '} else {\n';
        if (onResult) {
          cbCode += onResult(`_result${tapIndex}`);
        }
        if (onDone) {
          cbCode += onDone();
        }
        cbCode += '}\n';
        cbCode += '})';
        code += `_fn${tapIndex}(${this.args({
          before: tap.context ? '_context' : undefined,
          after: cbCode,
        })});\n`;
        break;
      case 'promise':
        code += `var _hasResult${tapIndex} = false;\n`;
        code += `var _promise${tapIndex} = _fn${tapIndex}(${this.args({
          before: tap.context ? '_context' : undefined,
        })});\n`;
        code += `if (!_promise${tapIndex} || !_promise${tapIndex}.then)\n`;
        code += `  throw new Error('Tap function (tapPromise) did not return promise (returned ' + _promise${tapIndex} + ')');\n`;
        code += `_promise${tapIndex}.then((function(_result${tapIndex}) {\n`;
        code += `_hasResult${tapIndex} = true;\n`;
        if (onResult) {
          code += onResult(`_result${tapIndex}`);
        }
        if (onDone) {
          code += onDone();
        }
        code += `}), function(_err${tapIndex}) {\n`;
        code += `if(_hasResult${tapIndex}) throw _err${tapIndex};\n`;
        code += onError(`_err${tapIndex}`);
        code += '});\n';
        break;
    }
    return code;
  }
}
```

主要的逻辑就是根据对应的 `type` 生成最基本的 `fn`

::: code-tabs

@tab sync-no-throw-code

```javascript
function anonymous(name) {
  'use strict';
  var _context;
  var _x = this._x;
  var _taps = this.taps;
  var _interceptors = this.interceptors;
  var _tap0 = _taps[0];
  _interceptors[0].tap(_tap0);
  var _fn0 = _x[0];
  _fn0(name);
  var _tap1 = _taps[1];
  _interceptors[0].tap(_tap1);
  var _fn1 = _x[1];
  _fn1(name);
  var _tap2 = _taps[2];
  _interceptors[0].tap(_tap2);
  var _fn2 = _x[2];
  _fn2(name);
}
```

@tab sync-code

```javascript
function anonymous(name) {
  'use strict';
  var _context;
  var _x = this._x;
  var _taps = this.taps;
  var _interceptors = this.interceptors;
  var _tap0 = _taps[0];
  _interceptors[0].tap(_tap0);
  var _fn0 = _x[0];
  _fn0(name);
  var _tap1 = _taps[1];
  _interceptors[0].tap(_tap1);
  var _fn1 = _x[1];
  _fn1(name);
  var _tap2 = _taps[2];
  _interceptors[0].tap(_tap2);
  var _fn2 = _x[2];
  _fn2(name);
}
```

@tab async-code

```javascript
function anonymous(name, _callback) {
  'use strict';
  var _context;
  var _x = this._x;
  var _taps = this.taps;
  var _interceptors = this.interceptors;
  var _tap0 = _taps[0];
  _interceptors[0].tap(_tap0);
  var _fn0 = _x[0];
  var _hasError0 = false;
  try {
    _fn0(name);
  } catch (_err) {
    _hasError0 = true;
    _callback(_err);
  }
  if (!_hasError0) {
    var _tap1 = _taps[1];
    _interceptors[0].tap(_tap1);
    var _fn1 = _x[1];
    var _hasError1 = false;
    try {
      _fn1(name);
    } catch (_err) {
      _hasError1 = true;
      _callback(_err);
    }
    if (!_hasError1) {
      var _tap2 = _taps[2];
      _interceptors[0].tap(_tap2);
      var _fn2 = _x[2];
      var _hasError2 = false;
      try {
        _fn2(name);
      } catch (_err) {
        _hasError2 = true;
        _callback(_err);
      }
      if (!_hasError2) {
        _callback();
      }
    }
  }
}
```

@tab promise-code

```javascript
function anonymous(name) {
  'use strict';
  var _context;
  var _x = this._x;
  var _taps = this.taps;
  var _interceptors = this.interceptors;
  return new Promise(function (_resolve, _reject) {
    var _sync = true;
    function _error(_err) {
      if (_sync)
        _resolve(
          Promise.resolve().then(function () {
            throw _err;
          }),
        );
      else _reject(_err);
    }
    var _tap0 = _taps[0];
    _interceptors[0].tap(_tap0);
    var _fn0 = _x[0];
    var _hasError0 = false;
    try {
      _fn0(name);
    } catch (_err) {
      _hasError0 = true;
      _error(_err);
    }
    if (!_hasError0) {
      var _tap1 = _taps[1];
      _interceptors[0].tap(_tap1);
      var _fn1 = _x[1];
      var _hasError1 = false;
      try {
        _fn1(name);
      } catch (_err) {
        _hasError1 = true;
        _error(_err);
      }
      if (!_hasError1) {
        var _tap2 = _taps[2];
        _interceptors[0].tap(_tap2);
        var _fn2 = _x[2];
        var _hasError2 = false;
        try {
          _fn2(name);
        } catch (_err) {
          _hasError2 = true;
          _error(_err);
        }
        if (!_hasError2) {
          _resolve();
        }
      }
    }
    _sync = false;
  });
}
```

:::

举的例子都是 串联执行的

```javascript
// const hook = new AsyncSeriesHook(['name']);
const hook = new SyncHook(['name']);
hook.intercept({
  tap(tap) {
    console.log('tap', tap);
  },
});
hook.tap('t1', () => console.log('t1'));
hook.tap('t2', () => console.log('t2'));
hook.tap('t3', () => console.log('t3'));
console.log(hook._createCall('sync').toString());

// console.log(hook._createCall('async').toString());
// console.log(hook._createCall('promise').toString());
```
