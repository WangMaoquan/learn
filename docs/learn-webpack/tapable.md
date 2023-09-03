---
title: 认识 tapable
date: 2023-08-28 16:24:56
tag:
  - webpack
  - tapable
category:
  - webpack
description: tapable 从0到1
footer: true
---

### tapable 是什么?

当我们自己写 webpack 插件的时候, 都会使用到 `complier.hook.eventType.tap()` 这样的代码去注册事件, 比如[官方给的例子](https://webpack.docschina.org/contribute/writing-a-plugin/#creating-a-plugin), 下面我自己举的例子

```typescript
class Myplugin {
  // 主要是实现 apply 方法
  apply(complier) {
    compiler.hooks.emit.tap('my-plugin', () => {});
  }
}
```

其实这就是 `tapable` 的应用, 你也可以理解为 是一个类似于 `Node.js` 中的 `EventEmitter` 的库
我们主要是 通过 `tapable` 我们可以注册自定义事件，然后在适当的时机去执行自定义事件

#### tapable 钩子分类

下面是[官方文档](https://github.com/webpack/tapable)给的代码

```javascript
const {
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  SyncLoopHook,
  AsyncParallelHook,
  AsyncParallelBailHook,
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook,
} = require('tapable');
```

根据上面的钩子名称, 其实也很好分类了

1. `Sync` 代表的同步钩子, 然后同步又分为四种(其实就是 hook 的执行机制)
   - SyncHook 普通的同步钩子
   - SyncBailHook `bail 从……中摆脱出来`, 也就是中断的钩子, 一旦 hook 返回值不为 undefined 则跳出
   - SyncWaterfallHook `waterfall 瀑布` 瀑布类型的钩子, 上一个 hook 的执行结果不是 undefined 就会作为下一个 hook 的第一个参数
   - SyncLoopHook `loop 循环` 循环类型钩子, 直到执行到 hook 的返回值 为 undefined
2. `Async` 代表异步钩子, 异步的话我们需要考虑是并行还是串联所以多了 `Parallel(并行)` 与 `Series(串联)`
   - AsyncParallelHook 异步并行普通钩子
   - AsyncParallelBailHook 异步并行中断钩子
   - AsyncSeriesHook 异步串联普通钩子
   - AsyncSeriesBailHook 异步串联中断钩子
   - AsyncSeriesWaterfallHook 异步串联瀑布钩子
   - AsyncSeriesLoopHook 异步循环钩子

#### 方法使用

tapable 所有的 xxxHook 都基于 `Hook` 这个类去扩展, 比如 `SyncXXXHook` 实现了 `tap` 与 `call`, 而 `AsyncXXXHook` 实现了 `tapAsync/tapPromise` 与 `callAsync/promise`

所以简单说些 `Hook` 类上的 几个属性

```typescript
declare class Hook<T, R, AdditionalOptions = UnsetAdditionalOptions> {
  constructor(args?: ArgumentNames<AsArray<T>>, name?: string); // 第一个参数接收一个数组, 第二个参数接收一个字符串
  name: string | undefined; // 第二个参数保存的 name
  taps: FullTap[]; // 通过 tap/tapAsync/tapPromise 注册的钩子 统一处理后存放的位置
  intercept(interceptor: HookInterceptor<T, R, AdditionalOptions>): void; // 拦截器, 可以类比下 axios 的 拦截器
  isUsed(): boolean; // 是否使用
  callAsync(...args: Append<AsArray<T>, Callback<Error, R>>): void; // 触发异步钩子
  promise(...args: AsArray<T>): Promise<R>; // 触发异步钩子
  tap(
    options: string | (Tap & IfSet<AdditionalOptions>),
    fn: (...args: AsArray<T>) => R,
  ): void; // 收集同步钩子
  withOptions(
    options: TapOptions & IfSet<AdditionalOptions>,
  ): Omit<this, 'call' | 'callAsync' | 'promise'>; // 传入 options 整合 FullTap
}
```

::: code-tabs

@tab SyncHook

```ts
import { SyncHook } from 'tapable';

const hook = new SyncHook(['name']);

hook.tap('tap', (name) => {
  console.log('name', name);
});

hook.tap('tap1', (name) => {
  console.log('name1', name);
});

hook.call('decade');
```

@tab SyncBailHook

```ts
import { SyncBailHook } from 'tapable';

const hook = new SyncBailHook(['name']);

hook.tap('tap', (name) => {
  console.log('name', name);
  return 'tap'; // 这个返回值不是 undefined 所以不会触发 tap1
});

hook.tap('tap1', (name) => {
  console.log('name1', name); // 这个不会打印
});

hook.call('decade');
```

@tab SyncWaterfallHook

```ts
import { SyncWaterfallHook } from 'tapable';

// 需要注意的 SyncWaterfallHook 的第一个参数是必须得
const hook = new SyncWaterfallHook(['name']);
const result: string[] = [];
const tap1 = (name: string) => {
  result.push(name); // decade
  return 'zio';
};

// 没有返回值
const tap2 = (name: string) => {
  result.push(name); // zio
};

//
const tap3 = (name: string) => {
  result.push(name); // zio
};

hook.tap('tap1', tap1);
hook.tap('tap2', tap2);
hook.tap('tap3', tap3);

hook.call('decade');

// result ["decade", "zio", "zio"]
```

@tab SyncLoopHook

```ts
const hook = new SyncLoopHook();
const result: string[] = []; // tap1 5, tap1 4, tap1 3, tap2 3, tap1 2, tap2 tap3 2 tap1 1 tap 2 1 tap3 1
let count = 5;
const tap1 = () => {
  result.push(`tap1: ${count}`);
  if ([1, 2, 3].includes(count)) {
    return undefined;
  } else {
    count--;
    return 'tap1';
  }
};
const tap2 = () => {
  result.push(`tap2: ${count}`);
  if ([1, 2].includes(count)) {
    return undefined;
  } else {
    count--;
    return 'tap2';
  }
};
const tap3 = () => {
  result.push(`tap3: ${count}`);
  if (count === 1) {
    return undefined;
  } else {
    count--;
    return 'tap3';
  }
};

hook.tap('tap1', tap1);
hook.tap('tap2', tap2);
hook.tap('tap3', tap3);

hook.call(undefined);
```

@tab AsyncParallelHook

```ts
const hook = new AsyncParallelHook(['name']);
const tap1 = (name, cb) => {
  // 执行 cb 就代表这个 异步 完成
  setTimeout(() => {
    cb();
  }, 1000);
};
hook.tapAsync('tap1', tap1);
hook.callAsync('decade', (error, result) => {
  console.log('error', error);
  console.log('result', result);
});
```

@tab AsyncParallelBailHook

```ts
import { SyncHook } from 'tapable';

const hook = new AsyncParallelBailHook(['name']);
const result: string[] = [];

// tap1 没有返回值
hook.tapAsync('tap1', (name, cb) => {
  setTimeout(() => {
    cb();
  }, 1000);
});

// 就算 tap3 比 tap2 快 也是返回 tap3
hook.tapAsync('tap3', (name, cb) => {
  setTimeout(() => {
    cb(null, 'tap3 返回值');
  }, 2000);
});

hook.tapAsync('tap2', (name, cb) => {
  setTimeout(() => {
    cb(null, 'tap2 返回值');
  }, 1500);
});

hook.callAsync('decade', (e, r) => {
  console.log(r, 'r');
  result.push(r); // tap3 返回值
});
```

@tab AsyncSeriesHook

```ts
import { AsyncSeriesHook } from 'tapable';

const hook = new AsyncSeriesHook(['name']);

hook.tapAsync('tap1', (name, cb) => {
  console.log('tap1');
  setTimeout(() => {
    console.log('tap1 ex');
    cb();
  }, 1000);
});

hook.tapAsync('tap2', (name, cb) => {
  console.log('tap2');
  setTimeout(() => {
    console.log('tap2 ex');
    cb();
  }, 2000);
});

hook.tapAsync('tap3', (name, cb) => {
  console.log('tap3');
  setTimeout(() => {
    console.log('tap3 ex');
    cb();
  }, 3000);
});

hook.callAsync('decade', (error, result) => {
  console.log('error', error);
  console.log('result', result);
});
```

@tab AsyncSeriesBailHook

```ts
import { AsyncSeriesBailHook } from 'tapable';

const hook = new AsyncSeriesBailHook(['name']);

hook.tapAsync('tap1', (name, cb) => {
  console.log('tap1');
  setTimeout(() => {
    console.log('tap1 ex');
    cb();
  }, 1000);
});

hook.tapAsync('tap2', (name, cb) => {
  console.log('tap2');
  setTimeout(() => {
    console.log('tap2 ex');
    cb(null, 'tap2');
  }, 2000);
});

hook.tapAsync('tap3', (name, cb) => {
  console.log('tap3');
  setTimeout(() => {
    console.log('tap3 ex');
    cb(null, 'tap3');
  }, 3000);
});

hook.callAsync('decade', (error, result) => {
  console.log('error', error);
  console.log('result', result);
});
```

@tab AsyncSeriesWaterfallHook

```ts
import { AsyncSeriesWaterfallHook } from 'tapable';

const hook = new AsyncSeriesWaterfallHook(['name']);

hook.tapAsync('tap1', (name, cb) => {
  setTimeout(() => {
    console.log(`tap1: ${name}`);
    cb(null, 'zio');
  }, 1000);
});

hook.tapAsync('tap2', (name, cb) => {
  setTimeout(() => {
    console.log(`tap2: ${name}`);
    cb();
  }, 2000);
});

hook.tapAsync('tap3', (name, cb) => {
  setTimeout(() => {
    console.log(`tap3: ${name}`);
    cb(null, 'build');
  }, 3000);
});

hook.callAsync('decade', (error, result) => {
  console.log('error', error);
  console.log('result', result);
});
```

:::

#### interceptor

我们可以先看 类型

```ts
interface HookInterceptor<T, R, AdditionalOptions = UnsetAdditionalOptions> {
  name?: string;
  tap?: (tap: FullTap & IfSet<AdditionalOptions>) => void;
  call?: (...args: any[]) => void;
  loop?: (...args: any[]) => void;
  error?: (err: Error) => void;
  result?: (result: R) => void;
  done?: () => void;
  register?: (
    tap: FullTap & IfSet<AdditionalOptions>,
  ) => FullTap & IfSet<AdditionalOptions>;
}
```

通过上面的类型, 我们可以 看出 其中的 `7个key` 是去触发拦截, 分别是 `tap, call, loop, error, result, done, register`, 下面我们来举例

::: code-tabs

@tab base

```ts
const hook = new SyncHook(['name']);

const tap1 = (name) => {
  console.log(name, 'name');
};

hook.intercept({
  tap(tap) {
    // 在 tap 这个 拦截器钩子 可以在里面访问到 tap 对象 也就是 保存在 taps 中的那个数据结构, 切记不要改变 对象
    console.log(tap, 'tap-tap');
  },
  call(...args) {
    // call 拦截器钩子 可以访问到 传入的参数
    console.log(args, 'call-args');
  },
  loop(...args) {
    // 不是 loop 的不会触发
    console.log(args, 'loop-args');
  },
  register(tap) {
    // 这个钩子是可以修改 tap 的信息的, 根据打印我们可以看出最先执行
    console.log(tap, 'tap-register');
    return tap;
  },
  error(err) {
    // 猜测是 异步的 error
    console.log(err, 'err');
  },
  done() {
    // 会在 tap 调用 完成之后执行
    console.log('done');
  },
  result(result) {
    // 可能是有返回值的
    console.log(result, 'result');
  },
});

hook.tap('tap1', tap1);

hook.call('decade');
```

@tab loop

```ts
const hook = new SyncLoopHook(['name']);
const result: string[] = [];
let count = 5;
const tap1 = () => {
  result.push(`tap1: ${count}`);
  if ([1, 2, 3].includes(count)) {
    return undefined;
  } else {
    count--;
    return 'tap1';
  }
};
const tap2 = () => {
  result.push(`tap2: ${count}`);
  if ([1, 2].includes(count)) {
    return undefined;
  } else {
    count--;
    return 'tap2';
  }
};
const tap3 = () => {
  result.push(`tap3: ${count}`);
  if (count === 1) {
    return undefined;
  } else {
    count--;
    return 'tap3';
  }
};

hook.tap('tap1', tap1);
hook.tap('tap2', tap2);
hook.tap('tap3', tap3);

hook.intercept({
  loop(...args) {
    console.log(args, 'loop-args');
  },
  tap(tap) {
    console.log('loop-tap', tap);
  },
});

hook.call('decade');
```

@tab result

```ts
const hook = new AsyncSeriesBailHook(['name']);

hook.tapAsync('tap1', (name, cb) => {
  setTimeout(() => {
    cb(null, 'tap1');
  }, 2000);
});

hook.tapAsync('tap2', (name, cb) => {
  setTimeout(() => {
    cb(null, 'tap2');
  }, 1000);
});

hook.intercept({
  result(result) {
    // 这里获取到的就是 callAsync 回调的 result
    console.log('result', result);
  },
});

hook.callAsync('decade', (error, result) => {
  console.log(result);
});
```

@tab error

```ts
const hook = new AsyncSeriesBailHook(['name']);

hook.tapAsync('tap1', (name, cb) => {
  setTimeout(() => {
    cb(Error('1'));
  }, 2000);
});

hook.intercept({
  error(err) {
    // 这里获取到到就是 cb 的 error
    console.log(err, 'err');
  },
});

hook.callAsync('decade', (error, result) => {
  console.log(error);
});
```

:::
