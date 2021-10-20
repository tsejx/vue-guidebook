---
nav:
  title: 基础
  order: 1
group:
  title: API
  order: 10
title: 组合式 API
order: 11
---

# 组合式 API

## setup

`setup` 是 Vue3.x 新增的一个选项，他是组件内使用 Composition API 的入口。

1. **无法获取 `this`**：`setup` 执行时机是在 `beforeCreate` 之前执行，组件对象还没有创建，组件实例对象 `this` 还不可用，此时 `this` 是 `undefined`，不能通过 `this` 来访问 `data`、`computed`、`methods` 或 `props`
2. **返回值**：返回对象中的属性会与 `data` 函数返回的对象属性合并成为组件对象属性，返回对象中的方法会与 `methods` 中的方法合并成为组件对象的方法，如有重名，`setup` 优先
3. **无法获取 `data` 或 `methods` 内容**：因为 `setup` 中 `this` 不可用，`methods` 中可以访问 `setup` 提供的属性和方法，但在 `setup` 方法中不能访问 `data` 和 `methods` 中的内容，所以不建议混合使用
4. **不可添加 `async`**：`setup` 不能是一个 `async` 函数，因为返回值不再是 `return` 的对象，而是 `promise`，模版中就不可以使用 `return` 中返回对象的数据了

使用 `setup` 时，它接受两个参数：

1. `props`：组件传入的属性对象，含有父组件向子组件传递的数据，并且是在子级组件中使用 `props` 接收到的所有属性，由于是响应式的，当传入新的 `props` 时，会及时被更新，所以 <span style="color: red;font-weight: bold">不可以使用 ES6 解构</span>，解构会消除它的响应式。
2. `context`：上下文对象，可通过 ES6 语法解构
   1. `attrs`：获取当前组件标签上所有没有通过 `props` 接收的属性的对象，相当于 `this.$attrs`
   2. `slots`：包含所有传入的插槽内容的对象，相当于 `this.$slots`
   3. `emit`：用来分发自定义事件的函数，相当于 `this.$emit`

分别对应 Vue2.x 中的 `$attr` 属性、`slot` 插槽和 `$emit` 发射事件。并且这几个属性都是自动同步最新的值，所以我们每次使用拿到的都是最新值。

**错误代码示例**， 这段代码会让 `props` 不再支持响应式：

```js
// demo.vue
export default defineComponent({
  setup(props, context) {
    // 不可通过 ES6 解构 props
    const { name } = props;
    console.log(name);
  },
});
```

类型声明：

```ts
interface Data {
  [key: string]: unknown;
}

interface SetupContext {
  attrs: Data;
  slots: Slots;
  emit: (event: string, ...args: unknown[]) => void;
  expose: (exposed?: Record<string, any>) => void;
}

function setup(props: Data, context: SetupContext): Data;
```

代码示例：

```html
<template>
  <div>{{ readersNumber }} {{ book.title }}</div>
</template>
<script>
  import { ref, reactive } from 'vue';

  export default {
    setup() {
      const readersNumber = ref(0);
      const book = reactive({ title: 'Vue3 Guide' });

      // 暴露给模版
      return {
        readersNumber,
        book,
      };
    },
  };
</script>
```

## 生命周期钩子

选项 API 生命周期选项和组合式 API 之间的映射

- `beforeCreate` -> use `setup()`
- `created` -> use `setup()`
- `beforeMount` -> `onBeforeMount`
- `mounted` -> `onMounted`
- `beforeUpdate` -> `onBeforeUpdate`
- `updated` -> `onUpdated`
- `beforeUnmount` -> `onBeforeUnmount`
- `unmounted` -> `onUnmounted`
- `errorCaptured` -> `onErrorCaptured`
- `renderTracked` -> `onRenderTracked`
- `renderTriggered` -> `onRenderTriggered`

相关官方文档：

- [生命周期钩子](https://vue3js.cn/docs/zh/guide/composition-api-lifecycle-hooks.html)

## provide / inject

## getCurrentInstance

> WARNING
> `getCurrentInstance` 值暴露给高阶使用场景，典型的比如在库中。强烈反对在应用的代码中使用 `getCurrentInstance`。请不要把它当作在组合式 API 中获取 `this` 的替代方案来使用。

`getCurrentInstance` 只能在 `setup` 或 生命周期钩子 中调用。
