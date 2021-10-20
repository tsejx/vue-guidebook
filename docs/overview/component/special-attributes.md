---
nav:
  title: 基础
  order: 1
group:
  title: 组件化
  order: 2
title: 元素属性
order: 2
---

# 元素属性

## 自定义元素属性

在 Vue 中使用 HTML5 自定义属性 `data-*`。

### 静态赋值

代码示例：

```xml
<template>
  <img
    class="img"
    v-for="(item, index) in imgs"
    :key="item.id"
    :src="item.url"
    data-type="img"
    @click="choose($event, index)"
  />
</template>
```

获取自定义属性：

```js
{
  choose(e, index) {
    this.imgIndex = index;
    console.log(e.target.dataset.type);   // 'img'
  }
}
```

### 动态赋值

动态赋值和静态赋值的区别就是在 `data-*` 前添加冒号（`:`）。

#### 动态赋值为字符串类型

```xml
<template>
  <img
    class="img"
    v-for="(item, index) in imgs"
    :key="item.id"
    :src="item.url"
    :data-item="item"
    @click="choose($event, index)"
  />
</template>
```

#### 动态赋值为对象类型

如果动态赋值的值为对象类型，需要通过 `JSON.stringify()` 转化为字符串类型。

```xml
<template>
  <img
    class="img"
    v-for="(item, index) in imgs"
    :key="item.id"
    :src="item.url"
    :data-item="JSON.stringify(item)"
    @click="choose($event, index)"
  />
</template>
```

获取属性：

```js
{
  choose(e, index) {
    console.log(JSON.parse(e.target.dataset.item));
  }
}
```

## 特殊元素属性

### key

`key`：用于 Vue 的虚拟 DOM 算法新旧 Nodes 对比辨识

```html
<ul>
  <li v-for="item in items" :key="item.id">...</li>
</ul>
```

### ref

`ref`：用于元素或自组建注册引用信息

```xml
<!-- vm.$refs.p 会是 DOM 节点 -->
<p ref="p">hello</p>

<!-- vm.$refs.child 会是子组件实例 -->
<child-component ref="child"></child-component>

<!-- 当动态绑定时，我们可以将ref定义为回调函数，显式地传递元素或组件实例 -->
<child-component :ref="(el) => child = el"></child-component>
```

- 参考 [子组件 Refs](https://vue3js.cn/docs/zh/guide/component-template-refs.html)

### is

`is`：用于动态组件

```xml
<!-- component changes when currentView changes -->
<component :is="currentView"></component>
```

- 参考 [动态组件](https://vue3js.cn/docs/zh/guide/component-dynamic-async.html)
- 参考 [DOM 模版解析说明](https://vue3js.cn/docs/zh/guide/component-basics.html#dom-template-parsing-caveats)
