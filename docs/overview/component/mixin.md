---
nav:
  title: 基础
  order: 1
group:
  title: 组件化
  order: 2
title: 混入 Mixin
order: 20
---

# 混入 Mixin

相关官方文档链接：

- [可复用&组合：混入](https://vue3js.cn/docs/zh/guide/mixins.html)

混入 (mixin) 提供了一种非常灵活的方式，**来分发 Vue 组件中的可复用功能**。一个混入对象可以包含任意组件选项。当组件使用混入对象时，所有混入对象的选项将被 **混合** 进入该组件本身的选项。

## 选项合并

- 同名数据状态 `data`，最终的状态属性值以组件内部定义的为准
- 同名钩子函数诸如 `created`，会合并为数组，混入的钩子在组件自身钩子之前调用
- 同名选项 `methods`、`components`、`directives`，将被合并为同一个对象，两个对象键名冲突时，取组件对象的键值对

## 存在的问题

在 Vue 2 中，`mixin` 是将部分组件逻辑抽象成可重用块的主要工具。但是，他们有几个问题：

- `mixin` 很容易发生冲突：因为每个特性的属性都被合并到同一个组件中，所以为了避免 `property` 名冲突和调试，你仍然需要了解其他每个特性
- 可重用性是有限的：我们不能向 `mixin` 传递任何参数来改变它的逻辑，这降低了它们在抽象逻辑方面的灵活

为了解决这些问题，我们添加了一种通过逻辑关注点组织代码的新方法：[组合式 API](https://vue3js.cn/docs/zh/guide/composition-api-introduction.html)。
