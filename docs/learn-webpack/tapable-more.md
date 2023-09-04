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
