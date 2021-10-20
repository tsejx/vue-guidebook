---
nav:
  title: 架构
  order: 2
group:
  title: Vue3 架构
  order: 1
title: 响应性原理
order: 2
---

# 响应性原理

阅读本文档前建议阅读官方关于响应式原理的文档 [深入响应性原理](https://v3.cn.vuejs.org/guide/reactivity.html)、[响应性原理](https://v3.cn.vuejs.org/guide/reactivity-fundamentals.html) 和 [响应式计算和侦听](https://v3.cn.vuejs.org/guide/reactivity-computed-watchers.html)。

## 响应性核心代码结构

```bash
.
├── LICENSE
├── README.md
├── __tests__                         # 单元测试目录
│   ├── collections
│   │   ├── Map.spec.ts
│   │   ├── Set.spec.ts
│   │   ├── WeakMap.spec.ts
│   │   └── WeakSet.spec.ts
│   ├── computed.spec.ts
│   ├── effect.spec.ts
│   ├── reactive.spec.ts
│   ├── reactiveArray.spec.ts
│   ├── readonly.spec.ts
│   └── ref.spec.ts
├── api-extractor.json
├── index.js
├── package.json
└── src
    ├── baseHandlers.ts                 # 基本类型的处理器
    ├── collectionHandlers.ts           # Set Map WeakSet WeckMap的处理器
    ├── computed.ts                     # 计算属性，同Vue2
    ├── effect.ts                       # reactive 核心，处理依赖收集，依赖更新
    ├── index.ts
    ├── operations.ts                   # 定义依赖收集，依赖更新的类型
    ├── reactive.ts                     # reactive 入口，内部主要以Proxy实现
    └── ref.ts                          # reactive 的变种方法，Proxy处理不了值类型的响应，Ref来处理
```

<br />

```jsx | inline
import React from 'react';
import img from '../../assets/vue3/vue3-reactivity-workflow.png';

export default () => <img alt="Reactivity工作流程" src={img} width={960} />;
```

## 响应性实现原理

所谓响应式，就是当我们修改数据后，可以自动做某些事情；对应到组件的渲染，就是修改数据后，能自动触发组件的重新渲染。

Vue 3 实现响应式，本质上是通过 Proxy API 劫持了数据对象的读写：

- 当我们访问数据时，会触发 `getter` 执行依赖收集；
- 修改数据时，会触发 `setter` 派发通知。

接下来，我们简单分析一下依赖收集和派发通知的实现（Vue.js 3.2 之前的版本）。

### 依赖收集

首先来看依赖收集的过程，核心就是在访问响应式数据的时候，触发 `getter` 函数，进而执行 `track` 函数收集依赖：

```js
// 是否应该跟踪
let shouldTrack = true;
// 当前激活的 effect
let activeEffect;
// 原始数据对象 map
const targetMap = new WeakMap();

function track(target, type, key) {
  if (!shouldTrack || activeEffect === undefined) {
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    // 每个 target 对应一个 depsMap
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    // 每个 key 对应一个 dep 集合
    depsMap.set(key, (dep = new Set()));
  }
  if (!dep.has(activeEffect)) {
    // 收集当前激活的 effect 作为依赖
    dep.add(activeEffect);
    // 当前激活的 effect 收集 dep 集合作为依赖
    activeEffect.deps.push(dep);
  }
}
```

分析这个函数的实现前，我们先想一下要收集的依赖是什么，我们的目的是实现响应式，就是当数据变化的时候可以自动做一些事情，比如执行某些函数，所以我们收集的依赖就是数据变化后执行的**副作用函数**。

`track` 函数拥有三个参数：

- 其中 `target` 表示原始数据；
- `type` 表示这次依赖收集的类型；
- `key` 表示访问的属性。

`track` 函数外部创建了全局的 `targetMap` 作为原始数据对象的 `Map`，它的键是 `target`，值是 `depsMap`，作为依赖的 `Map`；这个 `depsMap` 的键是 `target` 的 `key`，值是 `dep` 集合，`dep` 集合中存储的是依赖的副作用函数。为了方便理解，可以通过下图表示它们之间的关系：

```jsx | inline
import React from 'react';
import img from '../../assets/vue3/reactive-target-map.png';

export default () => <img alt="Virtual DOM" src={img} width={520} />;
```

因此每次执行 `track` 函数，就是把当前激活的副作用函数 `activeEffect` 作为依赖，然后收集到 `target` 相关的 `depsMap` 对应 `key` 下的依赖集合 `dep` 中。

### 派发通知

派发通知发生在数据更新的阶段，核心就是在修改响应式数据时，触发 `setter` 函数，进而执行 `trigger` 函数派发通知:

```js
// 键只能是对象
const targetMap = new WeakMap();

function trigger(target, type, key) {
  // 通过 targetMap 拿到 target 对应的依赖集合
  const depsMap = targetMap.get(target);

  if (!depsMap) {
    // 没有依赖，直接返回
    return;
  }

  // 创建运行的 effects 集合
  const effects = new Set();

  // 添加 effects 的函数
  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach((effect) => {
        effects.add(effect);
      });
    }
  };

  // SET | ADD | DELETE 操作之一，添加对应的 effects
  if (key !== void 0) {
    add(depsMap.get(key));
  }

  const run = (effect) => {
    // 调度执行
    if (effect.options.scheduler) {
      effect.options.scheduler(effect);
    } else {
      // 直接运行
      effect();
    }
  };

  // 遍历执行 effects
  effects.forEach(run);
}
```

`trigger` 函数拥有三个参数，其中 `target` 表示目标原始对象；`type` 表示更新的类型；`key` 表示要修改的属性。

`trigger` 函数 主要做了四件事情：

1. 从 `targetMap` 中拿到 `target` 对应的依赖集合 `depsMap`；
2. 创建运行的 `effects` 集合；
3. 根据 `key` 从 `depsMap` 中找到对应的 `effect` 添加到 `effects` 集合；
4. 遍历 `effects` 执行相关的副作用函数。

因此每次执行 `trigger` 函数，就是根据 `target` 和 `key`，从 `targetMap` 中找到相关的所有副作用函数遍历执行一遍。
在描述依赖收集和派发通知的过程中，我们都提到了一个词：副作用函数，依赖收集过程中我们把 `activeEffect`（当前激活副作用函数）作为依赖收集，它又是什么？接下来我们来看一下副作用函数的庐山真面目。

### 副作用函数

那么，什么是副作用函数，在介绍它之前，我们先回顾一下响应式的原始需求，即我们修改了数据就能自动做某些事情，举个简单的例子：

```js
import { reactive } from 'vue';
const counter = reactive({
  num: 0,
});
function logCount() {
  console.log(counter.num);
}
function count() {
  counter.num++;
}
logCount();
count();
```

我们定义了响应式对象 counter，然后在 logCount 中访问了 counter.num，我们希望在执行 count 函数修改 counter.num 值的时候，能自动执行 logCount 函数。
按我们之前对依赖收集过程的分析，如果 logCount 是 activeEffect 的话，那么就可以实现需求，但显然是做不到的，因为代码在执行到 console.log(counter.num) 这一行的时候，它对自己在 logCount 函数中的运行是一无所知的。
那么该怎么办呢？其实只要我们运行 logCount 函数前，把 logCount 赋值给 activeEffect 就好了：

```js
activeEffect = logCount;
logCount();
```

顺着这个思路，我们可以利用高阶函数的思想，对 logCount 做一层封装：

```js
function wrapper(fn) {
  const wrapped = function (...args) {
    activeEffect = fn;
    fn(...args);
  };
  return wrapped;
}
const wrappedLog = wrapper(logCount);
wrappedLog();
```

wrapper 本身也是一个函数，它接受 fn 作为参数，返回一个新的函数 wrapped，然后维护一个全局变量 activeEffect，当 wrapped 执行的时候，把 activeEffect 设置为 fn，然后执行 fn 即可。
这样当我们执行 wrappedLog 后，再去修改 counter.num，就会自动执行 logCount 函数了。

实际上 Vue 3 就是采用类似的做法，在它内部就有一个 effect 副作用函数，我们来看一下它的实现：

```js
// 全局 effect 栈
const effectStack = [];
// 当前激活的 effect
let activeEffect;

function effect(fn, options = EMPTY_OBJ) {
  if (isEffect(fn)) {
    // 如果 fn 已经是一个 effect 函数了，则指向
    fn = fn.raw;
  }
  // 创建一个 wrapper，它是一个响应式的副作用的函数
  const effect = createReactiveEffect(fn, options);
  if (!options.lazy) {
    // lazy 配置，计算属性会用到，非 lazy 则直接执行一次
    effect();
  }

  return effect;
}

function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect() {
    if (!effect.active) {
      // 非激活状态，则判断如果非调度执行，则直接执行原始函数
      return options.scheduler ? undefined : fn();
    }

    if (!effectStack.includes(effect)) {
      // 清空 effect 引用的依赖
      cleanup(effect);

      try {
        // 开启全局 shouldTrack，允许依赖收集
        enableTracking();
        // 压栈
        effectStack.push(effect);
        activeEffect = effect;
        // 执行原始函数
        return fn();
      } finally {
        // 出栈
        effectStack.pop();
        // 恢复 shouldTrack 开启之前的状态
        resetTracking();
        // 指向栈最后一个 effect
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  };

  effect.id = uid++;
  // 标识是一个 effect 函数
  effect._isEffect = true;
  // effect 自身的状态
  effect.active = true;
  // 包装的原始函数
  effect.raw = fn;
  // effect 对应的依赖，双向指针，依赖包含对 effect 的引用，effect 也包含对依赖的引用
  effect.deps = [];
  // effect 的相关配置
  effect.options = options;

  return effect;
}
```

结合上述代码来看，effect 内部通过执行 createReactiveEffect 函数去创建一个新的 effect 函数，为了和外部的 effect 函数区分，我们把它称作 reactiveEffect 函数，并且还给它添加了一些额外属性（我在注释中都有标明）。另外，effect 函数还支持传入一个配置参数以支持更多的 feature，这里就不展开了。
reactiveEffect 函数就是响应式的副作用函数，当执行 trigger 过程派发通知的时候，执行的 effect 就是它。
按我们之前的分析，reactiveEffect 函数只需要做两件事情：让全局的 activeEffect 指向它， 然后执行被包装的原始函数 fn。
但实际上它的实现要更复杂一些，首先它会判断 effect 的状态是否是 active，这其实是一种控制手段，允许在非 active 状态且非调度执行情况，则直接执行原始函数 fn 并返回。
接着判断 effectStack 中是否包含 effect，如果没有就把 effect 压入栈内。之前我们提到，只要设置 activeEffect = effect 即可，那么这里为什么要设计一个栈的结构呢？
其实是考虑到以下这样一个嵌套 effect 的场景：

```js
import { reactive } from 'vue';
import { effect } from '@vue/reactivity';
const counter = reactive({
  num: 0,
  num2: 0,
});
function logCount() {
  effect(logCount2);
  console.log('num:', counter.num);
}
function count() {
  counter.num++;
}
function logCount2() {
  console.log('num2:', counter.num2);
}
effect(logCount);
count();
```

我们每次执行 effect 函数时，如果仅仅把 reactiveEffect 函数赋值给 activeEffect，那么针对这种嵌套场景，执行完 effect(logCount2) 后，activeEffect 还是 effect(logCount2) 返回的 reactiveEffect 函数，这样后续访问 counter.num 的时候，依赖收集对应的 activeEffect 就不对了，此时我们外部执行 count 函数修改 counter.num 后执行的便不是 logCount 函数，而是 logCount2 函数，最终输出的结果如下：

```
num2: 0
num: 0
num2: 0
```

而我们期望的结果应该如下：

```js
num2: 0;
num: 0;
num2: 0;
num: 1;
```

因此针对嵌套 effect 的场景，我们不能简单地赋值 activeEffect，应该考虑到函数的执行本身就是一种入栈出栈操作，因此我们也可以设计一个 effectStack，这样每次进入 reactiveEffect 函数就先把它入栈，然后 activeEffect 指向这个 reactiveEffect 函数，接着在 fn 执行完毕后出栈，再把 activeEffect 指向 effectStack 最后一个元素，也就是外层 effect 函数对应的 reactiveEffect。
这里我们还注意到一个细节，在入栈前会执行 cleanup 函数清空 reactiveEffect 函数对应的依赖 。在执行 track 函数的时候，除了收集当前激活的 effect 作为依赖，还通过 activeEffect.deps.push(dep) 把 dep 作为 activeEffect 的依赖，这样在 cleanup 的时候我们就可以找到 effect 对应的 dep 了，然后把 effect 从这些 dep 中删除。cleanup 函数的代码如下所示：

```js
function cleanup(effect) {
  const { deps } = effect;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect);
    }
    deps.length = 0;
  }
}
```

为什么需要 cleanup 呢？如果遇到这种场景：

```vue
<template>
  <div v-if="state.showMsg">
    {{ state.msg }}
  </div>
  <div v-else>
    {{ Math.random() }}
  </div>
  <button @click="toggle">Toggle Msg</button>
  <button @click="switchView">Switch View</button>
</template>
<script>
import { reactive } from 'vue';

export default {
  setup() {
    const state = reactive({
      msg: 'Hello World',
      showMsg: true,
    });

    function toggle() {
      state.msg = state.msg === 'Hello World' ? 'Hello Vue' : 'Hello World';
    }

    function switchView() {
      state.showMsg = !state.showMsg;
    }

    return {
      toggle,
      switchView,
      state,
    };
  },
};
</script>
```

结合代码可以知道，这个组件的视图会根据 showMsg 变量的控制显示 msg 或者一个随机数，当我们点击 Switch View 的按钮时，就会修改这个变量值。
假设没有 cleanup，在第一次渲染模板的时候，activeEffect 是组件的副作用渲染函数，因为模板 render 的时候访问了 state.msg，所以会执行依赖收集，把副作用渲染函数作为 state.msg 的依赖，我们把它称作 render effect。然后我们点击 Switch View 按钮，视图切换为显示随机数，此时我们再点击 Toggle Msg 按钮，由于修改了 state.msg 就会派发通知，找到了 render effect 并执行，就又触发了组件的重新渲染。
但这个行为实际上并不符合预期，因为当我们点击 Switch View 按钮，视图切换为显示随机数的时候，也会触发组件的重新渲染，但这个时候视图并没有渲染 state.msg，所以对它的改动并不应该影响组件的重新渲染。
因此在组件的 render effect 执行之前，如果通过 cleanup 清理依赖，我们就可以删除之前 state.msg 收集的 render effect 依赖。这样当我们修改 state.msg 时，由于已经没有依赖了就不会触发组件的重新渲染，符合预期。

## 响应性实现优化

响应性实现的优化：

1. 依赖收集的优化
2. 响应性 API 的优化
3. trackOpBit 的设计

## 参考资料

- [细说 Vue.js 3.2 关于响应式部分的优化](https://juejin.cn/post/6995732683435278344)

---

[`/package/reactivity`](https://github.com/vuejs/vue-next/blob/master/packages/reactivity/README.md)

1. 通过 `reactive` 来定义响应式数据
2. 通过 `effect` 声明依赖响应式数据的函数 `cb`（例如视图渲染函数 render 函数），并执行 `cb` 函数，执行过程中，会触发响应式数据 `getter`
3. 在响应式数据 `getter` 中进行 `track` 依赖收集：存储响应式数据与更新函数 `cb` 的映射关系，存储于 `targetMap`
4. 当变更响应式数据时，触发 `trigger`，根据 `targetMap` 找到关联的 `cb` 并执行

---

1. 当一个值被读取时进行追踪：`proxy` 的 `get` 处理函数中 `track` 函数记录了该 `property` 和当前副作用
2. 当某个值改变时进行检测：在 `proxy` 上调用 `set` 处理函数
3. 重新运行代码来读取原始值：`trigger` 函数查找哪些副作用依赖于该 `property` 并执行它们

该被代理的对象对于用户来说是不可见的，但是在内部，它们使 Vue 能够在 property 的值被访问或修改的情况下进行依赖跟踪和变更通知。
