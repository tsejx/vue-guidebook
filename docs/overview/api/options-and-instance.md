---
nav:
  title: 基础
  order: 1
group:
  title: API
  order: 10
title: 选型与实例
order: 3
---

# 选项与实例

## 选项

| 组件实例选项      | 类型                                                             | 说明                                     |
| :---------------- | :--------------------------------------------------------------- | :--------------------------------------- |
| `data`            | `Function`                                                       | 数据对象                                 |
| `props`           | `Array<string> \| Object`                                        | 用于接收父组件传入的数组或对象           |
| `computed`        | `{ [key: string]: Function \| { get: Function, set: Function} }` | 计算属性                                 |
| `methods`         | `{ [key: string]: Function }`                                    | 函数方法                                 |
| `watch`           | `{ [key: string]: string \| Function \| Object \| Array }`       | 侦听器                                   |
| `emits`           | `Array<string> \| Object`                                        | 自定义事件                               |
| `expose`          | `Array<string>`                                                  | 暴露在公共组件实例上的 property 列表     |
| `directives`      | `Object`                                                         | 声明可用于组件实例中的指令               |
| `components`      | `Object`                                                         | 声明可用于组件实例中的组件               |
| `mixins`          | `Array<Object>`                                                  | 可用于将混合选项合并到当前组件实例       |
| `extends`         | `Object`                                                         | 用于扩展组件，且继承改组件选项           |
| `provide`         | `Object \| () => Object`                                         | 用于向当前组件的子孙组件注入依赖         |
| `inject`          | `Array<string> \| { [key: string]: string \| Symbol \| Object }` | 用于获取祖先组件注入的依赖               |
| `setup`           | `Function`                                                       | 组件内部使用组合式 API 的入口            |
| `template`        | `string`                                                         | 字符串模版，用于替换所挂载的 `innerHTML` |
| `render`          | `Function`                                                       | 自定义渲染函数                           |
| `name`            | `string`                                                         | 组件名称                                 |
| `inheritAttrs`    | `boolean`                                                        |                                          |
| `compilerOptions` | `Object`                                                         | 组件级别编译配置                         |
| `delimiters`      |                                                                  | 已弃用                                   |

## 生命周期钩子

| 组件生命周期钩子  | 说明                                                                                                                                                                                                          |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `beforeCreate`    | 在实例初始化之后、进行数据侦听和事件/侦听器的配置之前同步调用                                                                                                                                                 |
| `created`         | 在实例创建完成后被立即同步调用。<br/>在这一步中，实例已完成对选项的处理，意味着以下内容已被配置完毕：数据侦听、计算属性、方法、事件/侦听器的回调函数。然而，挂载阶段还没开始，且 `$el`、property 目前尚不可用 |
| `beforeMount`     | 在挂载开始之前被调用：相关的 `render` 函数首次被调用                                                                                                                                                          |
| `mounted`         | 在实例挂载完成后被调用                                                                                                                                                                                        |
| `beforeUpdate`    | 在数据发生改变后，DOM 被更新之前被调用。这里适合在现有 DOM 将要被更新之前访问它，比如移除手动添加的事件监听器                                                                                                 |
| `updated`         | 在数据更改导致的虚拟 DOM 重新渲染和更新完毕之后被调用                                                                                                                                                         |
| `activated`       | 被 `keep-alive` 缓存的组件激活时调用                                                                                                                                                                          |
| `deactivated`     | 被 `keep-alive` 缓存的组件失活时调用                                                                                                                                                                          |
| `beforeUnmout`    | 在卸载组件实例之前调用。在这个阶段，实例仍然是完全正常的                                                                                                                                                      |
| `unmounted`       | 卸载组件实例后调用。调用此钩子时，组件实例的所有指令都被解除绑定，所有事件侦听器都被移除，所有子组件实例被卸载                                                                                                |
| `errorCaptured`   | 在捕获一个来自后代组件的错误时被调用                                                                                                                                                                          |
| `renderTracked`   | 跟踪虚拟 DOM 重新渲染时调用。钩子接收 `debugger event` 作为参数。此事件告诉你哪个操作跟踪了组件以及该操作的目标对象和键                                                                                       |
| `renderTriggered` | 当虚拟 DOM 重新渲染被触发时调用。和 `renderTracked` 类似，接收 `debugger event` 作为参数。此事件告诉你是什么操作触发了重新渲染，以及该操作的目标对象和键                                                      |

