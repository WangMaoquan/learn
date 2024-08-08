---
title: Pipes
date: 2024-08-08 13:32:52
tag:
  - nestjs
category:
  - learn
description: nestjs 中的 Pipes
footer: true
---

<!-- more -->

### Pipes

管道是用 `@Injectable()` 装饰器注释的类, 它实现了 `PipeTransform` 接口

![Pipes](https://docs.nestjs.com/assets/Pipe_1.png)

管道有两个典型的用例:

1. 转型: 将输入数据转换为所需的形式(例如, 从字符串到整数)
2. 验证: 评估输入数据, 如果有效, 只需将其原样传递,否则抛出异常

在这两种情况下, 管道都在由 控制器路由处理器 处理的 `arguments` 上运行, Nest 在调用方法之前插入一个管道, 管道接收指定给该方法的参数并对它们进行操作. 任何转换或验证操作都会在此时发生, 之后会使用任何(可能)转换的参数调用路由处理程序

```TypeScript
  @Get('list')
  async list(
    @Query(
      'pageNo',
      new DefaultValuePipe(1),
      new ParseIntPipe({
        exceptionFactory() {
          throw new BadRequestException('pageNo 应该传数字');
        },
      }),
    )
    pageNo: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(10),
      new ParseIntPipe({
        exceptionFactory() {
          throw new BadRequestException('pageSize 应该传数字');
        },
      }),
    )
    pageSize: number,
  ) {
    return await this.userService.findUsersByPage(pageNo, pageSize);
  }
```

### Built-in pipes

Nest 附带九个开箱即用的管道:

- ValidationPipe
- ParseIntPipe: 字符串解析为整数
- ParseFloatPipe: 字符串解析为浮点数
- ParseBoolPipe: 字符串解析为布尔值
- ParseArrayPipe: 字符串解析为数组
- ParseUUIDPipe: 解析字符串并验证是否为 `UUID`
- ParseEnumPipe: 字符串转换为枚举
- DefaultValuePipe: 如果传入的参数是 `undefined` 或 `null`, 则使用默认值替换它
- ParseFilePipe: 用于处理上传的文件, 它可以验证文件的类型, 大小等, 确保上传的文件符合预期

### Custom pipes

```TypeScript
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
}
```

::: tip

`PipeTransform<T, R>` 是一个通用接口, 任何管道都必须实现. 泛型接口用 `T` 表示输入 `value` 的类型，用 `R` 表示 `transform()` 方法的返回类型

:::

每个管道都必须实现 `transform()` 方法来履行 `PipeTransform` 接口契约, 有两个参数

1. value 参数是当前处理的方法参数(在被路由处理方法接收之前)
2. metadata 是当前处理的方法参数的元数据, 元数据对象具有以下属性
   ```TypeScript
   export interface ArgumentMetadata {
      type: 'body' | 'query' | 'param' | 'custom'; // 指示参数是主体 @Body(), 查询 @Query(), 参数 @Param() 还是自定义参数
      metatype?: Type<unknown>; // 提供参数的元类型, 例如 String, 如果你在路由处理程序方法签名中省略类型声明或使用普通 JavaScript, 则该值为 undefined
      data?: string; // 传递给装饰器的字符串, 例如 @Body('string'), 如果将装饰器括号留空, 则为 undefined
   }
   ```

### Class validator

```shell
npm i --save class-validator class-transformer
```

一旦安装了这些, 我们就可以向 CreateUserDto 类添加一些装饰器

```TypeScript
import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({
    message: '用户名不能为空',
  })
  username: string;

  @IsNotEmpty({
    message: '密码不能为空',
  })
  password: string;
}

```

现在我们可以创建一个使用这些注释的 `ValidationPipe` 类

```TypeScript
mport { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

### Global scoped pipes

由于 `ValidationPipe` 被创建为尽可能通用, 因此我们可以通过将其设置为全局作用域的管道来实现其完整实用性, 以便将其应用于整个应用中的每个路由处理程序

```TypeScript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
```

同 全局`Exception filters` 一样, 从任何模块外部注册的全局管道无法注入依赖

```TypeScript
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
```
