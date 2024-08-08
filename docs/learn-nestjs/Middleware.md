---
title: Middleware
date: 2024-08-08 10:19:30
tag:
  - nestjs
category:
  - learn
description: nestjs 中的 Middleware
footer: true
---

<!-- more -->

### Middleware

意为 `中间件`, 是在路由处理程序之前调用的函数, 中间件函数可以访问 `request` 和 `response` 对象, 以及应用请求-响应周期中的 `next()` 中间件函数

![Middleware](https://docs.nestjs.com/assets/Middlewares_1.png)

> 默认情况下, Nest 中间件等同于 express 中间件

::: note

中间件函数可以执行以下任务:

- 执行任何代码
- 更改请求和响应对象
- 结束请求-响应循环
- 调用堆栈中的下一个中间件函数
- 如果当前中间件函数没有结束请求-响应循环, 则必须调用 `next()` 将控制权传递给下一个中间件函数, 否则, 该请求将保持挂起状态

:::

```TypeScript

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    next();
  }
}

```

### Dependency injection

Nest 中间件完全支持依赖注入

### Applying middleware

`@Module()` , 装饰器中没有中间件的位置, 我们可以使用模块类的 `configure()` 方法设置, 注意此时需要 `implements NestModule`

```TypeScript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('user');
  }
}

```

上面的例子在我们访问 `user` 的路由后就会打印 `Request...`, `forRoutes` 还可以限制我们的请求方法

```TypeScript
/** 省略.. */
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'user', method: RequestMethod.GET }); // 只有 get 请求
  }
}

```

### Route wildcards

路由通配符

支持基于模式的路由

```TypeScript
forRoutes({ path: 'ab*cd', method: RequestMethod.ALL }); // 匹配abcd、ab_cd、abecd
```

### Middleware consumer

`MiddlewareConsumer` 是一个辅助类, 提供了几种内置的方法来管理中间件, `forRoutes()` 方法可以接受`单个字符串`, `多个字符串`, `一个RouteInfo对象`, `一个控制器类`甚至`多个控制器类`

```TypeScript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';

@Module({
  imports: [UserModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(UserController);
  }
}

```

### Excluding routes

有时我们希望排除某些路由应用中间件, `exclude()` 方法轻松排除某些路由, 方法可以采用`单个字符串`, `多个字符串`或 `RouteInfo 对象`标识要排除的路由

```TypeScript
consumer
  .apply(LoggerMiddleware)
  .exclude(
    { path: 'user', method: RequestMethod.GET },
    { path: 'user', method: RequestMethod.POST },
    'user/(.*)',
  )
  .forRoutes(UserController);

```

### Functional middleware

一般我们称 `没有成员`, `没有额外的方法`, `也没有依赖`, 使用一个简单的函数来定义的中间件称为 `函数式中间件`

```TypeScript

import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`Request...`);
  next();
};

```

### Multiple middleware

为了绑定顺序执行的多个中间件, 只需在 `apply()` 方法中提供一个逗号分隔的列表

```TypeScript

consumer.apply(mid1(), mid2(), logger).forRoutes(UserController);

```

### Global middleware

如果我们想一次将中间件绑定到每个已注册的路由, 我们可以使用 `INestApplication` 实例提供的 `use()` 方法

```TypeScript

const app = await NestFactory.create(AppModule);
app.use(logger);
await app.listen(3000);

```
