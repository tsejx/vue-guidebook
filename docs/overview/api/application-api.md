---
nav:
  title: 基础
  order: 1
group:
  title: API
  order: 10
title: 应用 API
order: 2
---

# 应用 API

| 应用 API    | 说明                                         |
| :---------- | :------------------------------------------- |
| `config`    | 包含应用配置的对象                           |
| `component` | 注册或检索全局组件                           |
| `directive` | 注册或检索全局指令                           |
| `mixin`     | 将一个 `mixin` 应用在整个应用范围内          |
| `provide`   | 设置一个可以被注入到应用范围内所有组件中的值 |
| `mount`     | 挂载应用实例到根节点                         |
| `unmount`   | 卸载应用实例的根组件                         |
| `use`       | 安装 Vue 插件                                |
| `version`   | 以字符串形式提供已安装的 Vue 的版本号        |

## config

包含应用配置的对象。

相关官方文档：

- [应用 API：config](https://vue3js.cn/docs/zh/api/application-api.html#config)
- [应用配置](https://vue3js.cn/docs/zh/api/application-config.html)

## component

注册或检索全局组件。注册还会使用给定的 `name` 参数自动设置组件的 `name`。

相关官方文档：

- [应用 API：component](https://vue3js.cn/docs/zh/api/application-api.html#component)
- [组件基础](https://vue3js.cn/docs/zh/guide/component-basics.html)

## directive

注册或检索全局指令。

相关官方文档：

- [应用 API：directive](https://vue3js.cn/docs/zh/api/application-api.html#directive)
- [自定义指令](https://vue3js.cn/docs/zh/guide/custom-directive.html)

## mixin

将一个 `mixin` 应用在整个应用范围内。一旦注册，它们就可以在当前的应用中任何组件模板内使用它。插件作者可以使用此方法将自定义行为注入组件。不建议在应用代码中使用。

相关官方文档：

- [全局 mixin](https://v3.cn.vuejs.org/guide/mixins.html#%E5%85%A8%E5%B1%80-mixin)

## provide

设置一个可以被注入到应用范围内所有组件中的值。组件应该使用 inject 来接收 provide 的值。

- 该方法不应该与 [provide 组件选项](https://v3.cn.vuejs.org/api/options-composition.html#provide-inject) 或组合式 API 中的 [provide 方法](https://v3.cn.vuejs.org/api/composition-api.html#provide-inject) 混淆。虽然它们也是相同的 `provide`/`inject` 机制的一部分，但是是用来配置组件 provide 的值而不是应用 provide 的值。
- 通过应用提供值在写插件时尤其有用，因为插件一般不能使用组件提供值。这是使用 [globalProperties](https://v3.cn.vuejs.org/api/application-config.html#globalproperties) 的替代选择。

## mount

所提供 DOM 元素的 innerHTML 将被替换为应用根组件的模板渲染结果。

## unmount

卸载应用实例的根组件。

## use

安装 Vue.js 插件。

- 如果插件是一个对象，它必须暴露一个 install 方法；
- 如果它本身是一个函数，它将被视为安装方法。

该安装方法将以应用实例作为第一个参数被调用。传给 use 的其他 options 参数将作为后续参数传入该安装方法。

相关参考文档：

- [插件](https://v3.cn.vuejs.org/guide/plugins.html)
