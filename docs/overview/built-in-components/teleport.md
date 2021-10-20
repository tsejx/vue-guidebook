---
nav:
  title: 基础
  order: 1
group:
  title: 内置组件
  order: 5
title: teleport
order: 6
---

# teleport

Teleport 是 Vue3.x 新推出的功能，提供了一种干净的方法，允许我们控制在 DOM 中哪个父节点下渲染了 HTML，而不必求助于全局状态或将其拆分为两个组件。

简单来说，就是多了种情况判断，然后使用 Vue2 的 `mount()` 方法挂载到指定 DOM 元素上。

[Vue3 Teleport Demo](https://codepen.io/team/Vue/pen/gOPNvjR)

## 源码分析

我们可以先写一个简单的模板，然后看看 Teleport 组件经过模板编译后，生成的代码。

```js
Vue.createApp({
  template: `
    <Teleport to="body">
      <div> teleport to body </div>
    </Teleport>
  `,
});
```

编译后的代码：

```js
function render(_ctx, _cache) {
  with (_ctx) {
    const { createVNode, openBlock, createBlock, Teleport } = Vue;
    return (
      openBlock(),
      createBlock(Teleport, { to: 'body' }, [
        createVNode('div', null, ' teleport to body ', -1 /* HOISTED */),
      ])
    );
  }
}
```

可以看到 `Teleport` 组件通过 `createBlock` 进行创建。

```ts
// packages/runtime-core/src/renderer.ts
export function createBlock(type, props, children, patchFlag) {
  const vnode = createVNode(type, props, children, patchFlag);
  // ... 省略部分逻辑
  return vnode;
}

export function createVNode(type, props, children, patchFlag) {
  // class & style normalization.
  if (props) {
    // ...
  }

  // encode the vnode type information into a bitmap
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : __FEATURE_SUSPENSE__ && isSuspense(type)
    ? ShapeFlags.SUSPENSE
    : isTeleport(type)
    ? ShapeFlags.TELEPORT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : isFunction(type)
    ? ShapeFlags.FUNCTIONAL_COMPONENT
    : 0;

  const vnode: VNode = {
    type,
    props,
    shapeFlag,
    patchFlag,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
  };

  return vnode;
}

// packages/runtime-core/src/components/Teleport.ts
export const isTeleport = (type) => type.__isTeleport;
export const Teleport = {
  __isTeleport: true,
  process() {},
};
```

传入 `createBlock` 的第一个参数为 `Teleport`，最后得到的 `vnode` 中会有一个 `shapeFlag` 属性，该属性用来表示 `vnode` 的类型。`isTeleport(type)` 得到的结果为 `true`，所以 `shapeFlag` 属性最后的值为 `ShapeFlags.TELEPORT`（`1 << 6`）。

```ts
// packages/shared/src/shapeFlags.ts
export const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 1 << 1,
  STATEFUL_COMPONENT = 1 << 2,
  TEXT_CHILDREN = 1 << 3,
  ARRAY_CHILDREN = 1 << 4,
  SLOTS_CHILDREN = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEPT_ALIVE = 1 << 9,
}
```

在组件的 `render` 节点，会依据 `type` 和 `shapeFlag` 走不同的逻辑。

```js
// packages/runtime-core/src/renderer.ts
const render = (vnode, container) => {
  if (vnode == null) {
    // 当前组件为空，则将组件销毁
    if (container._vnode) {
      unmount(container._vnode, null, null, true)
    }
  } else {
    // 新建或者更新组件
    // container._vnode 是之前已创建组件的缓存
    patch(container._vnode || null, vnode, container)
  }
  container._vnode = vnode
}

// patch 是表示补丁，用于 vnode 的创建、更新、销毁
const patch = (n1, n2, container) => {
  // 如果新旧节点的类型不一致，则将旧节点销毁
  if (n1 && !isSameVNodeType(n1, n2)) {
    unmount(n1)
  }
  const { type, ref, shapeFlag } = n2
  switch (type) {
    case Text:
      // 处理文本
      break
    case Comment:
      // 处理注释
      break
    // case ...
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // 处理 DOM 元素
      } else if (shapeFlag & ShapeFlags.COMPONENT) {
        // 处理自定义组件
      } else if (shapeFlag & ShapeFlags.TELEPORT) {
        // 处理 Teleport 组件
        // 调用 Teleport.process 方法
        type.process(n1, n2, container...);
      } // else if ...
  }
}
```

可以看到，在处理 `Teleport` 时，最后会调用 `Teleport.process` 方法，Vue3 中很多地方都是通过 `process` 的方式来处理 `vnode` 相关逻辑的，下面我们重点看看 `Teleport.process` 方法做了些什么。

```js
// packages/runtime-core/src/components/Teleport.ts
const isTeleportDisabled = (props) => props.disabled;
export const Teleport = {
  __isTeleport: true,
  process(n1, n2, container) {
    const disabled = isTeleportDisabled(n2.props);
    const { shapeFlag, children } = n2;
    if (n1 == null) {
      const target = (n2.target = querySelector(n2.prop.to));
      const mount = (container) => {
        // compiler and vnode children normalization.
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(children, container);
        }
      };
      if (disabled) {
        // 开关关闭，挂载到原来的位置
        mount(container);
      } else if (target) {
        // 将子节点，挂载到属性 `to` 对应的节点上
        mount(target);
      }
    } else {
      // n1不存在，更新节点即可
    }
  },
};
```

其实原理很简单，就是将 `Teleport` 的 `children` 挂载到属性 `to` 对应的 DOM 元素中。为了方便理解，这里只是展示了源码的九牛一毛，省略了很多其他的操作。

## 参考资料
