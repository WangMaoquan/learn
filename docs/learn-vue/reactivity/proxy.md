---
title: 响应式的基础Proxy
date: 2023-02-23 15:27:39
tag:
  - vue
category:
  - vue
description: vue3.x中的Proxy
footer: true
---

### Prxoy 与 Reflect

什么是 `Proxy` ? 简单来说, 就是使用 `Proxy` 可以创建一个代理对象, 它能够实现对**其他对象**的代理, 也就是说 `Proxy` 只能代理对象, 所以对于`字符串`, `数字`, `布尔值`等, 无法代理. 那么`代理` 是什么? 所谓代理, 指的是对一个对象的**基本语义**的代理, 允许我们`拦截`并`重新定义`对一个对象的基本操作

::: note 什么是基本语义?

```typescript
obj.foo; // 读取值 => get
obj.foo++; // 读取并且修改值 => set
```

类似这种`读取, 设置属性值`的操作就属于基本语义的操作(基本操作)

```typescript
const obj = {};

const proxy = new Proxy(obj, {
  get() {
    /** */
  },
  set() {
    /** */
  },
});
```

对于 `function`我们也可以使用 `Proxy`, 万物皆对象

```typescript
function print(str: string) {
  console.log(str);
}

const proxy = new Proxy(print, {
  apply() {
    /** */
  },
});
```

既然有`基本操作`, 当然也有`非基本操作`

复杂我们可以理解为 同时又多个`基本语义`

```typescript
const obj = {
  name: 'decade',
  print() {
    console.log(this.obj);
  },
};

obj.print(); // 非基本操作 先 get 再 apply
```

:::

`Reflect` 就是一个全局对象, 它包含了与 `Proxy 的 拦截器中字段` 对应的方法, 比如

```typescript
Reflect.get(/** */);
Reflect.set(/** */);
Reflect.apply(/** */);
```

`Reflect.*`最后的一个参数是 `receiver`, 可以理解为 `函数调用过程中的this`, 比如

```typescript
const obj = {
  _age: 21,
  get age() {
    console.log(this); // 未使用Reflect this 指的是obj, 使用Reflect 指向代理的proxy
    return this._age;
  },
};

const proxy = new Proxy(obj, {
  get(target, key, receiver) {
    console.log('get');
    return target[key];
    // return Reflect.get(target, key, receiver);
  },
  set(target, key, newVal, receiver) {
    console.log('set');
    target[key] = newVal;
    return true;
  },
});

proxy.age;
```

### 怎么代理对象

`读取` 是一个很宽泛的 `概念`, 比如 我们使用 `propName in obj`中的 `in` 也是属于 读取, 但是我们没有办法通过 `get`去拦截, 相应的 也还有 `for ... in` 操作, 下面我就讲讲 对应的 `拦截方法`

::: tip 提示

下面提的拦截操作主要是 `vue3.x `中用到的

