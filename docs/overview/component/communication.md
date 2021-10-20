---
nav:
  title: 基础
  order: 1
group:
  title: 组件化
  order: 2
title: 组件通信
order: 4
---

# 组件通信

## Vue3 组件通信

- `props`
- `$emit`
- `expose` / `ref`
- `attrs`
- `v-model`
- `provide` / `inject`
- Vuex

### `props`

用 `props` 传数据给子组件有两种方法。

**方法一：混合写法**

父组件

```html
<template>
  <child :title="title" :desc="desc"></child>
</template>
<script>
  import child from './child.vue';
  import { ref, reactive } from 'vue';

  export default {
    data() {
      return {
        title: '标题',
      };
    },
    setup() {
      // 创建一个响应式数据

      // 写法一：适用于基础类型  ref 还有其他用处，下面章节有介绍
      const desc = ref('传递子组件的参数');

      // 写法二：适用于引用类型（其实基础类型也行），如数组、对象
      const desc = reactive(['传递子组件的参数']);

      return {
        desc,
      };
    },
  };
</script>
```

子组件

```html
<script>
  export default {
    // 如果这行不写，下面就接收不到
    props: ['title', 'desc'],
    setup(props) {
      console.log(props);
      // { title: "传递子组件的参数", desc: "传递子组件的参数" }
    },
  };
</script>
```

**方法二：纯 Vue3 写法**

父组件

```html
<template>
  <child :title="title"></child>
</template>
<script setup>
  import child from './child.vue';
  import { ref, reactive } from 'vue';

  const title = ref('传递子组件的参数');
  // 或者复杂类型
  const title = reactive(['传递子组件的参数']);
</script>
```

子组件

```html
<script setup>
  import { defineProps } from "vue"

  const props = defineProps({
      // 写法一
      title: String
      // 写法二
      title:{
          type:String,
          default: ''
      }
  })
  console.log(props)
  // { title: "传递子组件的参数" }
</script>
```

- 如果父组件是混合写法，子组件纯 Vue3.x 写法的话，是接收不到父组件里 `data` 的属性，只能接收到父组件里 `setup` 函数里传的属性
- 如果父组件是纯 Vue3.x 写法，子组件混合写法，可以通过 `props` 接收到 `data` 和 `setup` 函数里的属性，但是子组件要是在 `setup` 里接收，同样只能接收到父组件中 `setup` 函数里的属性，接收不到 `data` 里的属性

官方也说了，既然用了 Vue3.x，就不要写 Vue2.x 了，所以不推荐混合写法。下面的例子，一律只用纯 Vue3 的写法，就不写混合写法了。

### `$emit`

子组件派发事件

```html
<template>
  <!-- 写法一 -->
  <button @click="emit('onChildClick')">按钮</buttom>
  <!-- 写法二 -->
  <button @click="handleButtonClick">按钮</buttom>
</template>
<script setup>
  // 方法一：适用于 Vue3.2 版本
  import { defineEmits } from "vue"

  // 对应写法一
  const emit = defineEmits(["onChildClick"])
  // 对应写法二
  const handleButtonClick = ()=>{
    emit("onChildClick", "这是发送给父组件的信息")
  }

  // 方法二：不适用于 Vue3.2版本，该版本 useContext() 已废弃
  import { useContext } from "vue"
  const { emit } = useContext()

  const handleButtonClick = ()=>{
    emit("onChildClick", "这是发送给父组件的信息")
  }
</script>
```

父组件响应事件

```html
<template>
  <child @onChildClick="handleChildClick"></child>
</template>
<script setup>
  import child from './child.vue';

  const handleChildClick = (payload) => {
    console.log(payload);
    // 这是父组件收到的信息
  };
</script>
```

### `expose` 和 `ref`

父组件获取子组件的属性或者调用子组件方法

子组件

```html
<script setup>
  // 方法一 适用于 Vue3.2 版本
  import { defineExpose } from 'vue';
  defineExpose({
    title: '子组件标题',
    handleTitleConsole() {
      console.log('这是子组件的方法');
    },
  });

  // 方法二 不适用于 Vue3.2 版本，该版本 useContext() 已废弃
  import { useContext } from 'vue';
  const ctx = useContext();
  // 对外暴露属性方法等都可以
  ctx.expose({
    title: '这是子组件的属性',
    handleTitleConsole() {
      console.log('这是子组件的方法');
    },
  });
</script>
```

