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
