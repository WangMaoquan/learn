---
title: Controllers
date: 2024-08-07 10:16:59
tag:
  - nestjs
useregory:
  - learn
description: nestjs 中的 Controller
footer: true
---

<!-- more -->

### Controllers

> Controllers are responsible for handling incoming `requests` and returning `responses` to the client\
>
> 控制器负责处理传入请求并向客户端返回响应。

![Controllers-flow](https://docs.nestjs.com/assets/Controllers_1.png)

> A controller's purpose is to receive specific requests for the appliuserion. The routing mechanism controls which controller receives which requests. Frequently, each controller has more than one route, and different routes can perform different actions.
>
> 控制器的目的是接受应用发起的特定的请求, 路由机制决定了哪个控制器去接受哪些请求. 通常,每个控制器都有不止一条路由, 不同的路由可以执行不同的操作

> In order to create a basic controller, we use classes and decorators. Decorators associate classes with required metadata and enable Nest to create a routing map (tie requests to the corresponding controllers).
>
> 为了创建基本控制器, 我们使用类和装饰器. 装饰器将类与所需的元数据相关联, 并使 Nest 能够创建路由映射(将请求绑定到相应的控制器)

`/user/create`, `/user/list`, `/book/create`, `/book/list` 这些 `url` 我们可以称为 `路由(route)`, 在这四个路由中每俩有着公共的前缀 `user`, `book`, 意思就是我们请求首先匹配到的是 `/user` 或者 `/book` 然后再具体到下一级,

```TypeScript
import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('user')
export class UserController {

  @Get('/list')
  findList(){
    // todo
  }

  @Post('/create')
  createUser(@Body() userInfo: UserInfo) {
    // todo
  }
}
```

我们在 `@Controller() 装饰器` 中指定路径前缀 `user`, 这样我们就不必为文件中的每个路由重复该部分路径

发起的`get请求` 为 `/user/list` 会首先匹配到 `@Controller('user')`, 然后会匹配到 `findList` 这个方法

::: note nestjs 快速生成 Controller 模板

```shell
nest g controller [name]
```

:::

### Requst Object

处理程序通常需要访问客户端请求的详细信息, `Nest` 提供对底层平台 请求对象 的访问(默认为 Express) 我们可以通过将 `@Req()` 装饰器添加到处理程序的签名来指示 `Nest` 注入它来访问请求对象

```TypeScript
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('user')
export class UserController {
  @Get()
  findList(@Req() request: Request): string {
    // todo
  }
}
```

| 装饰器                  | 对象                            |
| ----------------------- | ------------------------------- |
| @Request(), @Req()      | req                             |
| @Response(), @Res()     | res                             |
| @Next()                 | next                            |
| @Session()              | req.session                     |
| @Param(key?: string)    | req.params / req.params[key]    |
| @Body(key?: string)     | req.body / req.body[key]        |
| @Query(key?: string)    | req.query / req.query[key]      |
| @Headers(name?: string) | req.headers / req.headers[name] |
| @Ip()                   | req.ip                          |
| @HostParam()            | req.hosts                       |

### Route wildcards

路由通配符, 也支持基于模式的路由. 例如: 星号用作通配符, 将匹配任何字符组合

```TypeScript
@Get('ab*cd')
findAll() {
  return 'This route uses a wildcard';
}
```

::: warning

仅 `express` 支持路由中间的通配符

:::

### Status code

我们可以通过在处理程序级别添加 `@HttpCode(...)` 装饰器来轻松更改此行为

```TypeScript

import { HttpCode } from '@nestjs/common'

@Post()
@HttpCode(204)
create() {
  return 'This action adds a new user';
}
```

### Headers

要指定自定义响应标头，你可以使用 `@Header()` 装饰器或库特定的响应对象(并直接调用 res.header())

```TypeScript
import { Header } from '@nestjs/common'

@Post()
@Header('Cache-Control', 'none')
create() {
  return 'This action adds a new user';
}
```

### Redirection

要将响应重定向到特定 `URL`, 你可以使用 `@Redirect()` 装饰器或库特定的响应对象(并直接调用 res.redirect())

`@Redirect()` 有两个参数, url 和 statusCode, 两者都是可选的. 如果省略, statusCode 的默认值为 `302 (Found)`

```TypeScript
@Get()
@Redirect('https://nest.nodejs.cn', 302)
getDocs(@Query('version') version) {
  if (version && version === '5') {
    return { url: 'https://nest.nodejs.cn/v5/' };
  }
}
```

### Route parameters

当你需要接受动态数据作为请求的一部分时(例如, GET /user/1 获取 ID 为 1 的用户), 具有静态路径的路由将不起作用. 为了定义带参数的路由, 我们可以在路由的路径中添加路由参数标记

::: tip

带参数的路由应在任何静态路径之后声明, 这可以防止参数化路径拦截发往静态路径的流量

:::

```TypeScript
import { @Param } from '@nestjs/common'

@Get(':id')
findUser(@Param() params: {id: number}): string {
  return `This action returns a #${params.id} user`;
}

@Get(':id')
findUser2(@Param('id') id: number): string {
  return `This action returns a #${id} user`;
}
```

### Sub-Domain Routing

`@Controller 装饰器` 可以采用 `host` 选项来要求传入请求的 HTTP 主机匹配某个特定值

```TypeScript
@Controller({ host: 'admin.example.com' })
export class AdminController {
  @Get()
  index(): string {
    return 'Admin page';
  }
}
```

::: warning

由于 `Fastify` 缺乏对嵌套路由的支持, 因此在使用子域路由时, 应使用 (默认) Express 适配器

:::

### Full resource sample

```TypeScript

import { Controller, Get, Query, Post, Body, Put, Param, Delete, Bind } from '@nestjs/common';

@Controller('user')
export class UserController {
  @Post()
  @Bind(Body())
  create(createUserDto) {
    return 'This action adds a new user';
  }

  @Get()
  @Bind(Query())
  findAll(query) {
    console.log(query);
    return `This action returns all user (limit: ${query.limit} items)`;
  }

  @Get(':id')
  @Bind(Param('id'))
  findOne(id) {
    return `This action returns a #${id} user`;
  }

  @Put(':id')
  @Bind(Param('id'), Body())
  update(id, updateCatDto) {
    return `This action updates a #${id} user`;
  }

  @Delete(':id')
  @Bind(Param('id'))
  remove(id) {
    return `This action removes a #${id} user`;
  }
}
```

当我们写完一个 `Controller` 时我们需要把它 注册到对应的 `Module` 的 `Controllers`中

```TypeScript
import { Module } from '@nestjs/common';
import { UserController } from './user/user.controller';

@Module({
  controllers: [UserController],
})
export class UserModule {}

```