父组件

```html
<template>
  <child ref="childRef"></child>
  <button @click="handleButtonClick">按钮</button>
</template>
<script setup>
  import child from './child.vue';
  import { ref } from 'vue';

  const childRef = ref(null);

  const handleButtonClick = () => {
    console.log(childRef.value.title);
    // 获取子组件对外暴露的属性

    childRef.value.handleTitleConsole();
    // 调用子组件对外暴露的方法
  };
</script>
```

### `attrs`

`attrs` 包含父作用域除 `class` 和 `style` 除外的非 `props` 属性集合

父组件

```html
<template>
  <child :title="title" :desc="desc" content="内容"></child>
</template>
<script setup>
  import child from './child.vue';
  import { ref } from 'vue';

  const title = ref('标题');
  const desc = ref('描述');
</script>
```

子组件

```html
<script setup>
  import { defineProps, useContext, useAttrs } from 'vue';

  const props = defineProps({
    title: String,
  });

  // 方法一 适用于 Vue3.2 版本
  const attrs = useAttrs();
  console.log(attrs);
  // { desc: "描述", content: "内容" }

  // 方法二 不适用于 Vue3.2 版本，该版本 useContext() 已废弃
  const ctx = useContext();
  // 如果没有用 props 接收 title 的话就是 { title: "标题", desc: "描述", content: "内容" }
  console.log(ctx.attrs);
  // { desc: "描述", content: "内容" }
</script>
```

### `v-model`

可以支持多个数据双向绑定

父组件

```html
<child v-model:key="key" v-model:value="value"></child>
<script setup>
  import child from './child.vue';
  import { ref, reactive } from 'vue';

  const key = ref('key');
  const value = ref('value');
</script>
```

子组件

```html
<template>
  <button @click="handlerClick">按钮</button>
</template>
<script setup>
  import { defineEmits, useContext } from 'vue';

  // 方法一 适用于 Vue3.2版本
  const emit = defineEmits(['key', 'value']);

  // 方法二  不适用于 Vue3.2 版本，该版本 useContext() 已废弃
  const { emit } = useContext();

  // 用法
  const handlerClick = () => {
    emit('update:key', 'new key');
    emit('update:value', 'new value');
  };
</script>
```

### `provide` 和 `inject`

provide / inject 为依赖注入

- `provide`：可以让我们指定想要提供给后代组件的数据或
- `inject`：在任何后代组件中接收想要添加在这个组件上的数据，不管组件嵌套多深都可以直接拿来用

父组件

```html
<script setup>
  import { provide } from 'vue';

  provide('title', '标题');
</script>
```

子组件

```html
<script setup>
  import { inject } from 'vue';
  const title = inject('title');

  console.log(title);
  // '标题'
</script>
```

### Vuex

## Vue2 组件通信

## 父子通信

父子通信的实现方式包括：

1. `props` 和 `emit`
2. `v-model`
3. `$children` 和 `$parent`
4. `$listeners` 和 `$attrs`
5. `.sync`

### `props`

`props` 以单向数据流的形式可以很好地实现父子组件间的通信。

所谓单向数据流：就是数据只能通过 `props` 由父组件流向子组件，而子组件并不能通过修改 `props` 传过来的数据修改父组件的相应状态。

> 所有的 `prop` 都使得其父子 `prop` 之间形成了一个单向下行绑定：父级 `prop` 的更新会向下流动到子组件中，但是反过来则不行。这样会防止从子组件意外改变父级组件的状态，从而导致你的应用的数据流向难以理解。

- 父组件通过 `props` 传递参数给子组件
- 子组件通过 `emit` 发射事件传递给父组件

