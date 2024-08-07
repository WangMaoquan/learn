---
title: Providers
date: 2024-08-07 14:03:42
tag:
  - nestjs
category:
  - learn
description: nestjs 中的 providers
footer: true
---

<!-- more -->

### Providers

`Providers` 是 `Nest` 中的一个基本概念, 许多基本的 `Nest` 类可以被视为提供器, 比如 `services`, `repositories`, `factories`, `helpers` 等等, 主要思想是它可以作为依赖注入`(injected as a dependency)`. 这意味着对象之间可以创建各种关系, 并且 '接线' 这些对象的功能很大程度上可以委托给 Nest 运行时系统

![Providers-flow](https://docs.nestjs.com/assets/Components_1.png)

> Controllers should handle HTTP requests and delegate more complex tasks to providers. Providers are plain JavaScript classes that are declared as providers in a module
>
> 控制器应该处理 HTTP 请求并将更复杂的任务委托给提供器, 提供程序是在 `module` 中声明为 `providers` 的纯 JavaScript 类

### Services

上面说到, `Controllers` 只负责 `http请求`, 更复杂应该交给 `Services`, 下面我们定义一个 `service`

```TypeScript
import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';

@Injectable() // 申明该类可以注入, 即放到 Module的 provides
export class UserService {
  private readonly users: User[] = [];

  create(user: User) {
    this.users.push(cat);
  }

  findAll(): User[] {
    return this.users;
  }
}
```

`UserService` 是一个具有一个属性和两个方法的基本类, 不同的是使用了 `@Injectable()` 装饰器, `@Injectable()`装饰器附加元数据, 该元数据声明 `UserService` 是可由 Nest `IoC` 容器管理的类

> 什么是 `IOC` 我会在后面好好说明下

**使用 Provider**

```TypeScript
import { Controller, Get, Post, Body, Bind } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
   constructor(private userService: UserService) {}

  @Post()
  @Bind(Body())
  async create(createUserDto) {
    this.userService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }
}
```

### Dependency injection

`Nest` 是围绕通常称为依赖注入的强大设计模式构建的

```TypeScript
constructor(private catsService: CatsService) {} // 这种注入叫基于构造函数的注入
```

### Custom providers

Nest 有一个内置的控制反转 `("IoC")` 容器, 可以解决提供器之间的关系, 此功能是上述依赖注入功能的基础, 但实际上比我们目前所描述的功能强大得多
有几种定义提供器的方法：

1. 普通值
2. 类
3. 异步或同步工厂

> ioc // todo

### Optional providers

有时, 你可能有不一定要解决的依赖.
例如, 你的类可能依赖于配置对象, 但如果没有传递任何内容, 则应使用默认值. 在这种情况下, 依赖变为可选, 因为缺少配置提供程序不会导致错误
这时可以使用 `@Optional()`

```TypeScript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  constructor(@Optional() @Inject('HTTP_OPTIONS') private httpClient: T) {}
}
```

### Property-based injection

除了基于`构造器`的注入外, 我们还有基于`属性`的注入

```TypeScript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  @Inject('HTTP_OPTIONS')
  private readonly httpClient: T;
}
```

### Provider registration

现在我们已经定义了一个提供器 `(UserService)`, 并且我们有了该服务的一个消费者 `(UserController)`, 我们需要向 Nest 注册该服务, 以便它可以执行注入. 我们通过编辑模块文件 `(user.module.ts)` 并将服务添加到 `@Module()` 装饰器的 `providers` 数组来完成此操作

```TypeScript
import { Module } from '@nestjs/common';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

```
