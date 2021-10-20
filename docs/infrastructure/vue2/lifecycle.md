---
nav:
  title: 架构
  order: 2
group:
  title: Vue2 架构
  order: 5
title: 生命周期
order: 4
---

# 生命周期

生命周期并非指 Vue 中的生命周期钩子，而是指 Vue 内部从初始化到挂载 DOM 的完整流程。

```jsx | inline
import React from 'react';
import img from '../../assets/vue-lifecycle.jpg';

export default () => <img alt="Vue Lifecycle" src={img} width={640} />;
```

## 初始化

```jsx | inline
import React from 'react';
import img from '../../assets/vue-lifecycle.jpg';

export default () => <img alt="Initialize" src={img} width={640} />;
```

在 `new Vue()` 之后。Vue 会调用挂载在其原型上的 `_init` 函数进行初始化，也就是这里的 init 过程，它会初始化生命周期、事件、props、methods、data、computed 与 watch 等。其中最重要的是通过 `Object.defineProperty` 设置 `setter` 与 `getter` 函数，用来实现<span style="color:red;font-weight:bold">响应式</span>以及<span style="color:red;font-weight:bold">依赖收集</span>。

初始化后会调用 `$mount` 进行挂载组件，如果是运行时编译（Runtime with Compiler），即不存在 render function 但是存在 template 的情况，则需要进行<span style="color:red;font-weight:bold">编译</span>步骤。

## 编译

编译（Compiler）可以分成 Parse、Optimize 与 Generate 三个阶段，最终需要得到 render function。

```jsx | inline
import React from 'react';
import img from '../../assets/lifecycle-compile.jpg';

export default () => <img alt="Compile" src={img} width={640} />;
```

### Parse

Parse 会用正则等方式解析 template 模版中的指令、class、style 等数据，形成 AST。

### Optimize

Optimize 的主要作用是标记 static 静态节点，这时 Vue 在编译过程中的优化，后面当 update 更新界面时，会有一个 patch 的过程，diff 算法会直接跳过静态节点，从而减少了比较的过程，优化了 patch 的性能。

### Generate

Generate 是将 AST 转化成 render function 字符串的过程，得到结果是 render 的字符串以及 staticRenderFns 字符串。

在经历过 Parse、Optimize 与 Generate 这三个阶段之后，组件中就会存在渲染 VNode 所需的 render function 了。

## 响应式

```jsx | inline
import React from 'react';
import img from '../../assets/lifecycle-reactive.jpg';

export default () => <img alt="Reactive" src={img} width={640} />;
```

在 init 过程中通过 Object.defineProperty 对响应式数据的 getter 和 setter 进行绑定，它使得当被设置的对象被读取的时候会执行 getter 函数，而在当被赋值的时候会执行 setter 函数。

当 render function 被渲染的时候，因为会读取所需对象的值，所以会触发 getter 函数进行<span style="color:red;font-weight:bold">依赖收集</span>，依赖收集的目的是将观察者 Watcher 对象存放到当前闭包中的订阅者 Dep 的 subs 中。

```jsx | inline
import React from 'react';
import img from '../../assets/lifecycle-dep.jpg';

export default () => <img alt="Lifecycle Dep" src={img} width={640} />;
```

在修改对象的值时候，会触发 setter，setter 通知之前依赖收集得到的 Dep 中的每个 Watcher，告诉它们自己的值改变了，需要重新渲染视图。这时候这些 Watcher 就会开始调用 update 来更新视图，当然这中间还有一个 patch 过程以及使用队列来异步更新的策略。

## Virtual DOM

render function 会被转化成 VNode 节点。Virtual DOM 其实就是一棵以 JavaScript 对象（VNode 节点）作为基础的树，用对象属性来描述节点，实际上它只是一层对真实 DOM 的抽象。最终可以通过一系列操作使这棵树映射到真实环境上。由于 Virtual DOM 是以 JavaScript 对象为基础而不依赖真实平台环境，所以使它具有了跨平台的能力，比如说浏览器平台、Weex、Node 等。

```js
{
  tag: 'div', /* 说明是 div 标签 */
  children: [ /* 存放该标签的子节点 */
    {
      tag: 'a', /* 说明是 a 标签 */
      text: 'click me', /* 标签内容 */
    }
  ]
}
```

渲染后可以得到：

```html
<div>
  <a>Click me</a>
</div>
```

实际上节点有更多的属性来标识节点，例如 isStatic（表示是否为静态节点）、isComment（表示是否为注释节点）等。

## 更新视图

在修改对象值时，会通过 `setter => Watcher => update` 的流程来修改对应的视图，那么最终是如何更新视图呢？

当数据变化后，执行 render function 就可以得到一个新的 VNode 节点，我们如果想要得到新的视图，最简单粗暴的方法就是直接解析这个新的 VNode，然后用 `innerHTML` 直接全部渲染到真实 DOM 中。但是其实我们只对其中的一小块内容进行了修改，这样做似乎会消耗大量成本。

那么我们为什么不能只修改那些「改变了的地方」呢？

通过新的 VNode 与旧的 VNode 传入 patch 进行比较，经过 diff 算法得出它们的<span style="color:red;font-weight:bold">差异</span>。最后我们只需要将这些**差异**的对应 DOM 进行修改即可。

## 总结

Vue 生命周期总结：

1. 首先，在实例化的过程中，把普通的 JavaScript 对象传给 Vue 实例的 data 选项，Vue 将遍历此对象所有的属性，并使用 Object.defaineProperty 把这些属性全部转为 getter 和 setter。
2. Dep 是依赖收集器。data 下的每个属性都有一个唯一的 Dep 对象，在 get 中收集仅针对该属性的依赖，然后在 set 方法中触发所有收集的依赖。
3. 在 Watcher 中对表达式求值，从而触发数据的 get。在求值之前将当前 Watch 实例设置到全局，使用 `pushTarget(this)` 方法。
4. 在 get 中收集依赖，`this.subs.push(sub)` 和 set 的时候触发回调 Dep.notify。
5. Compile 中首先将 template 或 el 编译成 render 函数，render 函数返回一个虚拟 DOM 对象（将模版转为 render 函数的时候，实际是先生成的抽象语法树 AST，再将抽象语法树转成的 render 函数）
6. 当 `vm._render` 执行的时候，所依赖的变量就会被求值，并被收集为依赖。按照 Vue 中 `watch.js` 的逻辑，当依赖的变量有变化时不仅仅回调函数被执行，实际上还要重新求值，即还要执行一遍。
7. 如果还没有 preVnode 说明是首次渲染，直接创建真实 DOM。如果已经有了 prevVnode 说明不是首次渲染，那么就采用 patch 算法进行必要的 DOM 操作。这就是 Vue 更新 DOM 的逻辑。

## 参考资料

- [📝 Vue 的响应式原理](https://github.com/answershuto/learnVue/blob/master/docs/%E5%93%8D%E5%BA%94%E5%BC%8F%E5%8E%9F%E7%90%86.MarkDown)