```js
// 父组件
Vue.component('parent', {
  template: `
    <div>
      <p>This is parent component!</p>
      <child :msg="msg" @getChildData="getChildData"></child>
    </div>
	`,
  data() {
    return {
      msg: 'hello',
    };
  },
  methods: {
    // 执行子组件触发的事件
    getChildData(val) {
      console.log(val);
    },
  },
});

// 子组件
Vue.component('child', {
  template: `
    <div>
      <input type="text" v-model="myMessage" @input="passData(myMessage)">
    </div>
	`,
  props: ['message'],
  data() {
    return {
      // 这里是必要的，因为你不能直接修改 props 的值
      myMessage: this.message,
    };
  },
  methods: {
    passData(val) {
      // 数据状态变化时触发父组件中的事件
      this.$emit('getChildData', val);
    },
  },
});

var app = new Vue({
  el: '#app',
  template: `
    <div>
      <parent />
    </div>
	`,
});
```

- 父组件传递数据 msg 给子组件，并通过 v-on 绑定 getChildData 事件来监听子组件的触发事件
- 子组件通过 props 选项得到相关 msg 数据，并将数据缓存在 data 里，当属性数据值发生变化时，通过 `this.$emit` 触发父组件注册的 getChildData 事件处理数据逻辑

### `$emit`

> 🗑 在 Vue3 中，`$on`、`$off` 和 `$once` 实例方法已被移除，组件实例不再实现事件触发接口。

### `v-model`

`v-model` 是 `props` 和 `emit` 的语法糖，`v-model` 默认会解析成名为 `value` 的 `props` 和名为 `input` 的事件。

```html
<!-- Parent Component -->
<template>
  <children v-model="msg"></children>
  <p>{{msg}}</p>
</template>

<script>
  export default {
    data() {
      return {
        msg: 'model',
      };
    },
  };
</script>
```

```html
<!-- Parent Component -->
<template>
  <input :value="value" @input="onInput" />
</template>

<script>
  export default {
    props: ['value'],
    methods: {
      onInput(e) {
        this.$emit('input', e.target.value);
      },
    },
  };
</script>
```

### `$children` 和 `$parent`

在父组件使用 `$children` 访问子组件。

在子组件中使用 `$parent` 访问父组件。

```html
<!-- Parent Component -->
<child />

<script>
  export default {
    data() {
      return {
        msg: 'data',
      };
    },
    methods: {
      onConsole() {
        console.log('Parent Method');
      },
    },
    mounted() {
      console.log(this.$children[0].foo);
    },
  };
</script>
```

```html
<!-- Child Component -->
<div>{{$parent.msg}}</div>

<script>
  export default {
    data() {
      return {
        foo: 'Child Data',
      };
    },
    mounted() {
      // 子组件执行父组件方法
      this.$parent.onConsole();
    },
  };
</script>
```

### `$listeners` 和 `$attrs`

> Vue 2.4+

`props` 和 `emit` 这种通信方式只适合直接的父子组件，如果跨越层级的祖先/子孙组件，使用这样的方式在传递数据量大时会十分不便。

```js
// 组件A GrandParent
Vue.component('grand-parent', {
  template: `
    <div>
      <p>This is grandfather component!</p>
      <B :c="c" :msg="b" @getC="getChildData" @getB="getParentData(b)"></B>
    </div>
  `,
  data() {
    return {
      b: 'b',
      c: 'c', //传递给c组件的数据
    };
  },
  methods: {
    // 执行 B 子组件触发的事件
    getParentData(val) {
      console.log(`这是来自B组件的数据：${val}`);
    },
    // 执行 C 子组件触发的事件
    getChildData(val) {
      console.log(`这是来自C组件的数据：${val}`);
    },
  },
});

// 组件B Parent
Vue.component('parent', {
  template: `
    <div>
      <input type="text" v-model="b" @input="passData(b)">
      <!-- C Child 组件中能直接触发 getC 的原因在于：B 组件调用 C 组件时，使用 v-on 绑定了 $listeners 属性 -->
      <!-- 通过 v-bind 绑定 $attrs 属性，C 组件可以直接获取到 A 组件中传递下来的 props（除了 B 组件中 props 声明的） -->
      <C v-bind="$attrs" v-on="$listeners"></C>
    </div>
  `,
  /**
   * 得到父组件传递过来的数据
   * 这里的定义最好是写成数据校验的形式，免得得到的数据是我们意料之外的
   *
   * props: {
   *   a: {
   *     type: String,
   *     default: ''
   *   }
   * }
   *
   */
  props: ['msg'],
  data() {
    return {
      b: this.msg,
    };
  },
  methods: {
    passData(val) {
      // 触发父组件中的事件
      this.$emit('getB', val);
    },
  },
});

// 组件C Child
Vue.component('child', {
  template: `
    <div>
      <input type="text" v-model="$attrs.c" @input="passCData($attrs.c)">
    </div>
  `,
  methods: {
    passCData(val) {
      // 触发父组件 A 中的事件
      this.$emit('getC', val);
    },
  },
});

var app = new Vue({
  el: '#app',
  template: `
    <div>
      <grand-parent />
    </div>
  `,
});
```

