---
nav:
  title: 基础
  order: 1
group:
  title: 组件化
  order: 2
title: 指令 Directive
order: 21
---

# 指令

## 内置指令

- [v-text](https://vue3js.cn/docs/zh/api/directives.html#v-text)：更新元素的 textContent
- [v-html](https://vue3js.cn/docs/zh/api/directives.html#v-html)：更新元素的 innerHTML
- [v-show](https://vue3js.cn/docs/zh/api/directives.html#v-show)：根据表达式的真假值，切换元素样式的 display 的属性
- [v-if](https://vue3js.cn/docs/zh/api/directives.html#v-if)：根据表达式的真假值来有条件地渲染元素
- [v-else](https://vue3js.cn/docs/zh/api/directives.html#v-else)：为 v-if 或者 v-else-if 添加 else 块
- [v-else-if](https://vue3js.cn/docs/zh/api/directives.html#v-else-if)：表示 v-if 的 else-if 块
- [v-for](https://vue3js.cn/docs/zh/api/directives.html#v-for)：基于源数据多次渲染元素或模板块
- [v-on](https://vue3js.cn/docs/zh/api/directives.html#v-on)：绑定事件监听器
- [v-bind](https://vue3js.cn/docs/zh/api/directives.html#v-bind)：动态地绑定一个或多个 attribute，或一个组件 prop 到表达式
- [v-model](https://vue3js.cn/docs/zh/api/directives.html#v-model)：在表单控件或者组件上创建双向绑定
- [v-slot](https://vue3js.cn/docs/zh/api/directives.html#v-slot)：提供具名插槽或需要接收 prop 的插槽
- [v-pre](https://vue3js.cn/docs/zh/api/directives.html#v-pre)：跳过这个元素和它的子元素的编译过程
- [v-cloak](https://vue3js.cn/docs/zh/api/directives.html#v-cloak)：保持在元素上直到关联组件实例结束编译
- [v-once](https://vue3js.cn/docs/zh/api/directives.html#v-once)：只渲染元素和组件一次
- [v-is](https://vue3js.cn/docs/zh/api/directives.html#v-is)：HTML 标签映射

### v-model

参考文档：

- [表单输入绑定](https://v3.cn.vuejs.org/guide/forms.html)
- [组件 - 在输入组件上使用自定义事件](https://v3.cn.vuejs.org/guide/component-custom-events.html#v-model-%E5%8F%82%E6%95%B0)
- [Vue3 迁移 - v-model](https://v3.cn.vuejs.org/guide/migration/v-model.html)

#### 2.x 语法

##### 表单元素使用 v-model

代码示例：

```xml
<input v-model="value" />

<!-- 等同于 -->
<input v-bind:value="value" v-on:input="value=$event.target.value" />
<!-- 或 -->
<input :value="value" @input="value=$event.target.value" />
```

##### 自定义组件使用 v-model

在自定义组件中，`v-model` 默认利用名为 `value` 的 `props` 和名为 `input` 的事件。

本质是一个父子组件通信的语法糖，通过 `props` 和 `$.emit` 实现。因此父组件 `v-model` 语法糖本质上可以修改为：

```xml
<child :value="value" @input="function(e){value=e}"></child>
```

#### 3.x 语法

```xml
<ChildComponent v-model="title" />

<!-- 相当于 -->

<ChildComponent
  :modelValue="title"
  @update:modelValue="title = $event"
>
```

若需要更改 `model` 的名称，现在可为 `v-model` 传递一个参数，以作为组件 `model` 选项的替代：

```html
<ChildComponent v-model:title="title" />

<!-- 相当于 -->
<ChildComponent :title="title" @update:title="title = $event" />
```

其他新特性：

- 允许在自定义组件上使用多个 `v-model`

## 自定义指令

**应用场景**：代码复用和抽象的主要形式是组件，但是在某些情况下，仍然需要对普通 DOM 元素进行底层操作，这时候就会用到自定义指令。

使用场景：

- 鼠标聚焦
- 下拉菜单
- 相对时间转换
- 滚动动画
- 自定义指令实现图片懒加载
- 自定义指令集成第三方插件

### 钩子函数

| 钩子函数        | 说明                                                                             | 原钩子函数         |
| :-------------- | :------------------------------------------------------------------------------- | :----------------- |
| `created`       | 在元素的 attribute 或事件监听器被应用之前调用                                    | 新增               |
| `beforeMount`   | 当指令第一次绑定到元素并且在挂载父组件之前调用。在这里你可以做一次性的初始化设置 | `bind`             |
| `mounted`       | 在挂载绑定元素的父组件时调用                                                     | `inserted`         |
| `beforeUpdate`  | 在更新包含组件的 VNode 之前调用                                                  | 新增               |
| `updated`       | 在包含组件的 VNode 及其子组件的 VNode 更新后调用                                 | `componentUpdated` |
| `beforeUnmount` | 在卸载绑定元素的父组件之前调用                                                   | 新增               |
| `unmounted`     | 当指令与元素解除绑定且父组件已卸载时，只调用一次                                 | `unbind`           |

> 🗑 原 `update` 钩子函数已移除！

传递参数：

- `el`：指令绑定到的元素
- `binding`：包含以下 property 的对象
  - `instance`：指令的组件实例
  - `value`：传递给指令的值
  - `oldValu`：先前的值（仅在 `beforeUpdate` 和 `updated` 中可用）
  - `arg`：参数传递给指令
  - `modifiers`：包含修饰符（如果有）的对象
  - `dir`：一个对象，在注册指令时作为参数传递

### 使用方式

使用方式在官方文档中已经说明得非常清晰了：

- 全局注册指令：[应用 API：directive](https://vue3js.cn/docs/zh/api/application-api.html#directive)
- 局部注册指令：[自定义指令：在组件中使用](https://vue3js.cn/docs/zh/guide/custom-directive.html#%E5%9C%A8%E7%BB%84%E4%BB%B6%E4%B8%AD%E4%BD%BF%E7%94%A8)

## 参考资料

- [Vue 自定义指令的魅力](https://juejin.im/post/59ffbcc151882554b836ee21)
