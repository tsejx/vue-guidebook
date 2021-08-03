---
nav:
  title: 用法
  order: 1
title: 插槽
order: 3
---

# 插槽

如何理解 Vue 组件中的 slot？

作者：HcySunYang

结论一：**插槽就是一个返回 VNode 的函数而已。**

结论二：**普通插槽和作用域插槽根本就没有区别，因为普通插槽就是作用域插槽的子集，这也是 Vue 为什么将二者合并的原因。**

接下来我就证明给您看，希望能够真的让您理解插槽。不过开始之前我们需要达成一个共识，那就是组件的核心是什么？一句话：组件的核心是它能够产出一坨 VNode。对于 Vue 来说一个组件的核心就是它的渲染函数，组件的挂载本质就是执行渲染函数并得到要渲染的 VNode，至于什么 data/props/computed 这都是为渲染函数产出 VNode 过程中提供数据来源服务的，最最最最关键的就是组件最终产出的 VNode，因为这个才是要渲染的内容。

这里备注一下：在 Vue 中我们习惯把虚拟 DOM 称为 VNode，它既可以代表一个 VNode 节点，也可以代表一颗 VNode 树。

回到正题，既然要说明 slot，那就必须有父子组件才行，所以接下来的例子设定是：在父组件中使用了子组件并传递了插槽给子组件。

首先假设父组件的模板如下：

```html
<!-- 父组件模板 -->
<MyComponent></MyComponent>
```

我们在父组件中使用了一个叫做 MyComponent 的子组件，我们没有为子组件提供任何插槽，最终父组件的模板编译后得到的 render 函数可以表示为：

```js
render() {
  return h('MyComponent')
}
```

现在我们为子组件提供一个普通插槽：

```html
<!-- 父组件模板 -->
<MyComponent>
  <div></div>
</MyComponent>
```

这是一个默认插槽，因为它没有名字。这时父组件编译后的渲染函数可以表示为：

```js
render() {
  return h('MyComponent', {
    slots: {
      default: h('div')
    }
  })
}
```

在渲染器渲染如上 VNode 时，渲染器知道 MyComponent 是组件，所以会创建一个组件实例，在创建组件实例的时候，是能够拿到插槽数据的，也就是这个对象：

```js
slots: {
  default: h('div')
}
```

所以在创建实例的过程中我们可以把这个对象添加到组件实例上，这样子组件中就能够通过组件实例拿到从父组件中传递过来的 slots 数据，怎么拿呢？这么拿呗：`this.$slots.default`。

子组件的实例创建完后，那就开始渲染子组件的内容呗，假设子组件的模板如下：

```html
<!-- 子组件模板 -->
<section>
  <slot />
</section>
```

那么子组件的模板经过编译后，其渲染函数可以表示为：

```js
render() {
  return h('section', this.$slot.default)
}
```

看到了吧，你把这里的 `this.$slot.default` 替换成从父组件传递过来的数据，不就是：

```js
render() {
  return h('section', h('div'))
}
```

这样，渲染器就把父组件传递过来的 VNode 渲染成 `<section>` 标签的子节点了。至于具名插槽，那就把 `this.$slots.default` 中的 `default` 换成插槽的名称就行了，编译器是知道插槽的名称的，因为你都写在模板里了，例如：

```html
<section>
  <slot name="xxoo">
</section>
```

编译成的就是：

```js
render() {
  return h('section', this.$slot.xxoo)
}
```

至于作用域插槽，与普通插槽唯一的区别就是，编译器会把作用域插槽编译成函数，一个返回 VNode 的函数，而非像普通插槽一样直接编译成 VNode，假设父组件的模板是：

```html
<!-- 父组件模板 -->
<MyComponent>
  <div slot="xxoo" slot-scope="scopeData">
    {{ scopeData.a }}
  </div>
</MyComponent>
```

则会把它编译成：

```js
render() {
  return h('MyComponent', {
    scopedSlots: {
      xxoo: function(scopeData) {
        return h('div', scopeData.a)
      }
    }
  })
}
```

同样的，在创建子组件实例的时候一样可以拿到 scopedSlots 数据，并把 scopedSlots 数据添加到组件实例对象上，所以在子组件的渲染函数中可以这样拿到作用域插槽要渲染的内容：

```js
// 子组件的渲染函数
render() {
  return h('section', this.$scopedSlots.xxoo())
}
```

因为 `this.$scopedSlots.xxoo` 是一个函数，所以我们需要执行它，而正式因为它是函数所以才给了我们为它传递参数的机会，例如：

```js
// 子组件的渲染函数
render() {
  return h('section', this.$scopedSlots.xxoo({
    a: this.a,
    b: this.b
  }))
}
```

如上代码所示，我们传递了一个对象过去。这里是关键，大家注意，上面的代码是子组件的渲染函数，所以我们可以把子组件的数据传递过去，再回过头来看一下 xxoo 函数：

```js
xxoo: function(scopeData) {
        return h('div', scopeData.a)
      }
```

这里的 scopeData 就是我们从子组件传递过来的对象，而 `scopeData.a` 就是子组件的数据，这就是作用域插槽的原理。

现在我们来对比一下普通插槽和作用域插槽的区别：

```js
// 普通插槽
slots: {
  xxoo: h('div')
}
// 作用域插槽
scopedSlots: {
  xxoo: (scopedData) => h('div', scopedData.a)
}
```

实际上在 Vue2.6 之前，普通插槽的渲染作用域是在父组件，等到子组件拿到该插槽的时候，已经是渲染完的 vnode 了，所以是什么就展示什么。作用域插槽和普通插槽的区别在于，子组件拿到它的时候它还是一个函数，只有你执行该函数，它才会返回要渲染的内容(即 vnode)，所以就给了你在子组件中传递参数(子组件数据)过去的机会，同时由于该函数也能访问父组件作用域的数据，所以对于作用域插槽来说能同时展示父子组件的数据，这就是为什么我说普通插槽和作用域插槽的区分是一个伪区分，因为当你不给作用域插槽传递参数的时候，那它就是个普通插槽，我们完全可以把普通插槽也编译成函数，只是不传递参数罢了，例如：

```js
// 普通插槽
slots: {
  xxoo: () => h('div')
}
```

这不就是所谓的作用域插槽吗，所以 vue2.6 把二者合并了，无论什么插槽，只要你是插槽你就是一个函数，然后老子在子组件中想怎么摆弄你就怎么摆弄你。

另外，对于 v-slot，这仅仅是应用层的 api 设计，为了解决某些情况下造成的困惑而已，官方文档上贴出来的 RFC 已经说得很明白了，你就学学怎么用就行了，底层原理不会变得。。。

最后表明，我上面的所写的内容不 100% 与 Vue 的实现一致，比如 Vue2.6 之前(2.6 之后的代码我没看)普通插槽的数据是存储在 children 中的，我这里把普通插槽的数据放到了 VNodeData(就是 h 函数的第二个参数) 的 slots 属性下。但是原理一样呀，如果你是框架设计者，你想把数据放哪你说了算。

更新：上文中模板编译成的渲染函数只是示意，2.6 之前获取 slots 数据时有一个 resolve 的过程，但是如果讲出来就有点抓不住主题了，但请放心，绝对没有瞎说 ི。另外为什么强调 2.6 之前呢？因为 2.6 的改动我没看过呀～

[Vue 组件化中 slot 的用法](https://juejin.im/post/5cc856a76fb9a0321141bc32)