上述例子中，定义了 A、B、C 三个组件，其中组件 B 时组件 A 的子组件，组件 C 时组件 B 的子组件。

- 在组件 A 中为组件 B 和 C 分别定义了一个属性值（b 和 c）和监听事件（getB 和 getA），并将这些通过 props 传递给组件 A 的直接子组件 B
- 在组件 B 中通过 props 只获取了与自身直接相关的属性（msg），并将属性值缓存在 data 中，以便后续的变化监听处理，然后当属性值变化时触发父组件 A 定义的数据逻辑处理事件（getB）。关于组件 B 的直接子组件 C，传递了属性 `$attrs` 和绑定了事件 `$listeners`
- 在组件 C 中直接在 v-model 上绑定了 `$attrs` 属性，通过 `v-on` 绑定了 `$listeners`

`$attrs` 和 `$listeners`

- `$attrs`：包含父作用域中不被 prop 所识别（且获取）的特性绑定（`class` 和 `style` 除外）。当一个组件没有声明任何 prop 时，这里会包含所有父作用域的绑定属性（`class` 和 `style` 除外），并且可以通过 `v-bind="$attrs"` 传入内部组件
- `$listeners`：包含了父作用域中的（不含 `.native` 修饰符的）`v-on` 事件监听器。它可以通过 `v-on="$listeners"` 传入内部组件

### `.sync`

```html
<!-- Parent Component -->
<child :count.sync="num" />

<script>
  export default {
    data() {
      return {
        num: 0,
      };
    },
  };
</script>
```

```html
<div @click="handleAdd">Add</div>

<script>
  export default {
    data() {
      return {
        counter: this.count,
      };
    },
    props: ['count'],
    methods: {
      handleAdd() {
        this.$emit('update:count', ++this.counter);
      },
    },
  };
</script>
```

## 兄弟组件通信

可以通过查找父组件中的子组件实现，`this.$parent.$children` 在 `$children` 中可以通过**组件 name** 查询到需要的组件实例，然后进行通信。

## 跨层级组件通信

Vue 中的 provide / inject 与 React 中的 Context API 相似。

在父组件中通过 `provide` 来提供属性，然后在子组件中通过 `inject` 来注入变量。不论子组件有多深，只要调用了 `inject` 那么就可以注入在 `provide` 中提供的数据，而不是局限于只能从当前父组件的 prop 属性来获取数据，只要在父组件的生命周期内，子组件都可以调用。

可以使用 provide / inject，虽然文档中不推荐直接使用在业务中。

假设有父组件 A，然后一个跨多层次的子组件 B。

```js
// 定义 parent 组件
Vue.component('parent', {
  template: `
    <div>
      <p>This is parent component!</p>
      <child></child>
    </div>
  `,
  provide: {
    foo: 'foo',
  },
  data() {
    return {
      message: 'hello',
    };
  },
});

// 定义 child 组件
Vue.component('child', {
  template: `
    <div>
      <input type="tet" v-model="mymessage">
    </div>
  `,
  inject: ['foo'], // 得到父组件传递过来的数据
  data() {
    return {
      mymessage: this.for,
    };
  },
});

const app = new Vue({
  el: '#app',
  template: `
    <div>
      <parent />
    </div>
  `,
});
```

## 事件总线

对于任意组件间的数据通信，可以采用 [Vuex](../ecosystem/vuex.md) 和 Event Bus 进行数据传输。

