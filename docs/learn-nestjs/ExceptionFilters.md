---
title: Exception filters
date: 2024-08-08 10:48:47
tag:
  - nestjs
category:
  - learn
description: nestjs 中的 Exception filters
footer: true
---

<!-- more -->

### Exception filters

即异常过滤器

`Nest` 带有一个内置的异常层, 负责处理应用中所有`未处理的异常`. 当你的应用代码未处理异常时, 该层会捕获该异常, 然后自动发送适当的用户友好响应

![Exception filters](https://docs.nestjs.com/assets/Filter_1.png)

### Throwing standard exceptions

即抛出异常标准

Nest 提供了一个内置的 `HttpException` 类, 从 `@nestjs/common` 包中暴露出来, 对于典型的基于 `HTTP REST/GraphQL API` 的应用, 最佳做法是在发生某些错误情况时发送标准 `HTTP 响应对象`

```TypeScript

@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}

```

::: note

`HttpException` 构造函数采用两个必需的参数来确定响应

- `response` 参数定义 JSON 响应主体, 可以是 `string` 或者 `object`
- `status` 参数定义了 [HTTP 状态代码](https://web.nodejs.cn/en-us/docs/web/http/status/)

默认情况下, JSON 响应主体包含两个属性

- `statusCode`: 默认为 `status` 参数中提供的 HTTP 状态代码
- `message`: 基于 `status` 的 HTTP 错误的简短描述

要仅覆盖 JSON 响应`正文的消息部分`, 请在 `response` 参数中提供一个字符串;
要覆盖整个 `JSON 响应主体`，请在 `response` 参数中传递一个对象, Nest 将序列化该对象并将其作为 JSON 响应主体返回

第二个构造函数参数 - `status` - 应该是有效的 `HTTP 状态代码`, 最佳做法是使用从 `@nestjs/common` 导入的 `HttpStatus` 枚举

有第三个构造函数参数(可选) - `options` - 可用于提供 `错误 cause`, 此 cause 对象未序列化到响应对象中, 但它可用于记录目的, 提供有关导致 HttpException 被抛出的内部错误的有价值信息

```TypeScript
@Get()
async findAll() {
  try {
    await this.service.findAll()
  } catch (error) {
    throw new HttpException({
      status: HttpStatus.FORBIDDEN,
      error: 'This is a custom message',
    }, HttpStatus.FORBIDDEN, {
      cause: error
    });
  }
}

```

:::

### Custom exceptions

即自定义异常

多数情况下不用自定义的异常, 如果非得请记得 `extends HttpException `

```TypeScript

export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}


```

### Built-In HTTP exceptions

Nest 提供了一组继承自基 `HttpException` 的标准异常, 全部都是从 `@nestjs/common` 导出

- BadRequestException
- UnauthorizedException
- NotFoundException
- ForbiddenException
- NotAcceptableException
- RequestTimeoutException
- ConflictException
- GoneException
- HttpVersionNotSupportedException
- PayloadTooLargeException
- UnsupportedMediaTypeException
- UnprocessableEntityException
- InternalServerErrorException
- NotImplementedException
- ImATeapotException
- MethodNotAllowedException
- BadGatewayException
- ServiceUnavailableException
- GatewayTimeoutException
- PreconditionFailedException

所有内置异常也可以使用 `options` 参数提供错误 `cause` 和错误描述

### Exception filters

虽然基本(内置)异常过滤器可以自动为你处理许多情况, 但你可能希望完全控制异常层.
例如, 你可能希望根据某些动态因素添加日志记录或使用不同的 JSON 模式. 异常过滤器正是为此目的而设计的. 它们让你可以控制准确的控制流和发送回客户端的响应内容

让我们创建一个异常过滤器, 负责捕获作为 `HttpException` 类实例的异常, 并为它们实现自定义响应逻辑. 为此, 我们需要访问底层平台 `Request` 和 `Response` 对象. 我们将访问 `Request` 对象, 以便提取原始 url 并将其包含在日志信息中, 我们将使用 `Response` 对象直接控制发送的响应, 使用 `response.json()` 方法

```TypeScript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
```

::: tip

所有异常过滤器都应实现通用 `ExceptionFilter<T>` 接口, 这要求你提供 `catch(exception: T, host: ArgumentsHost)` 方法及其指示的签名, T 表示异常的类型

:::

::: warning

如果你使用 `@nestjs/platform-fastify`, 则可以使用 `response.send()` 而不是 `response.json()`, 不要忘记从 `fastify` 导入正确的类型

:::

`@Catch(HttpException)` 装饰器将所需的元数据绑定到异常过滤器, 告诉 `Nest` 这个特定的过滤器正在寻找 `HttpException` 类型的异常, `而不是其他任何东西. 
`@Catch()` 装饰器可以采用单个参数或逗号分隔的列表, 这使你可以一次为多种类型的异常设置过滤器

### Arguments host

即 `catch` 方法的第二个参数, 是一个 `ArgumentsHost` 对象, 简单来说 `Nest` 支持 `HTTP 服务`, `WebSocket 服务`, 还有基于 `TCP 通信的微服务`, 但是 `不同类型的服务`它能拿到的`参数是不同的`, 比如 `http 服务`可以拿到 `request`, `response `对象，而 `websocket 服务`就没有, 但是这些服务 其实都支持 `Exception Filter`, 那么我们要怎么复用 `Exception Filter`, `Nest` 的解决方法是 `ArgumentHost` 这个类, 后续会在 `执行上下文` 详细介绍

### Binding filters

```TypeScript
import { UseFilters } from '@nestjs/common'

@Post()
@UseFilters(HttpExceptionFilter) // @UseFilters(HttpExceptionFilter)
async create(@Body() createUserDto: CreateUserDto) {
  throw new ForbiddenException();
}

```

::: tip

尽可能使用类而不是实例来应用过滤器, 它减少了内存使用量, 因为 `Nest` 可以轻松地在整个模块中重用`同一类的实例`

:::

上面的 `HttpExceptionFilter` 作用域只在与 `create`

```TypeScript
@UseFilters(HttpExceptionFilter)
export class UserController {}
```

这里的作用域就在 `UserController` 中的所有方法

```TypeScript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
```

这里的作用域就在全局

::: note

全局作用域的过滤器用于整个应用, 用于每个控制器和每个路由处理程序.
在依赖注入方面, 从任何模块外部注册的全局过滤器(如上例中的 useGlobalFilters())不能注入依赖, 因为这是在任何模块的上下文之外完成的.

```TypeScript
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
```

:::

### Catch everything

为了捕获每个未处理的异常(无论异常类型如何), 请将 `@Catch()` 装饰器的参数列表留空, 例如 `@Catch()`

```TypeScript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
```

### Inheritance

通常, 你将创建完全定制的异常过滤器来满足你的应用需求.
但是, 在某些用例中, 你可能只想扩展内置的默认全局异常过滤器, 并根据某些因素覆盖行为
为了将异常处理委托给基本过滤器, 你需要扩展 `BaseExceptionFilter` 并调用继承的 `catch()` 方法

```TypeScript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
```
