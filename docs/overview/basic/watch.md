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

## 用法

### 侦听 props

```js
export default {
  data() {
    return {
      sourceData: [],
      total: 0,
    };
  },
  props: ['list'],
  watch: {
    list: function(newVal, oldVal) {
      this.total = newVal.length;
      this.sourceData = newVal;
    },
  },
};
```

在 `list` 传值成功的前提下，有时候会出现直接在 `watch` 里面通过 `this.list` 是无法拿到的，总是显示 `undefined`。然后需要通过 `newVal` 和 `oldVal` 这么处理，才能拿到 `list` 的值。
