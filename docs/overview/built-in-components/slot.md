---
nav:
  title: 基础
  order: 1
group:
  title: 内置组件
  order: 5
title: Slot
order: 2
---

# Slot

建议优先查阅 [官方文档：插槽](https://vue3js.cn/docs/zh/guide/component-slots.html)

在 Vue2.x 中具名插槽和作用域插槽分别使用 `slot` 和 `slot-scope` 来实现，在 Vue3.0 中将 `slot` 和 `slot-scope` 进行了合并同意使用。

## 基本用法

1. 字符串
2. 任何模版代码
3. HTML
4. 其他组件

如果组件内 `template` **没有** 包含一个 `<slot>` 元素，则该组件起始标签和结束标签之间的任何内容都会抛弃。

**父级模板里的所有内容都是在父级作用域中编译的；子模板里的所有内容都是在子作用域中编译的。**

### 具名插槽

有时我们需要多个插槽。

```html
<!-- 组件内部 -->
<div class="container">
  <header>
    <!-- 我们希望把页头放这里 -->
  </header>
  <main>
    <!-- 我们希望把主要内容放这里 -->
  </main>
  <footer>
    <!-- 我们希望把页脚放这里 -->
  </footer>
</div>
```

对于这种情况，`<slot>` 元素有个特殊的 attribute：`name`。这个 attribute 可以用来定义额外的插槽。

```html
<!-- 组件内部 -->
<div class="container">
  <header>
    <slot name="header"></slot>
  </header>
  <main>
    <slot></slot>
  </main>
  <footer>
    <slot name="footer"></slot>
  </footer>
</div>
```

一个不带 `name` 的 `<slot>` 出口会带有隐含的名字 `default`。

在向具名插槽提供内容的时候，我们可以在一个 `<template>` 元素上使用 `v-slot` 指令，并以 `v-slot` 的参数的形式提供其名称：

```html
<!-- 父组件 -->
<base-layout>
  <template v-slot:header>
    <h1>Here might be a page title</h1>
  </template>

  <template v-slot:default>
    <p>A paragraph for the main content.</p>
    <p>And another one.</p>
  </template>

  <template v-slot:footer>
    <p>Here's some contact info</p>
  </template>
</base-layout>
```

现在 `<template>` 元素中的所有内容都将会被传入相应的插槽。

⚠️ **注意：** `v-slot` 只能添加在 `<template>` 上

### 作用域插槽

有时让插槽内容能够访问子组件中才有的数据是很有用的。当一个组件被用来渲染一个项目数组时，这是一个常见的情况，我们希望能够自定义每个项目的渲染方式。

```html
<!-- Parent -->
<todo-list>
  <template v-slot:default="slotProps">
    <span class="green">{{ slotProps.item }}</span>
  </template>
</todo-list>

<!-- Child -->
<ul>
  <li v-for="(item, index) in items">
    <slot :item="item"></slot>
  </li>
</ul>
```

可以简写为：

```html
<todo-list>
  <template #default="{slotProps}">
    <span class="green">{{ slotProps.item }}</span>
  </template>
</todo-list>
```

## 总结

## 参考资料

- [通过插槽分发内容](https://vue3js.cn/docs/zh/guide/component-basics.html#content-distribution-with-slots)
