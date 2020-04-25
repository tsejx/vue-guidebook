---
nav:
  title: 原理
  order: 2
title: nextTick
order: 4
---

# nextTick

阅读此章前假设已经理解 JavaScript 的[事件循环机制](https://tsejx.github.io/JavaScript-Guidebook/core-modules/executable-code-and-execution-contexts/concurrency-model/event-loop.html)

> 在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。

```js
// 修改数据
vm.msg = 'Hello world!';
// DOM 还没更新
Vue.nextTick(function() {
  // DOM 更新了
});
```

尽管 MVVM 框架并不推荐直接操作 DOM，但有时候确实有这样的需求，尤其是和第三方插件进行配合的时候，免不了要进行 DOM 操作。而 nextTick 就提供了一个桥梁，确保我们操作的更新后的 DOM。

## MutationObserver

> Vue 如何检测到 DOM 更新完毕呢？

nextTick 通过访问 `Promise.then` 和 `MutationObserver` 可以访问的微任务队列。

MutationObserver 是 HTML5 新增的内置对象，用于监听 DOM 修改事件，能够监听到节点的属性、文本内容、子节点等的改动。

**基本用法如下：**

```js
const observer = new MutationObserver(function() {
  // 这里是回调函数
  console.log('Done had been modified!');
});

const article = document.querySelector('article');
observer.observer(article);
```

**Vue 源码部分：**

```js
let timerFunc;

if (typeof Promise !== 'undefined' && isNative(Promise)) {
  // ...
} else if (
  !isIE &&
  typeof MutationObserver !== 'undefined' &&
  (isNative(MutationObserver) ||
    MutationObserver.toString() === '[object MutationObserverConstructor]')
) {
  let counter = 1;
  const observer = new MutationObserver(flushCallbacks);
  const textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true,
  });
  timerFunc = () => {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
  isUsingMicroTask = true;
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // ...
} else {
  // ...
}
```

从[源码](https://github.com/vuejs/vue/blob/b7c2d9366cf731a1551286b8ac712e6e0905070e/src/core/util/next-tick.js#L54)可以看出，如果运行环境（浏览器）支持 MutationObserver，则创建一个文本节点，监听这个文本节点的改动事件，以此来触发 `nextTickHandler`（也就是 DOM 更新完毕的回调）的执行。后续会执行手工修改文本节点属性，这样就能进入到回调函数。

因此，Vue 是通过 MutationObserver 监听 DOM 更新完毕的。

## 事件循环

浏览器的事件循环机制会在每次 EventLoop 后，会有 UI Render 步骤，也就是更新 DOM。

```html
<template>
  <div>
    <div>{{number}}</div>
    <div @click="handleClick">Click</div>
  </div>
</template>
```

```js
export default {
  data() {
    return {
      number: 0,
    };
  },
  methods: {
    handleClick() {
      for (let i = 0; i < 1000; i++) {
        this.number++;
      }
    },
  },
};
```

当按下按钮时候，`number` 会被循环增加 1000 次。

如之前所述，每次 `number` 增加的时候，都会触发 `number` 的 `setter` 方法，从而根据上述流程直到最后修改真实 DOM。那么在这个过程中，DOM 会被更新 1000 次。

Vue 肯定不会以如此低效的方法来处理。事实上，这 1000 次循环同属一个 task，浏览器只在该 task 执行完后进行一次 DOM 更新。因此，只要让 nextTick 里的代码放在 UI Render 步骤后执行，就能访问到更新后的 DOM。

Vue 就是这样的思路，并不是用 MutationObserver 进行 DOM 变动监听，而是用队列控制的方式达到目的。那么 Vue 又是如何做到队列控制的呢？我们可以很自然地想到 setTimtout，把 nextTick 要执行的代码当作下一个 task 放入队列末尾。

## 降级策略

我们知道微任务队列和宏任务队列是交替执行的，在执行微任务的过程中后加入的队列的微任务，也会在下一次事件循环之前被执行。也就是说，宏任务总要等到微任务都执行完后才能执行，微任务有着更高的优先级。

队列控制的最佳选择是微任务，而微任务的最佳选择是 Promise。但是如果当前环境不支持 Promise，Vue 就不得不降级为宏任务来做队列控制了。

Vue2.5+ 降级方案：

- Promise（需要 ES6 兼容）
- MutationObserver（iOS9.3.3+ 版本存在问题/IE11 不可靠等兼容问题）
- setImmdediate（只有 IE 和 Node.js 支持）
- setTimeout（至少有 4ms 延迟，兜底方案）

## 总结

1. Vue 用异步更新队列的方式来控制 DOM 更新和 nexTick 回调先后执行
2. microtask（微任务）因为其高优先级特性，能确保队列中的微任务在一次事件循环前被执行完毕
3. 因为兼容性问题，Vue 不得不做 microtask（微任务）向 macrotask（宏任务）的降级方案

---

**参考资料：**

- [全面解析 Vue.nextTick 实现原理](https://mp.weixin.qq.com/s/ZbF_4o8XrJb49_MU6y3iDQ)
