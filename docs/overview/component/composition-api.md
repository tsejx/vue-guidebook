# Composition API

- reactive
- ref
- toRefs
- watch
- watchEffect
- computed
- 生命周期钩子

## setup

`setup` 执行时机是在 `beforeCreate` 之前执行的。

### setup 参数

使用 `setup` 时，它接受两个参数：

1. `props`：组件传入的属性
2. `context`

`setup` 中接受的 `props` 是响应式的，它传入新的 `props` 时，会及时被更新。由于是响应式的，所以**不可以使用 ES6 解构**，解构会消除它的响应式。

```js
export default defineComponent({
  setup(props, context) {
    const { name } = props;

    console.log(name);
  },
});
```

在 `setup` 中不能访问 Vue2 中最常用的 `this` 对象，所以 `context` 中就提供了 `this` 中最常用的三个属性：`attrs`、`slot` 和 `emit`，分别对应 Vue2.x 中的 `$attr` 属性、`slot` 插槽和 `$emit` 发射事件。并且这几个属性都是自动同步最新的值，所以我们每次使用拿到的都是最新值。

## reactive、ref 和 toRefs

在 Vue2.x 中， 定义数据都是在 `data` 中， 但是 Vue3.x 可以使用 `reactive` 和 `ref` 来进行数据定义。

那么 `ref` 和 `reactive` 他们有什么区别呢？分别什么时候使用呢？

```html
<template>
  <div class="homePage">
    <p>第 {{ year }} 年</p>
    <p>姓名： {{ nickname }}</p>
    <p>年龄： {{ age }}</p>
  </div>
</template>

<script>
  import { defineComponent, reactive, ref, toRefs } from 'vue';
  export default defineComponent({
    setup() {
      const year = ref(0);
      const user = reactive({ nickname: 'xiaofan', age: 26, gender: '女' });
      setInterval(() => {
        year.value++;
        user.age++;
      }, 1000);
      return {
        year,
        // 使用reRefs
        ...toRefs(user),
      };
    },
  });
</script>
```

## watch 与 watchEffect

`watch` 函数用来侦听特定的数据源，并在回调函数中执行副作用。默认情况时惰性的，也就是说仅在侦听的源数据变更时才执行回调。

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
