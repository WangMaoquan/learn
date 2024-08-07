---
title: Modules
date: 2024-08-07 16:29:30
tag:
  - nestjs
category:
  - learn
description: nestjs 中的 modules
footer: true
---

<!-- more -->

### Modules

模块是用 `@Module()` 装饰器注释的类, `@Module()` 装饰器提供 `Nest` 用于组织应用结构的元数据

![Module](https://nest.nodejs.cn/assets/Modules_1.png)

每个应用至少有一个模块, 即根模块. 根模块是 Nest 用于构建应用图的起点 - Nest 用于解析模块和提供器关系及依赖的内部数据结构. 虽然非常小的应用理论上可能只有根模块, 但这不是典型的情况. 我们要强调的是, 强烈建议将模块作为组织组件的有效方式. 因此, 对于大多数应用来说, 最终的架构将采用多个模块, 每个模块封装一组密切相关的功能

`@Module()` 装饰器采用单个对象, 其属性描述模块

| 属性名      | mean                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------- |
| providers   | 将由 Nest 注入器实例化并且至少可以在该模块中共享的提供程序                                                          |
| controllers | 此模块中定义的必须实例化的控制器集                                                                                  |
| imports     | 导出此模块所需的提供程序的导入模块列表                                                                              |
| exports     | 这个模块提供的 `providers` 的子集应该在导入这个模块的其他模块中可用, 你可以使用提供器本身或仅使用其令牌(provide 值) |

### Feature modules

即功能模块

`UserController` 和 `UserService` 属于同一个应用域, 由于它们密切相关, 因此将它们移动到功能模块中是有意义的, 功能模块只是简单地组织与特定特性相关的代码, 保持代码的组织性并建立清晰的边界

```TypeScript
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
```

> nest g module [name]

对应的 `app.module.ts`

```TypeScript
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule],
})
export class AppModule {}
```

### Shared modules

即 共享模块

![share-module](https://nest.nodejs.cn/assets/Shared_Module_1.png)

创建的每个模块其实都是共享模块, 如果我们要在几个模块中共享 `UserService`实例, 我们只需要在 `UserModule` 的 `exports` 中加入 `UserService`

```TypeScript
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
```

在别的模块中使用 `imports`

```TypeScript
import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule]
})
export class TestModule {}
```

### Module re-exporting

即模块重新导入

```TypeScript
@Module({
  imports: [CommonModule],
  exports: [CommonModule],
})
export class CoreModule {}
```

`CommonModule` 既被导入到 `CoreModule` 中, 又被从 `CoreModule` 中导出, 从而使其可用于导入该模块的其他模块

### Dependency injection

即依赖注入

模块类也可以注入提供程序(例如，出于配置目的)

```TypeScript
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {
  constructor(private userService: UserService) {}
}
```

> 由于 `循环依赖`, 模块类本身不能作为提供器注入(@Injectable())

### Global modules

即全局模块

当某个模块需要在别的很多模块注入时, 我们可以将该模块声明为全局模块, 使用 `@Global()`

```TypeScript
import { Module, Global } from '@nestjs/common';
import { UserController } from './user.controller';
import { userService } from './user.service';

@Global()
@Module({
  controllers: [UserController],
  providers: [userService],
  exports: [userService],
})
export class UserModule {}
```

::: tip

让一切全局并不是一个好的设计决策. 全局模块可用于减少必要样板文件的数量. `imports` 数组通常是使模块的 `API` 可供消费者使用的首选方式

全局模块还是尽量少用, 不然注入的很多 `provider` 都不知道来源, 会降低代码的可维护性

:::

### Dynamic modules

即动态模块

这能够使你轻松创建可自定义的模块, 这些模块可以动态注册和配置提供程序

```TypeScript
import { Module, DynamicModule } from '@nestjs/common';
import { createDatabaseProviders } from './database.providers';
import { Connection } from './connection.provider';

@Module({
  providers: [Connection],
  exports: [Connection],
})
export class DatabaseModule {
  static forRoot(entities = [], options?): DynamicModule {
    const providers = createDatabaseProviders(options, entities);
    return {
      module: DatabaseModule,
      providers: providers,
      exports: providers,
      global: true, // 注册为全局的动态模块
    };
  }
}
```

该模块默认定义 `Connection` 提供器(在 @Module() 装饰器元数据中), 但另外 - 取决于传递到 `forRoot()` 方法中的 `entities` 和 `options` 对象 - 公开提供器的集合

```TypeScript

import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [DatabaseModule.forRoot([User])],
})
export class AppModule {}
```
