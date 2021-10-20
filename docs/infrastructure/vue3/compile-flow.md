---
nav:
  title: 架构
  order: 2
group:
  title: Vue3 架构
  order: 1
title: 代码编译
order: 20
---

# 代码编译

由 Vue 代码编译生成最终运行代码过程。

## 模版编译流程

### Vue2.x 编译流程

```
template -> parse 模版基础编译 -> optimize 优化 AST -> generate 生成 JS 字符串 -> render 函数
```

### Vue3 编译流程

1. Parse Phase：根据 template 解析出表述 DOM 节点的 AST
2. Transform Phase
   1. 原始 AST 转化为可渲染 AST
   2. 优化信息生成
   3. 创建嗲吗生成器
3. Generate Phase：由 Transform 阶段创建的代码生成器，生成最终的运行时代码

### Vue2.x vs Vue3 编译结果

```html
<div name="test">
  <!-- 这是注释 -->
  <p>{{ test }}</p>
  一个文本节点
  <div>good job</div>
</div>
```

**Vue2**

```js
function render() {
  with (this) {
    return _c(
      'div',
      {
        attrs: {
          name: 'test',
        },
      },
      [_c('p', [_v(_s(test))]), _v('\n     一个文本节点\n    '), _c('div', [_v('good job')])]
    );
  }
}
```

**Vue3**

```js
import {
  createCommentVNode as _createCommentVNode,
  toDisplayString as _toDisplayString,
  createVNode as _createVNode,
  createTextVNode as _createTextVNode,
  openBlock as _openBlock,
  createBlock as _createBlock,
} from 'vue';

const _hoisted_1 = {
  name: 'test',
};
const _hoisted_2 = /*#__PURE__*/ _createTextVNode(' 一个文本节点 ');
const _hoisted_3 = /*#__PURE__*/ _createVNode('div', null, 'good job', -1 /* HOISTED */);

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (
    _openBlock(),
    _createBlock('div', _hoisted_1, [
      _createCommentVNode(' 这是注释 '),
      _createVNode('p', null, _toDisplayString(_ctx.test), 1 /* TEXT */),
      _hoisted_2,
      _hoisted_3,
    ])
  );
}
```

## 参考资料

- [Vue3.0 源码解读 - 编译系统（一）](https://zhuanlan.zhihu.com/p/340995991)
