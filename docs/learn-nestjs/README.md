---
title: 初识 nestjs
article: false
---

### Introduction

Nest (NestJS) is a framework for building efficient, scalable Node.js server-side applications. It uses progressive JavaScript, is built with and fully supports TypeScript (yet still enables developers to code in pure JavaScript) and combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming).

Under the hood, Nest makes use of robust HTTP Server frameworks like Express (the default) and optionally can be configured to use Fastify as well!

Nest provides a level of abstraction above these common Node.js frameworks (Express/Fastify), but also exposes their APIs directly to the developer. This gives developers the freedom to use the myriad of third-party modules which are available for the underlying platform.

Nest (NestJS) 是一个用于构建高效、可扩展 Node.js 服务器端应用程序的框架. 它使用渐进式 JavaScript, 使用并完全支持 TypeScript (但仍然使开发人员能够使用纯 JavaScript 进行编码) , 并结合了 OOP (面向对象编程) 、FP (函数式编程) 和 FRP (函数式反应式编程) 的元素.

在后台, Nest 使用强大的 HTTP 服务器框架, 例如 Express (默认) , 并且可以选择性地配置为使用 Fastify

Nest 提供了高于这些常见 Node.js 框架 (Express/Fastify) 的抽象级别, 但也将其 API 直接公开给开发人员. 这使开发人员可以自由地使用可用于底层平台的无数第三方模块.

#### 目录

- Controllers
- Providers
- Modules
- Middleware
- Exception filters
- Pipes
- Guards
- Interceptors
- Custom decorators