想了解更多的 拦截方法, 到 [Proxy-MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 了解

:::

1. 处理 `obj.xxx` 使用 `get`

   ```typescript
   const obj = {
     name: 'decade',
   };
   const proxy = new Proxy(obj, {
     get(target, key, receiver) {
       console.log('get');
       return Reflect.get(target, key, receiver);
     },
   });
   ```

2. 处理 `obj.xxx = xxx` 使用 `set`

   ```typescript
   const obj = {
     name: 'decade',
   };
   const proxy = new Proxy(obj, {
     set(target, key, newVal, receiver) {
       console.log('set');
       return Reflect.set(target, key, newVal, receiver);
     },
   });
   ```

3. 处理 `in` 操作符 使用 `has`

   ```typescript
   const obj = {
     name: 'decade',
   };
   const proxy = new Proxy(obj, {
     has(target, key) {
       console.log('has');
       return Reflect.has(target, key);
     },
   });
   ```

4. 处理 `for ... in` 使用 `ownkeys`

   ```typescript
   const obj = {
     name: 'decade',
   };
   const proxy = new Proxy(obj, {
     ownkeys(target) {
       console.log('ownkeys');
       return Reflect.ownkeys(target);
     },
   });
   ```

5. 处理 `delete` 操作符 使用 `deleteProperty`
   ```typescript
   const obj = {
     name: 'decade',
   };
   const proxy = new Proxy(obj, {
     deleteProperty(target, key) {
       console.log('deleteProperty');
       return Reflect.deleteProperty(target, key);
     },
   });
   ```

### baseHandles

在 `vue3.x` 的官方 Api 文档 中 有着这样相似的 四个方法, 分别是:

- reactive
- shallowReactive
- readonly
- shallowReadonly

::: tip 提示

用法看官方的 [Api](https://cn.vuejs.org/api/) 文档

:::

上面的四个方法都是对对象的代理, 但是用处却不相同, 本质都是一个 `Proxy` 我们很容易想到的是就是 实现的拦截不同

> 下面实现的都是简易版本, 没有处理很多边界 case

#### get

1. reactive - get

   ```typescript
   function reactiveGet(
     target: object,
     key: string | symbol,
     receiver: object,
   ) {
     const res = Reflect.get(target, key, receiver);

     if (isObject(res)) {
       // 这里处理的就是 如果res还是对象的话 就再调用一次reactive, 不用像2.x, 对象层级很深的时候还需要递归遍历
       return reactive(res);
     }

     return res;
   }
   ```

2. shallowReactive - get

   ```typescript
   function shallowReactiveGet(
     target: object,
     key: string | symbol,
     receiver: object,
   ) {
     const res = Reflect.get(target, key, receiver);

     // shallow 的话 是不需要再去判断的 直接返回就是
     return res;
   }
   ```

3. readonly - get

   ```typescript
   function readonlyGet(
     target: object,
     key: string | symbol,
     receiver: object,
   ) {
     const res = Reflect.get(target, key, receiver);

     if (isObject(res)) {
       // 还是对象 也需要 readonly一下
       return readonly(res);
     }

     // shallow 的话 是不需要再去判断的 直接返回就是
     return res;
   }
   ```

4. shallowReadonly - get

   ```typescript
   function shallowReadonlyGet(
     target: object,
     key: string | symbol,
     receiver: object,
   ) {
     const res = Reflect.get(target, key, receiver);

     return res;
   }
   ```

通过发现, 其实四个 `get` 的逻辑 是可以公用的, 所以我们可以通过参数来返回对应的 get

```typescript
const createGetter = (
  shallow: boolean = false,
  isReadonly: boolean = false,
) => {
  return function (target: object, key: string | symbol, receiver: object) {
    const res = Reflect.get(target, key, receiver);

    if (shallow) {
      return res;
    }

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

    return res;
  };
};
```

#### set

set 同理 也可以用一个工厂函数来返回

```typescript
const createSetter = (shallow: boolean = false) => {
  return function set(
    target: object,
    key: string | symbol,
    newVal: unknow,
    receiver: object,
  ): boolean {
    if (isReadonly(target)) {
      // 如果是 readonly 不允许修改
      return false;
    }

    const result = Reflect.set(target, key, value, receiver);

    return result;
  };
};
```

### deleteProperty

我们只需要注意 `readonly` 是不允许 `删除` 字段的, 所以 对于 readonly 的 `deleteProperty` 我们打印一个警告, 返回 false

```typescript
function deleteProperty(target: object, key: string | symbol): boolean {
  const result = Reflect.deleteProperty(target, key);
  return result;
}
```

#### ownkeys

`readonly` 中对于 `ownKeys` 可以没必要写, 因为 `readonly` 是没办法收集`依赖`的

```typescript
function ownKeys(target: object): (string | symbol)[] {
  return Reflect.ownKeys(target);
}
```

#### has

`readonly` 中对于 `has` 可以没必要写, 因为 `readonly` 是没办法收集`依赖`的

```typescript
function has(target: object, key: string | symbol): boolean {
  const result = Reflect.has(target, key);
  return result;
}
```

最后的各自对应的 `handler`

```typescript
const get = createGetter();
const shallowGet = createGetter(false);
const readonlyGet = createGetter(false, true);
const shallowReadonlyGet = createGetter(true, true);

const set = createSetter();
const shallowSet = createSetter(false);

const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys,
};

const readonlyHandlers: ProxyHandler<object> = {
  get: readonlyGet,
  set(target, key) {
    if (__DEV__) {
      warn(
        `Set operation on key "${String(key)}" failed: target is readonly.`,
        target,
      );
    }
    return true;
  },
  deleteProperty(target, key) {
    if (__DEV__) {
      warn(
        `Delete operation on key "${String(key)}" failed: target is readonly.`,
        target,
      );
    }
    return true;
  },
};

const shallowReactiveHandlers = extend({}, mutableHandlers, {
  get: shallowGet,
  set: shallowSet,
});

const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
});
```
