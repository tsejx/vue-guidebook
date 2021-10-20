---
nav:
  title: 基础
  order: 1
group:
  title: 组件化
  order: 2
title: 插槽 Slot
order: 5
---

# 插槽 Slot

Slot 又名插槽，是 Vue 的内容分发机制，组件内部的模板引擎使用 `<slot>` 元素标签作为承载分发内容的出口。插槽 `<slot>` 是子组件的一个模板标签元素，而这一个标签元素是否显示，以及如何显示是由父组件决定的。

通过插槽可以让用户可以拓展组件，去更好地复用组件和对其做定制化处理。如果父组件在使用到一个复用组件的时候，获取这个组件在不同的地方有少量的更改，如果去重写组件是一件不明智的事情。通过 `slot` 插槽向组件内部指定位置传递内容，完成这个复用组件在不同场景的应用：比如布局组件、表格列、下拉选、弹框显示内容等

在 Vue 中插槽（Slot）的类型分为：

- **默认插槽**：又名匿名插槽，当 `slot` 没有指定 `name` 属性值的时候一个默认显示插槽，一个组件内只有一个匿名插槽
- **具名插槽**：带有具体名字的插槽，也就是带有 `name` 属性的 `slot`，一个组件可以出现多个具名插槽
- **作用域插槽**：默认插槽、具名插槽的一个变体，可以是匿名插槽，也可以是具名插槽，该插槽的不同点是在子组件渲染作用域插槽时，可以将子组件内部的数据传递给父组件，让父组件根据子组件的传递过来的数据决定如何渲染该插槽

三种插槽的具体使用指南请查阅 [内置组件 slot](../built-in-components/slot)

## 插槽指令

