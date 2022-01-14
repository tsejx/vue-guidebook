---
nav:
  title: 基础
  order: 1
group:
  title: 基础概念
  order: 1
title: 侦听器 Watch
order: 6
---

# 侦听器 Watch

相关的官方文档：

- [计算属性和侦听器：侦听器](https://vue3js.cn/docs/zh/guide/computed.html#%E4%BE%A6%E5%90%AC%E5%99%A8)
- [响应式计算和侦听：watchEffect 和 watch](https://vue3js.cn/docs/zh/guide/reactivity-computed-watchers.html#%E8%AE%A1%E7%AE%97%E5%80%BC)

应用场景：

1. 自定义的监听器，用于更方便地监听想监听的响应式数据
2. 当需要在数据变化时执行异步或开销较大的操作时，这个方式是最有用的

## Options API 实现 Watch

Options API 中的 `watch` 监听的数据必须是 `data` 中声明的或者父组件传递过来的 `props` 中的数据，当发生变化时，会触发其他操作。

### 普通的 watch

```js
export default {
  data() {
    return {
      sourceData: [],
      total: 0,
    };
  },
  props: ['dataList'],
  watch: {
    dataList: function (newVal, oldVal) {
      this.total = newVal.length;
      this.sourceData = newVal;
    },
  },
};
```

在 `list` 传值成功的前提下，有时候会出现直接在 `watch` 里面通过 `this.list` 是无法拿到的，总是显示 `undefined`。然后需要通过 `newVal` 和 `oldVal` 这么处理，才能拿到 `list` 的值。

### 对象的 watch

1. 对象和数组都是引用类型，引用类型变量存的是地址，地址没有变，所以不会触发 `watch`。这时我们需要进行深度监听，啾需要加上属性 `deep: true`
2. `watch` 有一个特点，当值第一次绑定的时候，不会执行监听函数，只有值发生变化时才会执行，如果想要最初绑定值的时候页执行函数，需要加 `immediate` 属性

```js
export default {
  data() {
    return {
      info: {
        foo: 52,
        bar: '1',
      },
    };
  },
  watch: {
    info: {
      handler(newValue, oldValue) {
        console.log(newValue);
      },
      deep: true,
    },
  },
};
```

⚠️ 注意：上述侦听器会层层往下遍历，给对象的所有属性都加上这个监听器，但是这样性能开销就非常大，修改对象中的任意一个属性都会触发侦听器中的 `handler`。如果只需要对对象的某个属性发生变化进行侦听，则可以通过计算属性 `computed` 作为中间层进行侦听，或使用字符串的形式定义侦听器侦听的属性。

### 对象属性的 watch

使用计算属性 `computed` 作为中间层进行侦听。

代码示例：

```js
export default {
  data() {
    return {
      info: {
        foo: 52,
        bar: '1',
      },
    };
  },
  computed: {
    infoBar() {
      return this.info.bar;
    },
  },
  watch: {
    infoBar(newValue, oldValue) {
      console.log(newValue);
    },
  },
};
```

或者使用字符串形式进行监听。

代码实例：

```js
export default {
  data() {
    return {
      info: {
        foo: 52,
        bar: '1',
      },
    };
  },
  watch: {
    'info.bar': {
      handler: (newValue, oldValue) {
        console.log(newValue);
      },
      immediate: true
    }
  },
};
```

使用后要注销 `watch`，因为组件经常要被销毁，比如我们跳一个路由，从一个页面跳到另一个页面，那么原来页面的 `watch` 其实就没用了，这时候我们应该注销原来页面的 `watch`，不然的话可能会导致内存移除。好在我们平时 `watch` 都是写在组件的选项中，他会随着组件的销毁而销毁。

## Reactive API 实现 watch

[watch](https://vue3js.cn/docs/zh/api/computed-watch-api.html#watch) 函数用来侦听特定的数据源，并在回调函数中执行副作用。默认情况时 **惰性** 的，也就是说仅在侦听的源数据变更时才执行回调。

```js
watch(source, callback, [options]);
```

参数说明：

- `source`：可以支持 String、Object、Function 和 Array 用于指定要侦听的响应式变量
- `callback`：执行的回调函数
- `options`：支持 `deep`、`immediate` 和 `flush` 选项

### 侦听 reactive 定义的数据

```js
import { defineComponent, ref, reactive, toRefs, watch } from 'vue';
export default defineComponent({
  setup() {
    const state = reactive({ nickname: 'xiaofan', age: 20 });

    setTimeout(() => {
      state.age++;
    }, 1000);

    // 修改age值时会触发 watch的回调
    watch(
      () => state.age,
      (curAge, preAge) => {
        console.log('新值:', curAge, '老值:', preAge);
      }
    );

    return {
      ...toRefs(state),
    };
  },
});
```

### 侦听 ref 定义的数据

```js
const year = ref(0);

setTimeout(() => {
  year.value++;
}, 1000);

watch(year, (newVal, oldVal) => {
  console.log('新值:', newVal, '老值:', oldVal);
});
```

### 侦听多个数据

上面两个例子中，我们分别使用了两个 `watch`，当我们需要侦听多个数据源时，可以进行合并，同时侦听多个数据：

```js
watch([() => state.age, year], ([curAge, newVal], [preAge, oldVal]) => {
  console.log('新值:', curAge, '老值:', preAge);
  console.log('新值:', newVal, '老值:', oldVal);
});
```

### 侦听复杂的嵌套对象

我们实际开发中，复杂数据随处可见， 比如：

```js
const state = reactive({
  room: {
    id: 100,
    attrs: {
      size: '140平方米',
      type: '三室两厅',
    },
  },
});

watch(
  () => state.room,
  (newType, oldType) => {
    console.log('新值:', newType, '老值:', oldType);
  },
  { deep: true }
);
```

如果不使用第三个参数 `deep: true`，是无法监听到数据变化的。前面我们提到，默认情况下，`watch` 是惰性的，那什么情况下不是惰性的，可以立即执行回调函数呢？其实使用也很简单，给第三个参数设置 `immediate: true` 即可。

### stop 停止监听

我们在组件中创建 `watch` 监听，会在组件被销毁时自动停止。如果在组件销毁之前我们想要停止掉某个监听，可以调用 `watch` 函数的返回值，操作如下：

```js
const stopWatchRoom = watch(
  () => state.room,
  (newType, oldType) => {
    console.log('新值:', newType, '老值:', oldType);
  },
  { deep: true }
);

setTimeout(() => {
  // 停止监听
  stopWatchRoom();
}, 3000);
```

还有一个监听函数 `watchEffect`, 在我看来 `watch` 已经能满足监听的需求，为什么还要有 `watchEffect` 呢？虽然我没有 get 到它的必要性，但是还是要介绍一下 `watchEffect`，首先看看它的使用和 `watch` 究竟有何不同。

```js
import { defineComponent, ref, reactive, toRefs, watchEffect } from 'vue';
export default defineComponent({
  setup() {
    const state = reactive({ nickname: 'xiaofan', age: 20 });
    let year = ref(0);

    setInterval(() => {
      state.age++;
      year.value++;
    }, 1000);

    watchEffect(() => {
      console.log(state);
      console.log(year);
    });

    return {
      ...toRefs(state),
    };
  },
});
```

执行结果首先打印一次 `state `和 `year` 值；然后每隔一秒，打印 `state` 和 `year` 值。

从上面的代码可以看出， 并没有像 `watch` 一样需要先传入依赖，`watchEffect` 会自动收集依赖, 只要指定一个回调函数。在组件初始化时，会先执行一次来收集依赖，然后当收集到的依赖中数据发生变化时，就会再次执行回调函数。所以总结对比如下：

1. watchEffect 不需要手动传入依赖
2. watchEffect 会先执行一次用来自动收集依赖
3. watchEffect 无法获取到变化前的值， 只能获取变化后的值

上面介绍了 Vue3 Composition API 的部分内容, 还有很多非常好用的 API, 建议直接查看官网 [Composition API](https://v3.vuejs.org/api/composition-api.html#setup?ref=madewithvuejs.com)。
