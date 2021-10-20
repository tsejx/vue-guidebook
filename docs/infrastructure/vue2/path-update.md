---
nav:
  title: 架构
  order: 2
group:
  title: Vue2 架构
  order: 5
title: 批量更新策略
order: 2
---

# 批量更新策略

Vue 修改视图的过程就是 `setter -> Dep -> Watcher -> patch -> View`。

这节通过示例解释 Vue 的批量异步更新策略。

🌰 **示例：**

当按下 click 按钮时候，`number` 会被循环增加 1000 次。

如之前所述，每次 `number` 增加的时候，都会触发 `number` 的 `setter` 方法，从而根据上述流程直到最后修改真实 DOM。那么在这个过程中，DOM 会被更新 1000 次。

Vue 肯定不会以如此低效的方法来处理。Vue 在默认情况下，每次触发某个数据的 setter 方法后，对应的 Watcher 对象其实会被 push 进一个队列 queue 中，在下一个 tick 的时候将这个队列 queue 全部拿出来 run（Watcher 类的一个方法，用来触发 patch 操作）一遍。

那么什么是下一个 Tick 呢？

## nextTick

Vue 实现了一个 `nextTick` 函数，传入一个 `cb`，这个 `cb` 会被存储到一个队列中，在下一个 tick 时触发队列中的所有 `cb` 事件。

因为目前浏览器平台并没有实现 `nextTick` 方法，所以 Vue 使用 `Promise`、`setTimeout`、`setImmediate` 等方式在 microtask（或是 task）中创建一个事件，目的是在当前调用栈执行完毕以后（不一定立即）才会去执行这个事件。

下面使用 `setTimeout` 简单模拟该方法。

首先定义一个 `callbacks` 数组用于存储 `nextTick`，在下一个 tick 处理这些回调函数之前，所有的 `cb` 都会被存在这个 `callbacks` 数组中。`pending` 是一个标记位，代表一个等待的状态。

`setTimeout` 会在 task 中创建一个事件 `flushCallbacks`，`flushCallbacks` 则会在执行时将 `callbacks` 中的所有 `cb` 依次执行。

```js
let callbacks = [];
let pending = false;

function nextTick(cb) {
  callbacks.push(cb);

  if (!pending) {
    pending = true;
    setTimeout(flushCallbacks, 0);
  }
}

function flushCallbacks() {
  pending = false;
  const copies = callbacks.slice(0);
  callbacks.length = 0;
  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}
```

## 再写 Watcher

第一个例子中，当我们将 `number` 增加 1000 次时，先将对应的 `Watcher` 对象给 `push` 进一个队列 `queue` 中去，等下个 tick 的时候再去执行，这样做是对的。但是会出现另一个问题。

因此 `number` 执行后自增操作后对应的 `Watcher` 对象都是同一个，我们并不需要在下一个 tick 的时候执行 1000 个同样的 Warcher 对象去修改洁面，而是只需要执行一个 `Watcher` 对象，使其将界面上的 0 编程 1000 即可。

那么，我们就需要执行一个过滤的操作，同一个 Watcher 在同一个的 `Watcher` 在相同 tick 的时候应该只被执行一次，也就是说队列 `queue` 中不应该出现重复的 `Watcher` 对象。

Vue 源码为每个 `Watcher` 都提供了唯一的 `id` 用于标识。

实现 `update` 方法，在修改数据后由 `Dep` 来调用，而 `run` 方法才是真正的触发 `patch` 更新视图的方法。

```js
let uid = 0;

class Watcher {
  constructor() {
    this.id = ++uid;
  }
  update() {
    console.log('watch' + this.id + ' update');
    queueWatcher(this);
  }
  run() {
    console.log('watch' + this.id + ' ViewRendring');
  }
}
```

## queueWatcher

将 `Watcher` 对象自身传递给 `queueWatcher` 方法。

```js
let has = {};
let queue = [];
let waiting = false;

function queueWatcher(watcher) {
  const id = watcher.id;
  if (has[id] === null) {
    has[id] === true;
    queue.push(watcher);

    if (!waiting) {
      waiting = true;
      nextTick(flushSchedulerQueue);
    }
  }
}
```

这里使用一个叫做 `has` 的 map，里面存放 id -> true(false) 的形式，用力啊判断是否已经存在相同的 `Watcher` 对象（这样比每次都去遍历 `queue` 效率上会高很多）。

如果目前队列 `queue` 中还没有这个 `Watcher` 对象，则该对象会被 `push` 进队列 `queue` 中去。

`waiting` 是一个标记位，标记是否已经向 `nextTick` 传递了 `flushSchedulerQueue` 方法，在下一个 tick 执行时 `flushSchedulerQueue` 方法来 flush 队列 `queue`，执行它里面的所有 `Watcher` 对象的 `run` 方法。

## flushSchedulerQueue

```js
function flushSchedulerQueue() {
  let watcher, id;

  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];
    id = watcher.id;
    has[id] = null;
    watcher.run();
  }

  waiting = false;
}
```

模拟更新相同的依赖。

```js
let watch1 = new Watcher();
let watch2 = new Watcher();

watcher1.update();
watcher1.update();
watcher2.update();
```

这里先 new 两个 `Watcher` 对象，因为修改了 `data` 的数据，所以我们模拟触发了两次 `watch1` 的 `update` 以及一次 `watch2` 的 `update`。
