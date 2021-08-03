---
nav:
  title: 用法
  order: 1
title: 事件
order: 2
---

# 事件

事件接口

- `$on(eventName)` 监听事件
- `emit(eventName)` 触发事件

vm.\$emit(event, [...args])

- event 派发事件名（String）
- args 参数列表（Any）

vm.\$on(event, callback)

通常业务中 emit 在父作用域进行触发，通知子组件进行执行事件

## 父组件执行子组件方法

1. 在父组件通过 `$refs` 获取子组件实例引用，然后调用 `$emit` 方法通知子组件
2. 在子组件中通过 `$on` 方法监听上一步广播的事件名

**父组件：**

```html
<template>
  <div @click="switchVisible">切换</div>
  <Child ref="child">
</template>
<script>
import Child from './Child';

export default {
  name: 'parent',
  components: {
    Child,
  },
  data() {
    return {
      index: 0,
    };
  },
  methods: {
    switchVisible() {
      this.$ref.child.handleVisible(index);
      this.index += 1;
    },
  },
};
</script>
```

**子组件：**

```html
<template>
  <div>{{ visible }}</div>
</template>
<script>
  export default {
    name: 'child',
    data() {
      return {
        visible: false,
      };
    },
    methods: {
      handleVisible(index) {
        console.log(index);
        this.visible = !this.visible;
      },
    },
  };
</script>
```

## 子组件调用父组件方法

### 在子组件域内通过父引用触发

通过 `this.$parent.event` 调用父组件的方法。

**父组件：**

```html
<template>
  <Child @console="handleConsole">
</template>
<script>
import Child from './Child';

export default {
  name: 'parent',
  components: {
    Child,
  },
  methods: {
    handleConsole (msg) {
      console.log(msg)
    },
  },
};
</script>
```

**子组件：**

```html
<template>
  <div @click="onConsole">Child</div>
</template>
<script>
  export default {
    name: 'child',
    methods: {
      onConsole() {
        this.$parent.console('Hello world!');
      },
    },
  };
</script>
```

### 从父组件传参进子组件

**父组件：**

```html
<template>
  <Child :console="handleConsole">
</template>
<script>
import Child from './Child';

export default {
  name: 'parent',
  components: {
    Child,
  },
  methods: {
    handleConsole (msg) {
      console.log(msg)
    },
  },
};
</script>
```

**子组件：**

```html
<template>
  <div @click="onConsole()">Child</div>
</template>
<script>
  export default {
    name: 'child',
    props: {
      console: {
        type: Function,
        default: null,
      },
    },
    methods: {
      onConsole() {
        if (this.console) {
          this.console('Hello world!');
        }
      },
    },
  };
</script>
```

---

[深入理解 e.target 与 e.currentTarget](https://juejin.im/post/59f16ffaf265da43085d4108)
