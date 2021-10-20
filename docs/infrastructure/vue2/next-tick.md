---
nav:
  title: 架构
  order: 2
group:
  title: Vue2 架构
  order: 5
title: nextTick
order: 3
---

# nextTick

> 阅读此章前假设已经理解 JavaScript 的 [事件循环机制](https://tsejx.github.io/JavaScript-Guidebook/core-modules/executable-code-and-execution-contexts/concurrency-model/event-loop.html)

**用法**：在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。

## 使用方式

### 2.x 全局 API

同步回调函数方式实现：

```js
// 修改数据
vm.msg = 'Hello world!';
// DOM 还没更新
Vue.nextTick(function () {
  // DOM 更新了
});
```

同步 Promise 方式实现:

```js
// 作为一个 Promise 使用 (2.1.0 起新增，详见接下来的提示)
Vue.nextTick().then(function () {
  // DOM 更新了
});
```

尽管 MVVM 框架并不推荐直接操作 DOM，但有时候确实有这样的需求，尤其是和第三方插件进行配合的时候，免不了要进行 DOM 操作。而 `nextTick` 就提供了一个桥梁，确保我们操作的更新后的 DOM。

### 2.x 实例方法

它跟全局方法 `Vue.nextTick` 一样，不同的是回调的 `this` 自动绑定到调用它的实例上。

```js
new Vue({
  // ...
  methods: {
    // ...
    example: function () {
      // 修改数据
      this.message = 'changed';
      // DOM 还没有更新
      this.$nextTick(function () {
        // DOM 现在更新了
        // `this` 绑定到当前实例
        this.doSomethingElse();
      });
    },
  },
});
```

### 3.x 响应式 API

```js
import { createApp, nextTick } from 'vue';

const app = createApp({
  setup() {
    const message = ref('Hello!');
    const changeMessage = async (newMessage) => {
      message.value = newMessage;
      await nextTick();
      console.log('Now DOM is updated');
    };
  },
});
```

### 3.x 实例方法

```js
createApp({
  // ...
  methods: {
    // ...
    example() {
      // 修改数据
      this.message = 'changed';
      // DOM 尚未更新
      this.$nextTick(function () {
        // DOM 现在更新了
        // `this` 被绑定到当前实例
        this.doSomethingElse();
      });
    },
  },
});
```

## 实现原理

从字面意思理解，`next` 下一个，`tick` 滴答（钟表）来源于定时器的周期性中断（输出脉冲），一次中断表示一个 `tick`，也被称作 **时钟滴答**，`nextTick` 顾名思义就是下一个时钟滴答。

### Promise 分支

```js
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve();
  timerFunc = () => {
    p.then(flushCallbacks);
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop);
  };
  isUsingMicroTask = true;
}
```

**源码分析：**

1. 判断环境是否支持 Promise 并且 Promise 是否为原生。
2. 使用 Promise 异步调用 `flushCallbacks` 函数。
3. 当执行环境是 iPhone 等，使用 setTimeout 异步调用 noop ，iOS 中在一些异常的 webview 中，promise 结束后任务队列并没有刷新所以强制执行 setTimeout 刷新任务队列。

### MutationObserver 分支

> Vue 如何检测到 DOM 更新完毕呢？

nextTick 通过访问 `Promise.then` 和 `MutationObserver` 可以访问的微任务队列。

MutationObserver 是 HTML5 新增的内置对象，用于监听 DOM 修改事件，能够监听到节点的属性、文本内容、子节点等的改动。

```js
else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
}
```

**源码分析：**

1. 对非 IE 浏览器和是否可以使用 HTML5 新特性 MutationObserver 进行判断。
2. 实例一个 MutationObserver 对象，这个对象主要是对浏览器 DOM 变化进行监听，当实例化 MutationObserver 对象并且执行对象 observe，设置 DOM 节点发生改变时自动触发回调。
3. 把 timerFunc 赋值为一个改变 DOM 节点的方法，当 DOM 节点发生改变，触发 flushCallbacks 。（这里其实就是想用利用 MutationObserver 的特性进行异步操作）

从[源码](https://github.com/vuejs/vue/blob/b7c2d9366cf731a1551286b8ac712e6e0905070e/src/core/util/next-tick.js#L54)可以看出，如果运行环境（浏览器）支持 MutationObserver，则创建一个文本节点，监听这个文本节点的改动事件，以此来触发 `nextTickHandler`（也就是 DOM 更新完毕的回调）的执行。后续会执行手工修改文本节点属性，这样就能进入到回调函数。

### setImmediate 分支

```js
else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
}
```

1. 判断 `setImmediate` 是否存在，`setImmediate` 是高版本 IE （IE10+） 和 Edge 才支持的。
2. 如果存在，传入 `flushCallbacks` 执行 `setImmediate` 。

### setTimeout 分支

```js
else {
  // Fallback to setTimeout.
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
```

1. 当以上所有分支异步 API 都不支持的时候，使用 MacroTask （宏任务）的 `setTimeout` 执行 `flushCallbacks` 。

## 执行降级策略

我们可以发现，给 `timeFunc` 赋值是一个降级的过程，这是因为 Vue 在执行的过程中，执行环境不同，所以要适配环境。

我们知道微任务队列和宏任务队列是交替执行的，在执行微任务的过程中后加入的队列的微任务，也会在下一次事件循环之前被执行。也就是说，宏任务总要等到微任务都执行完后才能执行，微任务有着更高的优先级。

队列控制的最佳选择是微任务，而微任务的最佳选择是 Promise。但是如果当前环境不支持 Promise，Vue 就不得不降级为宏任务来做队列控制了。

Vue2.5+ 降级方案（由上至下）：

1. Promise（需要 ES6 兼容）
2. MutationObserver（iOS9.3.3+ 版本存在问题/IE11 不可靠等兼容问题）
3. setImmdediate（只有 IE 和 Node.js 支持）
4. setTimeout（至少有 4ms 延迟，兜底方案）

在 Vue3.x 中已经 `nextTick` 放弃兼容，直接使用 `Promise.resolve().then()`。

### flushCallbacks 函数

```js
function flushCallbacks() {
  pending = false;

  const copies = callback.slice(0);

  callbacks.length = 9;

  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}
```

循环遍历，按照 **队列** 数据结构 **"先进先出"** 的原则，逐一执行所有 `callback` 。

## 总结

1. Vue 用异步更新队列的方式来控制 DOM 更新和 nexTick 回调先后执行
2. microtask（微任务）因为其高优先级特性，能确保队列中的微任务在一次事件循环前被执行完毕
3. 因为兼容性问题，Vue 不得不做 microtask（微任务）向 macrotask（宏任务）的降级方案

## 参考资料

- [全面解析 Vue.nextTick 实现原理](https://mp.weixin.qq.com/s/ZbF_4o8XrJb49_MU6y3iDQ)
- [Vue3 nextTick 原理分析](https://zhuanlan.zhihu.com/p/392234749)
- [Vue3 源码阅读：nextTick 与调度器](https://www.bebopser.com/2021/01/22/vue3source6/#event-loop)
