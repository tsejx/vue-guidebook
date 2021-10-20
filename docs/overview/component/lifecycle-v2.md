---
nav:
  title: 基础
  order: 1
group:
  title: 组件化
  order: 2
title: 生命周期 v2
order: 2
---

# 生命周期 v2

**生命周期**：就是从一个组件或实例开始初始化、创建实例到该实例被销毁的过程。

在这个过程中需要设置**数据监听**、**编译模版**、**挂载实例**到 DOM 并在数据变化时**更新** DOM 等。

同时，在这个过程中 Vue 给开发者提供了很多方法，也就是所说的**生命周期钩子函数**。

由此，真正的生命周期是一个流程，而不是单单的几个钩子函数，钩子函数只是用来在流程的不同阶段帮助我们做更多的事情。

```jsx | inline
import React from 'react';
import img from '../../assets/lifecycle.png';

export default () => <img alt="Vue生命周期" src={img} width={520} />;
```

## 钩子函数

### create

**实例化 Vue 阶段。**

在谈到 Vue 的生命周期的时候，我们首先需要创建一个实例，也就是在 `new Vue()` 对象过程中，首先执行了 `init` 函数（`init` 是 Vue 构造函数内部默认执行的），为当前实例完成 `基础配置`，包括定义 Vue 构造函数上的 **静态方法** 以及相关的 **生命周期钩子函数**。

在 `beforeCreate` 和 `created` 的钩子调用是在 `initState` 前后，该函数作用是初始化 `props`、`data`、`methods`、`computed`、`watch` 等属性，因此 `beforeCreated` 的钩子函数也就无法获取到 `props` 和 `data` 等定义的值，也不能调用 `methods` 中定义的函数。

在这俩个钩子函数执行的时候，并没有渲染 DOM，所以我们也不能够访问 DOM，一般来说，如果组件在加载的时候需要和后端有交互，放在这俩个钩子函数执行都可以，如果是需要访问 `props`、`data` 等数据的话，就需要使用 `created` 钩子函数。

完成配置对象的初始化后，会调用 <span style="color:red;font-weight:bold">created</span> 生命周期钩子函数，这个时候 **Vue 对象实例化完毕**，DOM 树依旧未生成，页面还是一片空白，但是，实例已完成以下配置：**数据观察**（data observer）、**属性和方法运算** 以及 **watch / event 事件回调**。此时，该钩子函数适合 **处理网络请求** 等逻辑操作。

如果在实例化配置中存在 `el` 选项，实例将立即进入 `编译阶段`，否则，则停止编译，也就意味着停止了生命周期，知道在该 Vue 实例上调用 `vm.$mount(el)`。

**编译阶段**，如果存在 `render` 选项，则 `template` 将被忽略，因为 `render` 渲染函数是字符串模版的代替方案。如果存在 `template` 选项，则会通过 `compiler` 编译成 `render function`（渲染函数），预编译是在 Webpack 等构建工具中完成的，而运行时编译则是在运行时编译的。如果既无 `render` 选项也无 `template` 选项，则查找 `el` 选项的 `outerHTML` 作为 `template` 并编译成 `render function`。

> 💡 优先级：render 选项 > template 选项 > outerHTML

### mount

开始挂载前，会先执行钩子函数 <span style="color:red;font-weight:bold">beforeMount</span>，编译 `template` 里的内容并在虚拟 DOM 中执行，页面上依旧没有任何展示。

接着，Vue 内部将给 `vm` 实例对象添加 `$el` 属性，并使用编译好的 HTML 内容替换 `el` 选项指向的 DOM 对象或者选择对应的 HTML 标签里面的内容。当真实 DOM 挂载完毕后，执行 <span style="color:red;font-weight:bold">mounted</span> 钩子函数。此时，该钩子函数适合用于 **访问真实 DOM 数据坐标信息**。

⚠️ **注意**：`created` 阶段的网络请求与 `mounted` 请求的区别：前者页面视图未出现，如果请求信息过多，页面会长时间处于白屏状态。

### update

当数据产生变化，会进入更新周期函数并先调用 <span style="color:red;font-weight:bold">beforeUpdate</span>，这个钩子中可进一步修改 `$vm.data`，但是不会触发附加的重渲染过程。然后经过新旧对比产生新的 VirtualDOM 并进行重渲染，更新完成后将调用 `updated` 钩子函数。

当 <span style="color:red;font-weight:bold">updated</span> 钩子调用时，组件 DOM 的 `data` 已经更新，所以你现在可以执行依赖于 DOM 的操作。但是不要在此时修改 `data`，否则会再次触发 `beforeUpdate`、`updated` 这个两个钩子，导致进入死循环。

### destroy

<span style="color:red;font-weight:bold">beforeDestroy</span> 钩子函数在实例销毁钱调用，在这步，实例仍然可用。

