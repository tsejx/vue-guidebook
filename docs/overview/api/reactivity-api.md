---
nav:
  title: 基础
  order: 1
group:
  title: API
  order: 10
title: 响应性 API
order: 10
---

# 响应性 API

## Reactive API

| API               | 说明                                                                                         |
| :---------------- | :------------------------------------------------------------------------------------------- |
| `reactive`        | 生成引用类型的响应性代理副本。深层的 `refs` 都会被自动解包                                   |
| `readonly`        | 生成基于纯对象、响应性代理副本或 `refs` 的只读（深层）代理副本。深层的 `refs` 都会被自动解包 |
| `isProxy`         | 用于判断是否由 `reactive` 或 `readonly` 创建的响应性代理副本                                 |
| `isReactive`      | 用于判断是否为响应性代理副本                                                                 |
| `toRaw`           | 获取 `reactive` 或 `readonly` 代理副本的原始对象                                             |
| `markRaw`         | 标记对象，并将其设为永远不可创建代理副本                                                     |
| `shallowReactive` | 浅层生成响应性代理副本                                                                       |
| `shallowReadonly` | 浅层生成只读代理副本                                                                         |

### reactive

生成对象（`Object`、`Array`、`Map`、`Set`、`WeakMap` 和 `WeakSet` 等）的响应式代理副本。

代码示例：

```js
// 1. 直接传入对象
const state = reactive({ count: 0 });

// 2. 将 ref 声明作为对象属性
const count = ref(1);
const obj = reactive({});

obj.count = count;
```

类型声明：

```ts
function reactive<T extends object>(target: T): UnwrapNestedRefs<T>;
```

### readonly

接收一个对象（响应式对象或纯对象）或 `ref` 并返回原始对象的只读代理。

只读代理是深层的：任何被访问的嵌套 property 也是只读的。

### isProxy

用于检查对象是否是由 `reactive` 或 `readonly` 创建的 proxy。

### isReactive

检查对象是否是由 `reactive` 创建的响应式代理。

如果该代理是 `readonly` 创建的，但包裹了由 `reactive` 创建的另一个代理，它也会返回 `true`。

### isReadonly

检查对象是否由 `readonly` 创建的只读代理。

### toRaw

返回 `reactive` 或 `readonly` 代理的原始对象。

### markRaw

标记一个对象，使其永远不会转换为 proxy。返回对象本身。

### shallowReactive

创建一个响应式代理，它跟踪其自身 property 的响应性，但不执行嵌套对象的深层响应式转换（暴露原始值）。

```js
const state = shallowReactive({
  foo: 1,
  nested: {
    bar: 2,
  },
});

// 改变 state 本身的性质是响应式的
state.foo++;

// ...但是不转换嵌套对象
isReactive(state.nested); // false
// 非响应式
state.nested.bar++;
```

与 `reactive` 不同，任何使用 `ref` 的 property 都 <strong style="color:red">不会</strong> 被代理自动解包。

### shallowReadonly

创建一个 proxy，使其自身的 property 为只读，但不执行嵌套对象的深度只读转换（暴露原始值）。

## Refs API

| API          | 说明                                                                                      |
| :----------- | :---------------------------------------------------------------------------------------- |
| `ref`        | 生成内部值的响应性 ref 对象，ref 对象的 `value` 值指向该内部值                            |
| `unref`      | 如果传入 ref 对象，则返回内部值，否则返返回传入参数                                       |
| `toRef`      | 用于基于在 ref 源响应式对象某个 property 新创建一个 `ref`，                               |
| `toRefs`     | 将响应式对象转换为普通对象，返回对象的每个 property 指向原始对象相应 property 的 ref 对象 |
| `isRef`      | 用于检测是否为 ref 对象                                                                   |
| `customRef`  | 自定义 ref，并对其依赖项跟踪和更新出发进行显式控制                                        |
| `shallowRef` | 创建一个跟踪自身 `.value` 变化的 ref，但不会使其值也变为响应式                            |
| `triggerRef` | 手动执行与 `shallowRef` 关联的副作用                                                      |

### ref

接受一个内部值并返回一个响应式且可变的 `ref` 对象。`ref` 对象具有指向内部指的单个 property `<ref>.value`。

