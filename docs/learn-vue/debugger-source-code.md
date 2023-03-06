---
title: 调试vue2/3源码
date: 2023-03-06 16:17:47
tag:
  - 调试
  - vue
category:
  - 调试
description: 怎么调试源码
footer: true
---

### 引入

`vue3.x` 和 `vue2.7.x` 都是使用的 `rollup` 打包的, 所以很多配置建议自己去看 [rollup 官网](https://rollupjs.org/configuration-options/)

调试源码我们当然是希望跳到对应的源文件, 而不是压缩后的代码, 而要进入到源文件, 我们需要 `xxx.js.map` 这样的文件

总所周知, 发布的包是不会把对应的 `xxx.js.map` 生成一起发布的, 所以我们自己拉项目的话 只要生成对应的 `xxx.js.map` 文件就好了

### vue3.x

#### 下载

[仓库地址](https://github.com/vuejs/core)

```shell
git clone https://github.com/vuejs/core.git

cd core

pnpm i
```

#### package.json

首先我们需要寻找到项目对应的`打包命令`, 说到命令 我们当然得去 `package.json`的 `scripts` 内寻找

```json
{
  "scripts": {
    "build": "node scripts/build.js"
  }
}
```

根据命令我们能看出 执行的是 `scripts` 下面的 `build.js` 文件

主要执行打包的逻辑 是 `build` 的方法

```javascript
async function build(target) {
  // 省略代码
  await execa(
    'rollup',
    [
      '-c',
      '--environment',
      [
        `COMMIT:${commit}`,
        `NODE_ENV:${env}`,
        `TARGET:${target}`,
        formats ? `FORMATS:${formats}` : ``,
        prodOnly ? `PROD_ONLY:true` : ``,
        sourceMap ? `SOURCE_MAP:true` : ``,
      ]
        .filter(Boolean)
        .join(','),
    ],
    { stdio: 'inherit' },
  );
}
```

可以看出 主要的逻辑 就是 通过 `execa` 来执行 `rollup` 命令, 下面我们看看 对应命令的参数 是怎么获取的

```javascript
const args = minimist(process.argv.slice(2));
const targets = args._;
const formats = args.formats || args.f;
const devOnly = args.devOnly || args.d;
const prodOnly = !devOnly && (args.prodOnly || args.p);
const sourceMap = args.sourcemap || args.s;
const isRelease = args.release;
const buildAllMatching = args.all || args.a;
const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7);
```

1. 通过 `minimist` 解析参数, 比如 `pnpm run build -w --devOnly` 转换成 `{ _: [], w: true, devOnly: true }`
2. 接下来就是 获取 args 中的值

既然我们要生成 `xxx.js.map`文件, 所以我们要开启 `sourcemap`, 通过`const sourceMap = args.sourcemap || args.s;` 我们可以知道, 我们只需要 加上 `--sourcemap` 或者 `--s` (`--` 和 `-` 一样效果)就行

接下来我们执行

```shell
pnpm run build -w -s
```

我们就会发现对应包下面的 `dist` 文件中 已经有 `xxx.js.map`文件了

就此 `vue3.x` 的源码调试准备工作就完成了

#### packages/vue

在 `packages/vue/examples` 包里面新建一个 `test` 文件夹, 并创建一个 `xxxx.html`

```html
<div id="app"></div>
<script src="../../dist/vue.global.js"></script>
<script>
  const { defineComponent, createApp, h } = Vue;
  const App = defineComponent({
    name: 'app',
    template: `<div>你好</div>`,
  });
  createApp(App).mount('#app');
</script>
```

然后就是调试, 你可以在上面的代码里面 加上`debugger` 或者去谷歌浏览器控制台, 打上`断点调试`

### vue2.x

`2.7.x`开始 已经从 `flow` 变成 `typescript`

[仓库地址](https://github.com/vuejs/vue)

```shell
git clone https://github.com/vuejs/vue.git

cd vue

pnpm i
```

#### package.json

```json
{
  "scripts": {
    "build": "node scripts/build.js"
  }
}
```

::: info

看见 `vue2.x` 的 也是 `scripts/build.js`, 我们像 vue3.x 那样 加个 `--sourcemap` 试试

然后你会发现有个报错

```shell
/Users/xxxx/project/source-code/vue/scripts/build.js:39
const output = config.output
                        ^
TypeError: Cannot read properties of undefined (reading 'output')
```

这个报错很常见, 多半这个时候的 `config` 为 `null/undefined`, 我们看看 `build.js` 代码

:::

```javascript
function buildEntry(config) {
  const output = config.output;
  const { file, banner } = output;
  const isProd = /(min|prod)\.js$/.test(file);
  return rollup.rollup(config); // 省略了链式调用 后面的代码
}
```

::: note buildEntry

我们看返回的 `rollup.rollup(config)` 这里可以推断出 这里传入的 应该是 `rollup build config`, 可以类比 `rollup.config.js`, 我们再去找调用 `buildEntry` 这个方法, 看看 `config` 咋来的

:::

```javascript
function build(builds) {
  let built = 0;
  const total = builds.length;
  const next = () => {
    buildEntry(builds[built])
      .then(() => {
        built++;
        if (built < total) {
          next();
        }
      })
      .catch(logError);
  };

  next();
}
```

::: note build

看传入的 `builds[built]` 说明 就是一个 `rollup config`, 那么 `builds` 就是一个 `configs 数组`, 那么怎么才回触发上面的报错呢? `空数组`或者或者是一个`undefined/null` 的数组, 那我们去看看 `builds`

:::

```javascript
let builds = require('./config').getAllBuilds();

if (process.argv[2]) {
  const filters = process.argv[2].split(',');
  builds = builds.filter((b) => {
    return filters.some(
      (f) => b.output.file.indexOf(f) > -1 || b._name.indexOf(f) > -1,
    );
  });
}

build(builds);
```

::: note builds

builds 是通过 `config` 导出的 `getAllBuilds` 返回的, 但是再调用 `build` 之前是不是还有个判断? 看见那个熟悉的 `process.argv[2]`, 是不是想到了 我们刚才 执行的 `pnpm run build --sourcemap`, 用的是一个 `filters` 接收, 看见这个命名, 大概也就能理解 后面的参数是用来`过滤` 打包的模块用的

:::

通过上面的分析, 我们发现, 我们通过加参数,是不能实现生成 对应的`xxx.js.map` 文件了, 既然不行, 我们就从 `rollup` 的 `config` 入手, 打开官方, 因为是打包输出, 所以我们自然而然的找到 `config.output`, 然后通过 `vue3.x`的 `sourcemap`, 找到 [config.output.sourcemap](https://rollupjs.org/configuration-options/#output-sourcemap), 接下来我们就去看看 生成 `builds` 的方法 `getAllBuilds`

```javascript
exports.getAllBuilds = () => Object.keys(builds).map(genConfig);
```

`builds` 的每一项 都执行了 `genConfig` 方法, 所以我们主要看 `genConfig` 方法

```javascript
function genConfig(name) {
  const opts = builds[name];

  // 省略代码

  const config = {
    input: opts.entry,
    external: opts.external,
    plugins: [
      alias({
        entries: Object.assign({}, aliases, opts.alias),
      }),
      ts({
        /** 省略 ts plugin 参数 */
      }),
    ].concat(opts.plugins || []),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || 'Vue',
      exports: 'auto',
    },
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg);
      }
    },
  };

  // 省略代码

  return config;
}
```

::: note genConfig

返回的就是 `rollup` 的 `config`, 所以我们只需要在 `output` 里面 加上 `sourcemap: true`, 就行了

:::

然后我们 执行 `pnpm run build vue.js`, 刚才说了 参数是过滤作用, 因为所有打包耗时, 我们就打包 `vue.js` 就好, 并且我们主要看的也是 `vue.js`

然后 我们看 `dist` 文件夹里面 并没有生成 `vue.js.map` 文件

我们去 `buildEntry` 里面打印下 我们的 `config`, 你会发现 `sourcemap: true` 存在

那我们接着看看 后面的代码执行

```javascript
rollup
  .rollup(config)
  .then((bundle) => bundle.generate(output))
  .then(async ({ output: [{ code }] }) => {
    if (isProd) {
      // prod 包代码压缩 逻辑
      return write(file, minified, true);
    } else {
      return write(file, code);
    }
  });
```

::: note 默认标题

咦执行了 `bundle.generate` 方法, 对应的[文档](https://rollupjs.org/javascript-api/#rollup-rollup)只是大概提了一嘴

但是值得我们注意的有着这么一段英文:

On a bundle object, you can call `bundle.generate` multiple times with different output options objects to generate different bundles in-memory. If you directly want to write them to disk, use `bundle.write` instead

大概的意思是, 对于 `rollup.rollup(config)`返回的一个 `bundle`对象, 我们有两种处理方法, 一种是 `bundle.generate`, 另一种是 `bundle.write`, `generate`是不会有写入 `磁盘` 这个操作的, `write` 有

所以这里调用的 `bundle.generate` 后面自己实现了一个`write`写入文件操作, 所以是没有生成 `xxx.js.map`文件

然后我通过 `rollup.d.ts` 找到了 `bundle`的类型

```typescript
export interface RollupBuild {
  // 省略
  generate: (outputOptions: OutputOptions) => Promise<RollupOutput>;
  // 省略
  write: (options: OutputOptions) => Promise<RollupOutput>;
}
```

我们可以看出 返回结果都是一样的, 所以我们直接把 `generate` 改成 `write` 就好

:::

打开 `dist` 文件, 喔 `vue.js.map` 文件已经有咯, 好了可以开始调试咯

```html
<div id="app">{{ msg }}</div>
<script src="../../dist/vue.js"></script>
<script>
  new Vue({
    el: '#app',
    data() {
      return {
        msg: 'decade',
      };
    },
  });
</script>
```

然后我们 `断点调试` 或者加上 `debugger`, 然后你会发现 并没有进入 源文件 !!! what????

我们想想 `xxx.js.map` 是如何与 `xxx.js` 关联的

在 `xxx.js` 里面应该有 `//# sourceMappingURL=xxx.js.map` 这段

咦! 我们调用 `bundle.write` 应该会生成的啊, !!! 后面还有 自己写的 `write`, 给我们 `bundle.write` 生成的给覆盖(重写)了!, 所以我们 不调用自己写的 `write` 试试

```javascript
if (isProd) {
  // prod 包代码压缩 逻辑
  // return write(file, minified, true);
} else {
  // return write(file, code);
}
```

执行 `pnpm run build vue.js`
调试例子发现, 可以进入了

不调用 本身的 `write`, 控制台又没有输出, 会很难受, 看看 `write` 方法

```javascript
function write(dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report(extra) {
      console.log(
        blue(path.relative(process.cwd(), dest)) +
          ' ' +
          getSize(code) +
          (extra || ''),
      );
      resolve();
    }

    if (!fs.existsSync(path.dirname(dest))) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
    }
    fs.writeFile(dest, code, (err) => {
      if (err) return reject(err);
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err);
          report(' (gzipped: ' + getSize(zipped) + ')');
        });
      } else {
        report();
      }
    });
  });
}
```

::: note write

1. 三个参数分别是 保存的位置, 存入的 code, 是否是能 zip
2. 定义了一个输出的方法
3. 判断是否存在 对于文件, 没有就新建, 有就重写

既然 `code` 没有包含 `//# sourceMappingURL=xxx.js.map` 这段, 那么我们可以自己加上, 修改代码

:::

```javascript
return rollup
  .rollup(config)
  .then((bundle) => bundle.write(output))
  .then(async ({ output: [{ code, map }] }) => {
    if (isProd) {
      // 省略
      return write(file, minified, true);
    } else {
      if (map) {
        const splitArr = file.split('/');
        code += `//# sourceMappingURL=${splitArr[splitArr.length - 1]}.map`;
      }
      return write(file, code);
    }
  });
```

::: note

1. map 只有在 开启了 `sourcemap: true` 才会存在
2. file.split("/") 最后一项就是 打包出来的文件名
3. map 存在 就拼接

:::

### 最后

`vue2.x`, `vue3.x` 怎么打包出来 `xxx.js.map` 文件 就已经完成了

哈哈哈哈
