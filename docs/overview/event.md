---
nav:
  title: 用法
  order: 1
title: 事件
order: 2
---

# 事件
事件接口

* `$on(eventName)` 监听事件
* `emit(eventName)` 触发事件

vm.$emit(event, [...args])

* event 派发事件名（String）
* args 参数列表（Any）

vm.$on(event, callback)

通常业务中 emit 在父作用域进行触发，通知子组件进行执行事件



[深入理解 e.target 与 e.currentTarget](https://juejin.im/post/59f16ffaf265da43085d4108)