---
title: scheduler
date: 2023-03-14 09:13:51
tag:
  - vue
category:
  - vue
description: 实现一个任务调度器
footer: true
---

## 引入

`任务的调度`决定了组件 `update` 的 顺序, 决定了我们通过 `watchOptions` 配置, 执行 `cb` 的时机, 解决了例如 `echarts` 为啥需要 `nextTick` 才能 `渲染` 出来结果

由此可见, 任务的调度 是很重要的(ps: hhhh)

### scheduler

1. 我们需要一个`全局的容器`来保存我们的任务队列
2. 一次执行中, 我们需要保证只有一个`promise`
3. 执行中需要根据 id 来排序执行
4. 执行完我们需要重置状态

```typescript
interface SchedulerJob extends Function {
  id?: number;
}

type SchedulerJobs = SchedulerJob | SchedulerJob[];

// 保存 任务队列的 queue
const queue: SchedulerJobs = [];

// flush 之前的 是否等待状态 的标志
let isFlushPending = false;

// 是否flush 中 的标志
let isFlushing = false;

// 添加进队列的方法
function queueJob(job: SchedulerJob) {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true;
    Promise.resolve().then(flushJobs);
  }
}

// 处理id
const getId = (job: SchedulerJob): number =>
  job.id == null ? Infinity : job.id;

// sort 传入的比较函数
const comparator = (a: SchedulerJob, b: SchedulerJob): number => {
  return getId(a) - getId(b);
};

function flushJobs() {
  isFlushPending = false; // 结束 flush 准备状态
  isFlushing = true; // 开始冲刷

  queue.sort(comparator);

  try {
    for (let flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue(flushIndex);
      if (job) {
        job();
      }
    }
  } finally {
    queue.length = 0;
    isFlushing = false;
  }
}
```

### 实现 preJob

`preJob` 比 `id`拥有更高的优先级, `watchOptions` 的 `flush: 'pre'` 能用到, 同时注意 `preJob`的 `id` 一定是存在的

1. 既然比 `id` 拥有更高的优先级, 我们在 比较 `id` 的时候
2. 还有就是 `push` 进 `queue` 时 需要判断一下

```typescript {3,6,8-17,21-25,32-35,41,46}
interface SchedulerJob extends Function {
  // 省略
  id?: number;
}

let flushIndex = 0;

function findInsertionIndex(id: number) {
  let start = flushIndex + 1;
  let end = queue.length;
  while (start < end) {
    const middle = (start + end) >>> 1;
    const middleJobId = getId(queue[middle]);
    middleJobId < id ? (start = middle + 1) : (end = middle);
  }
  return start;
}

function queueJob(job: SchedulerJob) {
  if (!queue.length || !queue.includes(job)) {
    if (job.id == null) {
      queue.push(job);
    } else {
      queue.splice(findInsertionIndex(job.id), 0, job);
    }
    queueFlush();
  }
}

const comparator = (a: SchedulerJob, b: SchedulerJob): number => {
  const diff = getId(a) - getId(b);
  if (diff === 0) {
    if (a.pre && !b.pre) return -1;
    if (b.pre && !a.pre) return 1;
  }
  return diff;
};

function flushJobs() {
  // 省略代码
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      // 省略代码
    }
  } finally {
    // 省略代码
    flushIndex = 0;
  }
}
```

### 实现 nextTick

本质就是一个 Promise.resolve

```typescript {11,20}
const resolvedPromise = Promise.resolve() as Promise<any>; // 就是 Promise.resolve() 方法, 避免每次 queueFlush 重复创建
let currentFlushPromise: Promise<void> | null = null; // 当前正在 flush 的promise

function nextTick<T = void>(this: T, fn?: (this: T) => void): Promise<void> {
  const p = currentFlushPromise || resolvedPromise;
  return fn ? p.then(this ? fn.bind(this) : fn) : p;
}

function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true;
    currentFlushPromise = resolvedPromise.then(flushJobs); // 赋值
  }
}

function flushJobs() {
  try {
    // 遍历执行
  } finally {
    currentFlushPromise = null; // 重置
  }
}
```

## 最后

实际的实现肯定比我的复杂, 建议看源码

[项目代码](https://github.com/WangMaoquan/mini-scheduler)
