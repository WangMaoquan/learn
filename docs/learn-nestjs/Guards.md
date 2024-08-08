---
title: Guards
date: 2024-08-08 15:22:04
tag:
  - nestjs
category:
  - learn
description: nestjs 中的 Guards
footer: true
---

<!-- more -->

### Guards

守卫是一个用 `@Injectable()` 装饰器注释的类，它实现了 `CanActivate` 接口

![Guards](https://docs.nestjs.com/assets/Guards_1.png)

守卫有单一的责任. 它们根据运行时存在的某些条件(如权限, 角色, ACL 等)确定给定请求是否将由路由处理程序处理

`Guards` 可以访问 `ExecutionContext` 实例, 因此确切地知道接下来要执行什么. 它们的设计与`异常过滤器`, `管道和拦截器` 非常相似, 可让你在`请求/响应周期`的正确位置插入处理逻辑, 并以声明方式进行

::: tip

`Guards` 在所有中间件之后, 任何`拦截器`或`管道`之前执行

:::

### Authorization guard

```TypeScript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}

```

每个守卫都必须实现一个 `canActivate()` 函数, 此函数应返回一个`布尔值`, 指示是否允许当前请求.
它可以同步或异步(通过 Promise 或 Observable)返回响应, Nest 使用返回值来控制下一步的动作:

- 如果它返回 `true`, 请求将被处理
- 如果它返回 `false`, Nest 将拒绝该请求

### Execution context

`canActivate()` 函数采用单个参数, 即 `ExecutionContext` 实例

### Role-based authentication

```TypeScript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return matchRoles(roles, user.roles);
  }
}
```

### Binding guards

```TypeScript
import { UseGuards } from '@nestjs/common'

@Controller('user')
// @UseGuards(RolesGuard)
@Roles(['admin'])
export class UserController {}
```

**全局注册**

```TypeScript
const app = await NestFactory.create(AppModule);
app.useGlobalGuards(new RolesGuard());
```

同样的是在依赖注入方面, 从任何模块外部注册的全局守卫不能注入依赖

```TypeScript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```
