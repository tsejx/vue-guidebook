---
nav:
  title: 编译
  order: 3
title: 代码编译
order: 1
---

# 代码编译

模版转换成视图的过程

Vue 通过编译将 template 模版转换成渲染函数 render，执行渲染函数就可以得到一个虚拟节点树

在对 Model 进行操作时候，会触发对应 Dep 中的 Watcher 对象。Watcher 对象会调用对应的 update 来修改视图，这个过程主要是将新旧虚拟节点进行差异对比，然后根据对比结果进行 DOM 操作来更新视图。

简单来说，在 Vue 的底层实现上，Vue 将模版编译成虚拟 DOM 渲染函数。结合 Vue 自带的响应系统，在状态改变时，Vue 能够智能地计算出重新渲染组件的最小代价并应用到 DOM 操作上。

```js
template ==compile==> render function ==call==> vnode => path(vnode => oldVnode) => View
```

- **渲染函数**：渲染函数是用于生成 Virtual DOM 的。Vue 推荐使用模版来构建我们的应用界面，在底层实现中 Vue 会将模版编译（Compile）成渲染函数（Render Function），当然我们也可以不写模版，直接写渲染函数，以获得更好的控制。
- VNode 虚拟节点：它可以代表一个真实的 DOM 节点，可以理解为对真实 DOM 节点的内存映射。通过 createElement 方法能将 VNode 渲染成 DOM 节点。简单来说，VNode 可以理解成节点描述对象，它描述了应该怎样去创建真实的 DOM 节点。
- Patch：虚拟 DOM 的核心部分，它可以将 VNode 渲染成真实 DOM，这个过程是对比新旧虚拟节点之间有哪些不同，然后根据对比结果找出需要更新的节点进行更新。这点我们从单词含义可以看出，patch 本身就有打补丁、修补之意，其实际作用是在现有 DOM 树上进行修改来实现更新视图的目的。Vue 的 Virtual DOm Patching 算法是基于 Snabbdom 的实现，并在其基础上坐了很多的调整和改进。

[https://www.zhihu.com/search?type=content&q=Vue%20Virtual%20DOM](https://www.zhihu.com/search?type=content&q=Vue Virtual DOM)

Vue3.x 提出动静结合的 DOM diff 思想。之所以能够做到预编译优化，是因为 Vue core 可以静态分析 template，在解析模版时，整个 parse 的过程是利用正则表达式顺序解析模板，当解析到开始标签、闭合标签、文本的时候都会分别执行对应的回调函数，来达到构造 AST 树的目的。

```js
const ast = parse(template, options);

optimize(ast, options);

const code = generate(ast, options);
```
