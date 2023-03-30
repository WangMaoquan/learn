---
title: 单例模式
date: 2023-03-30 17:12:48
tag:
  - typescript
  - 设计模式
category:
  - 设计模式
description: 设计模式之单例模式
footer: true
---

## 简介

单例模式是一种常用的模式, 有一些对象往往只需要一个, 比如线程池、全局缓存、浏览器中的 window 对象等.
单例模式用于保证一个类仅有一个实例, 并提供一个访问它的全局访问点

<!-- more -->

## 优缺点

- 优点
  1. 由于单例模式在内存中只有一个实例, 减少了内存开支, 特别是一个对象需要频繁地创建、销毁时, 而且创建或销毁时性能又无法优化, 单例模式的优势就非常明显
  2. 由于单例模式只生成一个实例, 所以减少了系统的性能开销, 当一个对象的产生需要比较多的资源时, 如读取配置、产生其他依赖对象时, 则可以通过在应用启动时直接产生一个单例对象, 然后用永久驻留内存的方式解决
  3. 单例模式可以在系统设置全局的访问点, 优化和共享资源的访问
  4. 避免对资源的多重占用, 避免对同一个资源文件的同时操作, 造成文件状体不一致
- 缺点
  1. 单例模式一般没有接口，扩展很困难，若要扩展，除了修改代码基本上没有第二种途径可以实现

## 应用场景

- 系统只需要一个实例对象，如系统要求提供一个唯一的序列号生成器或资源管理器，或者需要考虑资源消耗太大而只允许创建一个对象
- 创建对象时耗时过多或耗资源过多，但又经常用到的对象
- 需要频繁实例化然后销毁的对象

## 特点

1. 单例类只有一个实例对象
2. 该单例对象必须由单例类自行创建
3. 单例类对外提供一个访问该单例的全局访问点

### 懒汉式单例

```typescript
class LazySingleton {
  private static singleton: LazySingleton;

  private constructor() {}

  public static getInstance(): LazySingleton {
    if (!LazySingleton.singleton) {
      LazySingleton.singleton = new LazySingleton();
    }
    return LazySingleton.singleton;
  }

  // 别的方法
}
```

### 饿汉式单例

```typescript
class HungrySingleton {
  private static singleton: HungrySingleton = new HungrySingleton();

  private constructor() {}

  public static getInstance(): HungrySingleton {
    return LazySingleton.singleton;
  }

  // 别的方法
}
```