## 实例属性

| 实例属性   | 类型                                                               | 说明                                                                     |
| :--------- | :----------------------------------------------------------------- | :----------------------------------------------------------------------- |
| `$data`    | `Object`                                                           | 组件实例正在侦听的数据对象                                               |
| `$props`   | `Object`                                                           | 当前组件接收到的来自父组件的传递的参数对象                               |
| `$el`      | `any`                                                              | 组件实例正在使用的根 DOM 元素                                            |
| `$options` | `Object`                                                           | 用于当前组件实例的初始化选项，当你需要在选项中包含自定义 property 时有用 |
| `$parent`  | `Vue instance`                                                     | 父组件实例                                                               |
| `$root`    | `Vue instance`                                                     | 根组件实例                                                               |
| `$slots`   | `{ [name: string]: (...args: any[]) => Array<VNode> \| undefined}` | 以编程方式访问通过插槽分发的内容                                         |
| `$refs`    | `Object`                                                           | 当前组件注册过 `ref` attribute 的所有 DOM 元素和组件实例                 |
| `$atts`    | `Object`                                                           | 包含父作用域中不作为组件 `props` 或自定义事件的 `attribute` 绑定和事件   |

参考文档：

- `$data`
  - [选项 / 数据 - data](https://v3.cn.vuejs.org/api/options-data.html#data-2)
- `$slots`
  - [`<slot>` 组件](https://v3.cn.vuejs.org/api/built-in-components.html#slot)
  - [通过插槽分发内容](https://v3.cn.vuejs.org/guide/component-basics.html#%E9%80%9A%E8%BF%87%E6%8F%92%E6%A7%BD%E5%88%86%E5%8F%91%E5%86%85%E5%AE%B9)
  - [渲染函数 - 插槽](https://v3.cn.vuejs.org/guide/render-function.html#%E6%8F%92%E6%A7%BD)
- `refs`
  - [模版 refs](https://v3.cn.vuejs.org/guide/component-template-refs.html)
  - [特殊 attributes - ref](https://v3.cn.vuejs.org/api/special-attributes.html#ref)
- `attrs`
  - [非 Prop Attributes](https://v3.cn.vuejs.org/guide/component-attrs.html)
  - [选项/杂项 - inheritAttrs](https://v3.cn.vuejs.org/api/options-misc.html#inheritattrs)

## 实例方法

| 实例方法       | 说明                                                                                 |
| :------------- | :----------------------------------------------------------------------------------- |
| `$watch`       | 侦听组件实例上的响应式 property 或函数计算结果的变化                                 |
| `$emit`        | 触发当前实例上的事件，附加参数都会传给监听器回调                                     |
| `$forceUpdate` | 迫使组件实例重新渲染。注意它仅仅影响实例本身和插入插槽内容的子组件，而不是所有子组件 |
| `$nextTick`    | 将回调延迟到下次 DOM 更新循环之后执行                                                |

参考文档：

- `$watch`
  - [Watchers](https://v3.cn.vuejs.org/guide/computed.html#%E4%BE%A6%E5%90%AC%E5%99%A8)
  - [副作用刷新时机](https://v3.cn.vuejs.org/guide/reactivity-computed-watchers.html#%E5%89%AF%E4%BD%9C%E7%94%A8%E5%88%B7%E6%96%B0%E6%97%B6%E6%9C%BA)
- `$emit`
  - [`emits` 选项](https://v3.cn.vuejs.org/api/options-data.html#emits)
  - [事件抛出一个值](https://v3.cn.vuejs.org/guide/component-basics.html#%E4%BD%BF%E7%94%A8%E4%BA%8B%E4%BB%B6%E6%8A%9B%E5%87%BA%E4%B8%80%E4%B8%AA%E5%80%BC)
- `$nextTick`
  - [nextTick](https://v3.cn.vuejs.org/api/global-api.html#nexttick)
