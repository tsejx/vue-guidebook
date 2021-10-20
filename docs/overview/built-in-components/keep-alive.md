---
nav:
  title: 基础
  order: 1
group:
  title: 内置组件
  order: 5
title: keep-alive
order: 4
---

# keep-alive

参考文档：

- [Vue API：内置组件 keep-alive](https://v3.cn.vuejs.org/api/built-in-components.html#keep-alive)

`keep-alive` 组件主要用于保留组件状态或避免重新渲染。

`keep-alive` 有以下三个属性：

- `include`：字符串或正则表达式，只有名称匹配的组件会被匹配；
- `exclude`：字符串或正则表达式，任何名称匹配的组件都不会被缓存；
- `max`：数字，最多可以缓存多少组件实例。

使用方法：

- `<keep-alive>` 包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们。和 `<transition>` 相似，`<keep-alive>` 是一个抽象组件：它自身不会渲染一个 DOM 元素，也不会出现在组件的父组件链中
- 当组件在 `<keep-alive>` 内被切换时，它的 mounted 和 unmounted 生命周期钩子不会被调用，取而代之的是 activated 和 deactivated。（这会运用在 `<keep-alive>` 的直接子节点及其所有子孙节点）

⚠️ 注意：

- `keep-alive` 包裹动态组件时，会缓存不活动的组件实例
- `<keep-alive>` 是用在其一个直属的自组建被切换的情形。如果你在其中有 `v-for` 则不会工作。如果有上述的多个条件性的子元素，`<keep-alive>` 要求同时只有一个子元素被渲染。