[Vue3 - v-slot 文档](https://v3.cn.vuejs.org/api/directives.html#v-slot)

`v-slot` 可放置在函数参数位置的 JavaScript 表达式。可选，即只需要在为插槽传入 `props` 的时候使用。

缩写：`#`

适用限制：

- `v-slot` 只能添加到 `<template>` 上，但在 **只有默认插槽** 时可以在组件标签上使用
- 组件（对于一个单独的带 `props` 的默认插槽）

⚠️ 注意：

- 默认插槽名为 `default`，可以省略 `default` 直接写 `v-slot`
- 默认插槽使用缩写为 `#` 时不能不写参数，写成 `#default`
- 可以通过解构获取 `v-slot={userInfo}`，还可以重命名 `v-slot="{userInfo: <userInfoNewName>}"` 和定义默认值 `v-slot="{userInfo = <userDefaultInfo>}"`

## 插槽属性

[Vue3 - $slots 文档](https://v3.cn.vuejs.org/api/instance-properties.html#slots)

`$slots` 用于以编程方式访问通过插槽分发的内容。每个具名插槽都有其相应的 property（例如：`v-slot:foo` 中的内容将会在 `this.$slots.foo()` 中被找到）。`default` property 包括了所有没有被包含在具名插槽中的节点，或 `v-slot:deafult` 的内容。

在使用渲染函数编写一个组件时，访问 `this.$slots` 会很有帮助。

## 实现原理

slot 本质上是返回 VNode 的函数，一般情况下，Vue 中的组件要渲染到页面上需要经过 `template -> render function -> VNode -> DOM` 过程，这里看看 slot 如何实现：

编写一个 `buttonCounter` 组件，使用匿名插槽。

```js
Vue.component('button-counter', {
  template: '<div><slot>我是默认内容</slot></div>',
});
```

使用该组件

```js
new Vue({
  el: '#app',
  template: '<button-counter><span>我是slot传入内容</span></button-counter>',
  components: { buttonCounter },
});
```

获取 `buttonCounter` 组件渲染函数。

```js
(function anonymous() {
  with (this) {
    return _c('div', [_t('default', [_v('我是默认内容')])], 2);
  }
});
```

`_v` 表示普通文本节点，`_t` 表示渲染插槽的函数。

渲染插槽函数 `renderSlot`（做了简化）。

```js
function renderSlot(name, fallback, props, bindObject) {
  // 得到渲染插槽内容的函数
  var scopedSlotFn = this.$scopedSlots[name];
  var nodes;
  // 如果存在插槽渲染函数，则执行插槽渲染函数，生成nodes节点返回
  // 否则使用默认值
  nodes = scopedSlotFn(props) || fallback;
  return nodes;
}
```

`name` 属性表示定义插槽的名字，默认值为 `default`，`fallback` 表示子组件中的 `slot` 节点的默认值。

关于 `this.$scopredSlots` 是什么，我们可以先看看 `vm.$slots`。

```js
function initRender (vm) {
  ...
  vm.$slots = resolveSlots(options._renderChildren, renderContext);
  ...
}
```

`resolveSlots` 函数会对 `children` 节点做归类和过滤处理，返回 `slots`。

```js
function resolveSlots(children, context) {
  if (!children || !children.length) {
    return {};
  }
  var slots = {};
  for (var i = 0, l = children.length; i < l; i++) {
    var child = children[i];
    var data = child.data;
    // remove slot attribute if the node is resolved as a Vue slot node
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot;
    }
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    if ((child.context === context || child.fnContext === context) && data && data.slot != null) {
      // 如果slot存在(slot="header") 则拿对应的值作为key
      var name = data.slot;
      var slot = slots[name] || (slots[name] = []);
      // 如果是tempalte元素 则把template的children添加进数组中，这也就是为什么你写的template标签并不会渲染成另一个标签到页面
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children || []);
      } else {
        slot.push(child);
      }
    } else {
      // 如果没有就默认是default
      (slots.default || (slots.default = [])).push(child);
    }
  }
  // ignore slots that contains only whitespace
  for (var name$1 in slots) {
    if (slots[name$1].every(isWhitespace)) {
      delete slots[name$1];
    }
  }
  return slots;
}
```

`_render` 渲染函数通过 `normalizeScopedSlots` 得到 `vm.$scopedSlots`。

```js
vm.$scopedSlots = normalizeScopedSlots(_parentVnode.data.scopedSlots, vm.$slots, vm.$scopedSlots);
```

作用域插槽中父组件能够得到子组件的值是因为在 `renderSlot` 的时候执行会传入 `props`，也就是上述 `_t` 第三个参数，父组件则能够得到子组件传递过来的值。

步骤：

1. 组件渲染过程：`template >> render function(RF) >> VNode >> DOM`
2. 组件挂载实际上就是执行 RF 生成 VNode
3. 解析父组件，给子组件插槽传入内容
   1. 普通插槽：VNode，在 `this.$slots`
   2. 作用域插槽：函数，接收自组件信息，返回 VNode
4. 解析子组件，替换 `this.$slots.xxx` 或执行 `this.$scopeSLots.xxx`

Vue2.6.0 以后都是执行函数了

1. 作用域插槽函数现在保证返回一个 VNode 数组，除非在返回值无效的情况下返回 `undefined`
2. 所有的 `$slots` 现在都会作为函数暴露在 `$scopedSlots` 中。如果你在使用渲染函数，不论当前插槽是否带来作用域，我们都推荐始终通过 `$scopedSlots` 访问它们。这不仅仅使得在未来添加作用域变得简单，也可以让你最终轻松前一道所有插槽到都是函数的 Vue3

总结：当子组件 `vm` 实例化时，获取到父组件传入的 `slot` 标签的内容，存放在 `vm.$slot` 中，默认插槽为 `vm.$slot.default`，具名插槽为 `vm.$slot.<name>`，`<name>` 为插槽名，当组件执行渲染函数时候，遇到 `slot` 标签，使用 `$slot` 中的内容进行替换，此时可以为插槽传递数据，若存在数据，则可称该插槽为作用域插槽。

## 参考资料

- [官方文档：插槽](https://v3.cn.vuejs.org/guide/component-slots.html)
- [Vue 组件化中 slot 的用法](https://juejin.im/post/5cc856a76fb9a0321141bc32)
- [如何理解 Vue.js 的组件中的 slot？](https://www.zhihu.com/question/37548226)
- [Using templates and slots](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_templates_and_slots)
