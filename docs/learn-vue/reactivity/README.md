---
title: Reactivity
date: 2023-02-23 15:17:21
article: false
---

`vue3.x` 相较于 `vue2.x` 在响应式的处理, 选择了 ES6 的 `proxy`, 我并没有说代替了 `defineProperty`, 因为在很多地方你翻看源码也能找到 `defineProperty` 的踪迹

由于 `vue3.x` 采用了 `pnpm` 的[monorepo](https://pnpm.io/zh/workspaces) 管理方式, 响应式部分 就在 `reactivity` 这个包中, 得益于这种包管理, `reactivity` 我们也就不用局限于在 `vue` 中使用

本章内容, 我主要分析 `reactivity` 这个包

- [响应式的基础 Proxy](/docs/learn-vue/reactivity/proxy.md)
