---
nav:
  title: 生态
  order: 4
title: Vuex
order: 2
---

# Vuex

Vuex 实现了单向数据流，在全局拥有一个 State 存放数据，所有修改 State 的操作必须通过 Mutation 进行，Mutation 的同时提供了订阅者模式供外部插件调用获取 State 数据的更新。所有异步接口需要走 Action，常见于调用后端接口异步获取更新数据，而 Action 也是无法直接修改 State 的，还是需要通过 Mutation 来修改 State 数据。最后，根据 State 的变化，渲染到视图上。Vuex 运行以来 Vue 内部数据双向绑定机制，需要 new Vue 实现响应式化，所以 Vuex 是专门为 Vue.js 设计的状态管理库。

**适用场景：**

- 大型项目，层级过深带来的数据传递成本过高
- 多组件共享状态，组件间通信或事件总线不满足需求
