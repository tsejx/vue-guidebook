---
nav:
  title: 基础
  order: 1
group:
  title: 内置组件
  order: 5
title: slot
order: 5
---

# slot

建议优先查阅 [官方文档：插槽](https://vue3js.cn/docs/zh/guide/component-slots.html)

在 Vue2.x 中具名插槽和作用域插槽分别使用 `slot` 和 `slot-scope` 来实现，在 Vue3.0 中将 `slot` 和 `slot-scope` 进行了合并同意使用。

## 基本用法

插槽可分发的类型

1. 字符串
2. 任何模版代码
3. HTML
4. 其他组件

⚠️ 注意：

1. 如果组件内 `<template>` **没有** 包含一个 `<slot>` 元素，则该组件起始标签和结束标签之间的任何内容都会抛弃。
2. **父级模板里的所有内容都是在父级作用域中编译的；子模板里的所有内容都是在子作用域中编译的。**

### 默认插槽

子组件用 `<slot>` 标签来确定渲染的位置，标签里面可以放 DOM 结构，当父组件使用的时候没有往插槽传入内容，标签内 DOM 结构就会显示在页面。

父组件在使用的时候，直接在子组件的标签内写入内容即可

```xml
<!-- 父组件 -->
<Child>
  <div>默认插槽</div>
</Child>

<!-- 子组件 -->
<template>
  <slot>
    <p>插槽后备的内容</p>
  </slot>
</template>
```

### 具名插槽

具名插槽就是加了一个指向，不同的内容分发到不同的指定位置。

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

  <!-- v-slot 的缩写是井号（#） -->
  <template #footer>
    <p>Here's some contact info</p>
  </template>
</base-layout>
```

现在 `<template>` 元素中的所有内容都将会被传入相应的插槽。

⚠️ **注意：** `v-slot` 只能添加在 `<template>` 上

### 作用域插槽

作用域插槽就是将子组件的数据反馈到父组件，父组件对数据进行编辑，然后再插入到子组件指定位置。

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

|               | 默认插槽                                                           | 具名插槽                                                                                                | 作用域插槽                                                                                                                                              |
| :------------ | :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `<slot>` 标签 | 没有任何 attribute                                                 | `name`                                                                                                  | 绑定数据，通过 `slot` 标签的 props，可以绑定多个                                                                                                        |
| 使用方式      | 1. 直接将内容放入组件标签内部<br>2. `v-slot:default` 或 `#default` | 1. `slot`：要对应组件中 `slot` 标签上 `name` attribute<br>2. `v-slot`：作为指令参数，如 `v-slot:header` | 1. `<slot-scope>`：接收对象，可以用 `slotProps.<xxx>` 引用 `slot` 绑定的数据<br>2. `v-slot`：接收对象，作为指令值，如 `v-slot:header="headerSlotProps"` |
| 拓展          | -                                                                  | 插槽名可以是动态值                                                                                      | 可以通过解构直接获取属性使用，当然也可以重命名和定义默认值                                                                                              |

⚠️ 注意：

1. Vue2.6+ 两种用法都可以，Vue3.0 后 `slot` 和 `slot-scope` 不可用
2. `v-slot` 必须用在 `template` 上，只有默认插槽时例外