事件总线又称为 EventBus。在 Vue 中可以使用 EventBus 来作为沟通桥梁的概念，就像是所有组件共用相同的事件中心，可以向该中心注册发送事件或接收事件，所以组件都可以上下平行地通知其他组件，但也就是太方便所以若使用不慎，就会造成难以维护的灾难，因此才需要更完善的 Vuex 作为状态管理中心，将通知的概念上升到**共享状态层次**。

### 实现过程

首先，先创建事件总线并将其导出，以便其他模块可以使用或者监听它。

```js
// event-bus.js
import Vue from 'vue';
export const EventBus = new Vue();
```

你需要做的只是引入 Vue 并导出它的一个实例（在这种情况下，称它为 EventBus）。实质上它是一个与 DOM 和程序的其他部分完全解耦的组件，它具有的仅仅只是它的实例方法而已。

另一种方式，可以直接在项目中 `main.js` 初始化 EventBus：

这种方式初始化的 EventBus 是全局的事件总线。

```js
// main.js
Vue.prototype.$EventBus = new Vue();
```

EventBus 通过新建 Vue 事件 bus 对象，然后通过 `bus.$emit` 触发事件，`bus.$on` 监听触发的事件。

```js
// 组件 A
Vue.component('A', {
  template: `
    <div>
      <p>This is A component!</p>
      <input type="text" v-model="msg" @input="onPassData(msg)">
    </div>
  `,
  data() {
    return {
      msg: 'Hello brother1',
    };
  },
  methods: {
    onPassData(val) {
      // 触发全局事件 globalEvent
      this.$EventBus.$emit('globalEvent', val);
    },
  },
});

// 组件 B
Vue.component('B', {
  template: `
    <div>
      <p>this is B component!</p>
      <p>组件 A 传递过来的数据：{{aMsg}}</p>
    </div>
  `,
  data() {
    return {
      bMsg: 'hello brother2',
      aMsg: '',
    };
  },
  mounted() {
    //绑定全局事件globalEvent
    this.$EventBus.$on('globalEvent', (val) => {
      this.aMsg = val;
    });
  },
});

//定义中央事件总线
const EventBus = new Vue();

// 将中央事件总线赋值到 Vue.prototype 上，这样所有组件都能访问到了
Vue.prototype.$EventBus = EventBus;

const app = new Vue({
  el: '#app',
  template: `
    <div>
      <A />
      <B />
    </div>
  `,
});
```

上述实例中，我们定义了组件 A 和组件 B，但是组件 A 和组件 B 之间没有任何关系。

1. 首先我们通过 new Vue 实例化了一个 Vue 的实例，也就是我们这里称呼的中央事件总线 EvnetBus，然后将其赋值给 Vue.prototype.\$EventBus，使得所有的业务逻辑都能够访问
2. 然后定义了组件 A，组件 A 里面定义了一个处理方法 onPassdData，主要定义触发一个全局的 globalEvent 事件，并传递一个参数
3. 最后定义组件 B，组件 B 里面的 mounted 生命周期监听了组件 A 里面定义的全局 globalEvent 事件，并在回调函数里面执行了一些逻辑处理

中央事件总线 EventBus 非常简单，就是任意组件和组件之间打交道，没有多余的业务逻辑，只需要在状态变化组件触发一个事件，然后在处理逻辑组件监听该事件就可以。

---

**参考资料：**

- [Vue 组件间通信方式完整版](https://juejin.im/post/5c776ee4f265da2da53edfad)
- [Vue 组件通信方式全面详解](https://juejin.im/post/5c77c4ae518825407505e262)
- [Vue 父子组件通信的 1212 种方式](https://juejin.im/post/5bd18c72e51d455e3f6e4334)
- [Vue 最佳实践](https://mp.weixin.qq.com/s/cVYtYWOB2mie-bjZmSw9AQ)
- [Vue Patterns](https://github.com/learn-vuejs/vue-patterns)
- [事件总线](https://juejin.im/post/5bb355dae51d450ea4020b42)
- [Vue3 的 7 种和 Vue2 的 12 种组件通信方式](https://juejin.cn/post/6999941215043420191)
