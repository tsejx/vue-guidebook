---
nav:
  title: 基础
  order: 1
group:
  title: 基础概念
  order: 1
title: 样式设置
order: 7
---

# 样式设置

在 Vue.js 中，`class` 和 `style` 表达式的类型除了字符串之外，还可以是对象或数组。

## 基本用法

### 对象语法

```js
{
  data() {
    return {
      isActive: true,
      hasError: false
    }
  }
}
```

```html
<!-- 渲染前 -->
<div class="static" :class="{ active: isActive, danger: hasError }"></div>

<!-- 渲染后 -->
<div class="static active"></div>
```

绑定的数据对象不必内联定义在模版中：

```js
{
  data() {
    return {
      clsObject: {
        active: true,
        danger: false
      }
    }
  }
}
```

```html
<div class="static" :class="clsObject"></div>
```

当然也可以采用计算属性的方式：

```js
{
  data() {
    return {
        isActive: true,
        error: null
      }
    }
  ,
  computed: {
    clsObject() {
      return {
        active: this.isActive && !this.error,
        danger: this.error && this.error.type === 'fatal'
      }
    }
  }
}
```

```html
<div :class="clsObject"></div>
```

### 数组语法

```js
data() {
  return {
    activeClass: 'active',
    errorClass: 'text-danger'
  }
}
```

```html
<!-- 渲染前 -->
<div :class="[activeClass, errorClass]"></div>

<!-- 渲染后 -->
<div class="active text-danger"></div>
```

在数组语法中也可以使用对象语法：

```html
<div :class="[{ active: isActive }, errorClass]"></div>
```

### 在组件上使用

```js
const app = Vue.createApp({});

app.component('my-component', {
  template: `<p class="a b">Hello world!</p>`,
});
```

使用时添加 `class` 类名：

```js
<div id="app">
  <my-component class="baz boo"></my-component>
</div>
```

如果组件有多个根元素，需要定义哪些部分将接收这个类。可以用 `$attrs` 组件属性执行此操作：

```js
<div id="app">
  <my-component class="baz"></my-component>
</div>
```

```js
const app = Vue.createApp({});

app.component('my-component', {
  template: `
    <p :class="$attrs".class">Hi!</p>
    <span>This is a child component</span>
  `,
});
```