代码示例：

```js
const count = ref(0);
console.log(count.value); // 0

count.value++;
console.log(count.value); // 1
```

如果将对象分配为 `ref` 值，则通过 `reactive` 函数使该对象具有高度的响应式。

类型声明：

```ts
interface Ref<T> {
  value: T;
}

function ref<T>(value: T): Ref<T>;
```

有时我们可能需要为 `ref` 的内部值指定复杂类型。想要简洁地做到这一点，我们可以在调用 `ref` 覆盖默认推断时传递一个泛型参数：

```ts
// foo 的类型：Ref<string | number>
const foo = ref<string | number>('foo');

foo.value = 123; // ok!
```

如果泛型的类型未知，建议将 `ref` 转换为 `Ref<T>`：

```ts
function useState<State extends string>(initial: State) {
  const state = ref(initial) as Ref<State>; // state.value => State extends string
  return state;
}
```

### unref

如果参数是一个 `ref`，则返回内部值，否则返回参数本身。这是 `val = isRef(val) ? val.value : val` 的语法糖函数。

```ts
function useFoo(x: number | Ref<number>) {
  const unwrapped = unref(x); // unwrapped 现在一定是数字类型
}
```

### toRef

可以用来为源响应式对象上的某个 property 新创建一个 `ref`。然后，`ref` 可以被传递，它会保持对其源 property 的响应式连接。

### toRefs

将响应式对象转换为普通对象，其中结果对象的每个 property 都是指向原始对象相应 property 的 `ref`。

当从组合式函数返回响应式对象时，`toRefs` 非常有用，这样消费组件就可以在不丢失响应性的情况下对返回的对象进行解构/展开：

```js
function useFeature() {
  const state = reactive({
    foo: 1,
    bar: 2,
  });

  // 操作 state 的逻辑

  // 返回时转换为 ref
  return toRefs(state);
}

export default {
  setup() {
    // 可以在不失去响应性的情况下解构
    const { foo, bar } = useFeature();

    return {
      foo,
      bar,
    };
  },
};
```

`toRefs` 只会为源对象中包含的 property 生成 ref。如果要为特定的 property 创建 ref，则应当使用 `toRef`。

### isRef

检查值是否为一个 ref 对象。

### customRef

创建一个自定义的 ref，并对其依赖项跟踪和更新触发进行显式控制。它需要一个工厂函数，该函数接收 `track` 和 `trigger` 函数作为参数，并且应该返回一个带有 `get` 和 `set` 的对象。

使用自定义 ref 通过 `v-model` 实现 debounce 的示例：

```html
<input v-model="text" />
```

<br/>

```js
function useDebouncedRef(value, delay = 200) {
  let timeout;
  return customRef((track, trigger) => {
    return {
      get() {
        track();
        return value;
      },
      set(newValue) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          value = newValue;
          trigger();
        }, delay);
      },
    };
  });
}
```

类型声明：

```ts
function customRef<T>(factory: CustomRefFactory<T>): Ref<T>;

type CustomRefFactory<T> = (
  track: () => void,
  trigger: () => void
) => {
  get: () => T;
  set: (value: T) => void;
};
```

### shallowRef

创建一个跟踪自身 `.value` 变化的 ref，但不会使其值也变成响应式的。

```js
const foo = shallowRef({});

// 改变 ref 的值是响应式的
foo.value = {};

// 但是这个值不会被转换
isReactive(foo.value); // false
```

### triggerRef

手动执行与 `shallowRef` 关联的任何作用（effect）。

```js
const shallow = shallowRef({
  greet: 'Hello world!',
});

// 第一次运行时记录一次 "Hello world!"
watchEffect(() => {
  console.log(shallow.value.greet);
});

// 这不会出发副作用（effect），因为 ref 是浅层的
shallow.value.greet = 'Hello universe!';

// 记录 "Hello universe!"
triggerRef(shallow);
```

## Computed 与 Watch

| API               | 说明 |
| :---------------- | :--- |
| `computed`        |      |
| `watchEffect`     |      |
| `watchPostEffect` |      |
| `watchSyncEffect` |      |
| `watch`           |      |

### computed

接受一个 `getter` 函数，并根据 `getter` 的返回值返回一个不可变的响应式 ref 对象。