beforeDestroyed 钩子函数在 Vue 实例销毁后调用。调用后，Vue 实例指示的所有东西都会解绑定，所有的事件监听器会被移除，所有的子实例也会被销毁。

### activated & deactivated

为 keep-alive 组件定制的钩子函数。

### renderError

在这个过程当中，Vue 为我们提供了 `renderError` 方法，这个方法只有在开发的时候才会被调用，在正式打包上线过程当中，它是不会被调用的。它主要是帮助我们调试 `render` 里面的一些错误。

```js
renderError(h, err){
  return h('div', {}, err.stack)
}
```

有且只有当 `render` 方法里面报错了，才会触发 `renderError` 方法。

所以我们主动让 `render` 函数报个错。

## 总结

| 生命周期钩子  | 组件状态                                                                                                                            | 最佳实践                                                     |
| :------------ | :---------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| beforeCreated | 实例初始化后，`this` 指向创建的实例<br/>但是不能访问到 data、computed、watch 和 methods 上的方法和数据                              | 常用于初始化非响应式变量                                     |
| created       | 实例创建完成，可访问 data、computed、watch 和 methods 上的方法和数据<br/>未挂载到 DOM，不能访问 `$el` 属性，`$ref` 属性内容为空数组 | 常用于简单的 AJAX 请求，页面的初始化                         |
| beforeMount   | 在挂载开始之前被调用<br/>`beforeMount` 之前，会找到对应的 template，并编译成 render 函数                                            |                                                              |
| mounted       | 实例挂载到 DOM 上，此时可以通过 DOM API 获取到 DOM 节点，`$ref` 属性可以访问                                                        | 常用于获取 VNode 信息和操作，AJAX 请求                       |
| beforeUpdate  | 响应式数据更新时调用，发生在 Virtual DOM 打补丁前                                                                                   | 适合在更新之前访问现有的 DOM，比如手动移除已添加的事件监听器 |
| updated       | Virtual DOM 重新渲染和打补丁之后调用，组件 DOM 已经更新，可执行依赖于 DOM 的操作                                                    | 避免在这个钩子函数中操作数据，可能陷入死循环                 |
| beforeDestroy | 实例销毁之前调用。这一步，实例仍然完全可用，`this` 仍能获取到实例引用                                                               | 常用于销毁定时器、解绑全局事件、销毁插件对象等操作           |
| destroyed     | 实例销毁后调用，调用后，Vue 实例指示的所有东西都会解绑定，所有的事件监听器会被移除，所有的子实例也会被销毁                          |                                                              |

## 父子组件生命周期执行顺序

Vue 的父组件和子组件生命周期钩子函数执行顺序可以归类为以下四部分：

- **加载渲染过程**

```
父 beforeCreate -> 父 created -> 父 beforeMount -> 子 beforeCreate -> 子 created -> 子 beforeMount -> 子 mounted -> 父 mounted
```

- **子组件更新过程**

```
父 beforeUpdate -> 子 beforeUpdate -> 子 updated -> 父 updated
```

- **父组件更新过程**

```
父 beforeUpdate -> 父 updated
```

- **销毁过程**

```
父 beforeDestroy -> 子 beforeDestroy -> 子 destroyed -> 父 destroyed
```

## 父组件监听子组件生命周期

比如有父组件 Parent 和子组件 Child，如果父组件监听到子组件挂载 `mounted` 就做一些逻辑处理，可以通过以下写法实现：

```js
// Parent.vue
<Child @mounted="mountedCallback"/>

// Child.vue
mounted() {
  this.$emit("mounted");
}
```

以上需要手动通过 `$emit` 触发父组件的事件，更简单的方式可以在父组件引用子组件时通过 `@hook` 来监听即可，如下所示：

```js
// Parent.vue
<Child @hook:mounted="mountedCallback"></Child>

mountedCallback () {
  console.log('父组件监听到 mounted 钩子函数')
}

// Child.vue
mounted () {
  console.log('子组件触发 mounted 钩子函数')
}

// 以上输出顺序为：
// 子组件触发 mounted 钩子函数
// 父组件监听到 mounted 钩子函数
```

当然 `@hook` 方法不仅仅是可以监听 `mounted`，其他的生命周期事件，例如：`created`、`updated` 等都可以监听。

---

**参考资料：**

- [Vue 的钩子函数](https://juejin.im/post/5b41bdef6fb9a04fe63765f1#heading-17)
- [如果解释 Vue 生命周期才能令面试官满意](https://juejin.im/post/5ad10800f265da23826e681e)
- [生命周期二次学习与理解](https://www.cnblogs.com/padding1015/p/9159381.html)
- [从源码解读 Vue 生命周期，让面试官对你刮目相看](https://juejin.im/post/5d1b464a51882579d824af5b)
