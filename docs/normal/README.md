---
title: commit 规范
article: false
---

### 格式

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

#### Type

`type` 用于说明 `commit` 的类别, 必须为以下类型的一种：

- feat: 新的功能
- fix: 修复 bug
- docs: 只是文档的更改
- style: 不影响代码含义的更改 (例如空格、格式化、少了分号)
- refactor: 既不是修复 bug 也不是添加新功能的代码更改
- perf: 提高性能的代码更改
- test: 添加或修正测试
- chore: 对构建或者辅助工具的更改, 例如生成文档

#### Scope

`scope` 用于说明 `commit` 影响的范围, 当影响的范围有多个时候, 可以使用 \*.

#### Subject

`subject` 用于对 `commit` 变化的简洁描述：

- 使用祈使句, 一般以动词原形开始, 例如使用 change 而不是 changed 或者 changes
- 第一个字母小写
- 结尾不加句号(.)

#### Body

`body` 用于对 `commit` 详细描述. 使用祈使句, 一般以动词原形开始, 例如使用 change 而不是 changed 或者 changes.

- body 应该包含这次变化的动机以及与之前行为的对比.

#### Footer

`footer` 目前用于两种情况

1. 不兼容的变动

所有不兼容的变动都必须在 `footer` 区域进行说明, 以 `BREAKING CHANGE:` 开头, 后面的是对变动的描述, 变动的理由和迁移注释

```
BREAKING CHANGE: isolate scope bindings definition has changed and
 the inject option for the directive controller injection was removed.

 To migrate the code follow the example below:

 Before:

 scope: {
   myAttr: 'attribute',
 }

 After:

 scope: {
   myAttr: '@',
 }

The removed `inject` wasn't generaly useful for directives so there should be no code using it.

```

2. 关闭 issue

```
## 关闭单个
Closes #123
## 关闭多个
Closes #278, #2222, #8989
```

#### Revert

如果 `commit` 用于撤销之前的 commit, 这个 commit 就应该以 revert: 开头, 后面是撤销这个 commit 的 header. 在 body 里面应该写 This reverts commit `<hash>`., 其中的 hash 是被撤销 commit 的 SHA 标识符

```
revert: feat(pencil): add 'graphiteWidth' option

This reverts commit 667ecc1654a317a13331b17617d973392f415f02.
```
