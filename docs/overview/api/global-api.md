---
nav:
  title: 基础
  order: 1
group:
  title: API
  order: 10
title: 全局 API
order: 3
---

# 全局 API

| 全局 API                  | 说明                                                                                                                 |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------- |
| `createApp`               | 返回一个提供应用上下文的应用实例。应用实例挂载的整个组件树共享同一个上下文。                                         |
| `h`                       | 返回虚拟 DOM 节点                                                                                                    |
| `defineComponent`         | 创建组件                                                                                                             |
| `defineAsyncComponent`    | 创建一个只有在需要时才会加载的异步组件                                                                               |
| `defineCustomElement`     | 创建可用于任意框架的 [自定义元素](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_custom_elements) |
| `resolveComponent`        | 解析获取指定名称的组件                                                                                               |
| `resolveDynamicComponent` | 解析获取指定名称的动态组件                                                                                           |
| `resolveDirective`        | 解析获取指定名称的指令                                                                                               |
| `withDirectives`          | 将指令应用于虚拟 DOM 节点中                                                                                          |
| `createReanderer`         | 创建自定义渲染器                                                                                                     |
| `nextTick`                | 将回调推迟到下一个 DOM 更新周期之后执行                                                                              |
| `mergeProps`              | 合并传递参数                                                                                                         |
| `useCssModule`            | 在 `setup` 单文件组件函数中访问 CSS 模块                                                                             |
| `version`                 | 以字符串形式提供已安装的 Vue 的版本号                                                                                |

## createApp

## h

返回一个 "虚拟节点“，通常缩写为 **VNode**：一个普通对象，其中包含向 Vue 描述它应在页面上渲染哪种节点的信息，包括所有子节点的描述。它的目的是用于手动编写的渲染函数：

```js
render() {
  return h('h1', {}, 'Some titlte')
}
```

## defineComponent

从实现上看，`defineComponent` 只返回传递给它的对象。但是，就类型而言，返回的值有一个合成类型的构造函数，用于手动渲染函数、TSX 和 IDE 工具支持。

## defineAsyncComponent

创建一个只有在需要时才会加载的异步组件。

相关官方文档：

- [异步组件](https://vue3js.cn/docs/zh/guide/migration/async-components.html)

## resolveComponent

`resolveComponent` 只能在 `render` 或 `setup` 函数中使用。

## version

以字符串形式提供 1⃣️ 安装的 Vue 的版本号。