或者，接受一个具有 `get` 和 `set` 的对象，用于创建可写的 `ref` 对象。

```js
const count = ref(1);
const countComputed = computed({
  get: () => count.value + 1,
  set: (val) => {
    count.value = val - 1;
  },
});

plusOne.value = 1;
console.log(count.value); // 1
```

类型声明：

```ts
// 只读的
function computed<T>(
  getter: () => T,
  debuggerOptions?: DebuggerOptions
) : Readonly<Ref<Readonly<T>>>

// 可写的
function computed<T> (
  options: {
    get: () => T,
    set: (value: T) => void
  },
  debuggerOptions?: DebuggerOptions
): Ref<T>

interface DebuggerOptions {
  onTrack? (event: DebuggerEvent) => void
  onTrigger?: (event: DebuggerEvent) => void
}

interface DebuggerEvent {
  effect: ReactiveEffect
  target: any
  type: OperationTypes
  key: string | symbol | undefined
}
```

### watchEffect

立即执行传入的一个函数，同时响应式追踪其依赖，并在其依赖变更时重新鱼形该函数。

类型声明：

```ts
function watchEffect(
  effect: (onInvalidate: InvalidateCbRegistractor) => void,
  options?: WatchEffectOptions
): StopHandle;

interface WatchEffectOptions {
  flush?: 'pre' | 'post' | 'sync'; // 默认 'pre'
  onTrack?: (event: DebuggerEvent) => void;
  onTrigger?: (event: DebuggerEvent) => void;
}

interface DebuggerEvent {
  effect: ReactiveEffect;
  target: any;
  type: OperationTypes;
  key: string | symbol | undefined;
}

type InvalidateVbRegistractor = (invalidate: () => void) => void;

type StopHandle = () => void;
```

### watchPostEffect

版本：Vue3.2+

`watchEffect` 的别名，带有 `flush: 'post'` 选项。

### watchSyncEffect

版本：Vue3.2+

`watchEffect` 的别名，带有 `flush: 'sync'` 选项。

### watch

侦听特定的数据源，并在单独的回调函数中执行副作用。默认情况下，它也是惰性的，即回调仅在侦听源发生变化时被调用。

与 `watchEffect` 相比，`watch` 允许我们：

- 惰性地执行副作用
- 更具体地说明应触发侦听器重新运行的状态
- 访问被侦听状态的先前值和当前值

#### 侦听单一源

侦听器数据源可以是一个具有返回值的 `getter` 函数，也可以直接是一个 `ref`：

```js
// 侦听一个 getter
const state = reactive({ count: 0 });
watch(
  () => state.count,
  (count, prevCount) => {
    /* ... */
  }
);

// 直接侦听一个 ref
const count = ref(0);
watch(count, (count, prevCoun) => {
  /* ... */
});
```

### 侦听多个源

侦听器还可以使用数组以同时侦听多个源：

```js
watch([fooRef, barRef], ([foo, bar], [prevFoo, prevBar]) => {
  /* ... */
});
```

类型声明：

```ts
// 侦听单一源
function watch<T>(
  source: WatcherSource<T>,
  callback: (
    value: T,
    oldValue: T,
    onnInvalidate: InvalidateCbRegistractor
  ) => void,
  options?: WatchOptions
): StopHandle

// 侦听多个源
function watch<T extends WatcherSource<unknown>[]>(
  sources: T
  callback: (
    values: MapSources<T>,
    oldValues: MapSOurces<T>,
    onInvalidate: InvalidateCbRegistrator
  ) => void,
  options?: WatchOptions
): StopHandle

type WatcherSource<T> => Ref<T> | (() => T)

type MapSOurces<T> = {
  [K in keyof T]: T[K] extends WatcherSource<infer V> ? V : never
}

// 参见 `watchEffect` 共享选项的类型声明
interface WatchOptions extends WatchEffectOptions {
  immediate?: boolean // 默认 false
  deep?: boolean
}
```

## Effect 作用域 API

### effectScope

### getCurrentScope

### onScopeDispose

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

## 参考资料

- [做了一夜动画，就为了让大家更好的理解 Vue3 的 Composition API](https://juejin.cn/post/6890545920883032071)
