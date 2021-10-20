---
nav:
  title: 架构
  order: 2
group:
  title: Vue3 架构
  order: 1
title: 框架分析
order: 1
---

# 框架分析

## 框架升级

> Vue3 和 Vue2 有什么不同？

大的改动：

- `proxy` 代替 `Object.definePrototety` 响应式系统
- TypeScript 代替 Flow 类型检查
- 重构了目录结构，将代码主要分成三个独立的模块，更利于长期维护
- 重写 VDOM，优化编译性能
- 支持 Tree Shaking
- 增加了 Composition API（setup），让代码更易于维护

小的改动:

- 异步组件需要 `defineAsyncComponent` 方法来创建
- `v-model` 用法
- `v-if` 优先级高于 `v-for`
- `destroyed` 生命周期选项被重命名为 `unmounted`
- `beforeDestroy` 生命周期选项被重命名为 `beforeUnmount`
- `render` 函数默认参数 `createElement` 移除改为全局引入
- 组件事件现在需要在 `emits` 选项中声明

新特性：

- 组合式 API
- Teleport
- `framents`（组件支持多个根节点）
- `createRenderer`（跨平台的自定义渲染器）

只列举了主要修改点，详细推荐看官网的 [v3 迁移指南](https://v3.cn.vuejs.org/guide/migration/introduction.html)

## 性能提升

通过响应式系统重写、编译优化和源码体积优化（按需加载）三个方面提升了性能。

### 响应式系统提升

Vue2 在初始化的时候，通过 `Object.defineProperty` 对 `data` 的每个属性进行访问和修改的拦截，`getter` 进行依赖收集、`setter` 派发更新。在属性值是对象的时候还需要递归调用 `defineproperty`。

看下大致实现的代码：

```js
function observe(target) {
  if (target && typeof target === 'Object') {
    Object.keys(target).forEach((key) => {
      defineReactive(target, key, target[key]);
    });
  }
}
function defineReactive(obj, key, val) {
  const dep = new Dep();
  // 如果属性值是对象就遍历它的属性
  observe(val);
  Object.defineProperty(obj, key, {
    get() {
      return val;
    },
    set(v) {
      val = v;
      dep.notify();
    },
  });
}
```

而如果属性是数组，还需要覆盖数组的七个方法（会改变原数组的七个方法）进行变更的通知：

```js
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);
const methodsToPatch = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];

methodsToPatch.forEach(function (method) {
  const original = arrayProto[method];
  def(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args);
    const ob = this.__ob__;
    ob.dep.notify();
    return result;
  });
});
```

从这几段代码可以看出 `Object.defineProperty` 的几个缺点：

- 初始化时需要遍历对象所有 `key`，层级多的情况下，性能有一定影响
- 动态新增、删除对象属性无法拦截，只能用 `setter` 或 `delete` API 代替
- 不支持新的 Map、Set 等数据结构
- 无法监控到数组下标的变化（监听的性能代价太大）

所以在 Vue3 中用了 Proxy 全面代替 `Object.defineProperty` 的响应式系统。Proxy 是比较新的浏览器特性，拦截的是整个对象而不是对象的属性，可以拦截多种方法，包括属性的访问、赋值、删除等操作，不需要初始化的时候遍历所有属性，并且是 <strong style="color:red">懒执行</strong> 的特性，也就是在访问到的时候才会触发，当访问到对象属性的时候才会递归代理这个对象属性，所以性能比 Vue2 有明显的优势。

总结下 Proxy 的优势：

- 懒执行，不需要初始化的时候递归遍历
- 可以监听多种操作方法，包括动态新增的属性和删除属性、`has`、`apply` 等操作
- 可以监听数组的索引和 `length` 等属性
- 浏览器新标准，性能更好，并且有持续优化的可能

看下大致实现拦截对象的方法：

```ts
export function reactive(target: object) {
  if (target && (target as Target)[ReactiveFlags.IS_READONLY]) {
    return target;
  }
  return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers);
}
function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>
) {
  const proxy = new Proxy(target, baseHandlers);
  // 用 WeakMap 收集
  proxyMap.set(target, proxy);
  return proxy;
}
```

### 编译优化

编译优化主要是通过重写虚拟 DOM。优化的点包括编译模板的静态标记、静态提升、事件缓存。

#### 静态标记

在对更新的节点进行对比的时候，只会去对比带有静态标记的节点。并且 PatchFlag 枚举定义了十几种类型，用以更精确的定位需要对比节点的类型。

```xml
<div id="app">
    <p>前端好好玩</p>
    <div>{{message}}</div>
</div>
```

Vue2 编译后的渲染函数：

```js
function render() {
  with (this) {
    return _c(
      'div',
      {
        attrs: {
          id: 'app',
        },
      },
      [_c('p', [_v('前端好好玩')]), _c('div', [_v(_s(message))])]
    );
  }
}
```

这个 `render` 函数会返回 `vnode`，后面更新的时候 Vue2 会调 `patch` 函数比旧 `vnode` 进行 `diff` 算法更新（在我的上篇文章有解析过），这时候对比是整个 `vnode`，包括里面的静态节点 `<p>前端好好玩</p>`，这样就会有一定的性能损耗。

Vue3 编译后的渲染函数:

```js
import {
  createVNode as _createVNode,
  toDisplayString as _toDisplayString,
  openBlock as _openBlock,
  createBlock as _createBlock,
} from 'vue';

export function render(_ctx, _cache) {
  return (
    _openBlock(),
    _createBlock('div', { id: 'app' }, [
      _createVNode('p', null, '前端好好玩'),
      _createVNode('div', null, _toDisplayString(_ctx.message), 1 /* TEXT */),
    ])
  );
}
```

只有 `_createVNode` 这个函数带有第四个参数的才是非静态节点，也就是需要后续 `diff` 的节点。第四个参数是这个节点具体包含需要被 `diff` 的类型，比如是 `text` 节点，只有 `{{}}` 这种模板变量的绑定，后续只需要对比这个 `text` 即可，看下源码中定义了哪些枚举的元素类型:

```ts
const enum PatchFlags {
  // 动态的文本节点
  TEXT = 1,
  // 2，动态Class的节点
  CLASS = 1 << 1,
  // 4，表示动态样式
  STYLE = 1 << 2,
  // 8，动态属性
  PROPS = 1 << 3,
  // 16 动态键名
  FULL_PROPS = 1 << 4,
  // 32 带有事件监听器的节点
  HYDRATE_EVENTS = 1 << 5,
  // 64 一个不会改变子节点顺序的
  STABLE_FRAGMENT = 1 << 6,
  // 128 带有 key 属性
  KEYED_FRAGMENT = 1 << 7,
  // 256 子节点没有 key
  UNKEYED_FRAGMENT = 1 << 8,
  // 512
  NEED_PATCH = 1 << 9,
  // 动态插槽
  DYNAMIC_SLOTS = 1 << 10,
  // 静态提升的标记，不会被 diff，下面的静态提升会提到
  HOISTED = -1,
  BAIL = -2,
}
```

#### 静态提升

**静态提升** 就是把函数里的某些变量放到外面来，这样再次执行这个函数的时候就不会重新声明。Vue3 在编译阶段做了这个优化。还是上面那段代码，分别看下 Vue2 和 Vue3 编译后的差别。

Vue2 编译后的渲染函数：

```js
function render() {
  with (this) {
    return _c(
      'div',
      {
        attrs: {
          id: 'app',
        },
      },
      [_c('p', [_v('前端好好玩')]), _c('div', [_v(_s(message))])]
    );
  }
}
```

Vue3 编译后的渲染函数：

```js
import {
  createVNode as _createVNode,
  toDisplayString as _toDisplayString,
  openBlock as _openBlock,
  createBlock as _createBlock,
} from 'vue';

const _hoisted_1 = { id: 'app' };
const _hoisted_2 = /*#__PURE__*/ _createVNode('p', null, '前端好好玩', -1 /* HOISTED */);

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (
    _openBlock(),
    _createBlock('div', _hoisted_1, [
      _hoisted_2,
      _createVNode('div', null, _toDisplayString(_ctx.message), 1 /* TEXT */),
    ])
  );
}
```

可以看到 Vue3 将不变的节点声明放到了外面去执行，后面再渲染的时候直接取 `_hoited` 变量就行，而 Vue2 每次 `render` 都需要执行 `_c` 生成新的节点。这里还有一个点，`_hoisted_2` 的 `_createVNode` 第四个参数 `-1`，标记这个节点永远不需要 diff。

#### 事件缓存

默认情况下事件被认为是动态变量，所以每次更新视图的时候都会追踪它的变化。但是正常情况下，我们的 `@click` 事件在视图渲染前和渲染后，都是同一个事件，基本上不需要去追踪它的变化，所以 Vue3 对此作出了相应的优化叫事件监听缓存：

```xml
<div id="app">
    <p @click="handleClick">前端好好玩</p>
</div>
```

Vue3 编译后的渲染函数：

```js
import {
  createVNode as _createVNode,
  openBlock as _openBlock,
  createBlock as _createBlock,
} from 'vue';

const _hoisted_1 = { id: 'app' };

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (
    _openBlock(),
    _createBlock('div', _hoisted_1, [
      _createVNode(
        'p',
        {
          onClick:
            _cache[1] || (_cache[1] = (...args) => _ctx.handleClick && _ctx.handleClick(...args)),
        },
        '前端好好玩'
      ),
    ])
  );
}
```

可以看到 `onClick` 有一个 `_cache` 判断缓存赋值的操作，从而变成静态节点。

### 源码体积优化

Vue3 通过重构全局 API 和内部 API，支持了 Tree Shaking，任何一个函数，如 `ref`、`reavtived`、`computed` 等，仅仅在用到的时候才打包，没用到的模块都被 Shake 掉，打包的整体体积变小。

## 组合式接口

Composition API 是 Vue3 最重要的特性之一，为的是更好的逻辑复用和代码组织，解决 Options API 在大型项目中，Options API 不好拆分和重用的问题。

Composition api 声明在 `setup` 函数内，`setup` 是在创建组件之前执行，这也意味着这时候组件实例尚未被创建，因此在 `setup` 选项中没有 `this`。

`setup` 接受 `props` 和 `context` 两个参数，`props` 是父组件传递的参数，并且原本就是响应式的，`context` 则是一个普通的对象，包含 `attrs`、`slots`、`emit` 三个属性。setup 的返回值可以在模板和其他选项中访问到，也可以返回渲染函数。

Vue2 是将 `data` 选项的数据进行处理后成为响应式数据，而在 Vue3 中要通过 `reactive` 和 `ref` 函数来进行数据定义后才是响应式数据。这样做的一个好处就是模板绑定的数据不一定是需要响应式的，Vue3 通过用户自行决定需要响应式的数据来处理，而 Vue2 中要在模板中使用变量只能通过在 `data` 里声明，这样就造成了一定的性能浪费。

因为 `setup` 是在组件创建之前执行，需要访问组件实例或者 生命周期则要通过引入 Vue 提供的函数，`getCurrentInstance`、`onMounted` 等等，这就是函数式编程的方式，也更利于代码逻辑的拆分，再也不需要 `mixin` 来混入各种选项了。

利用这个特性，可以将一些复用的代码抽离出来作为一个函数，只要在使用的地方直接进行调用，非常灵活，看下官方提供的例子：

```js
import { toRefs, reactive, onUnmounted, onMounted } from 'vue';
function useMouse() {
  const state = reactive({ x: 0, y: 0 });
  const update = (e) => {
    state.x = e.pageX;
    state.y = e.pageY;
  };
  onMounted(() => {
    window.addEventListener('mousemove', update);
  });
  onUnmounted(() => {
    window.removeEventListener('mousemove', update);
  });

  return toRefs(state);
}
```

组件使用方式：

```js
import useMousePosition from './mouse';
export default {
  setup() {
    const { x, y } = useMousePosition();
    return { x, y };
  },
};
```

从源码看下 `setup` 函数的实现和调用逻辑： 创建组件的时候会调 `mountComponent`，在 `mountComponent` 调用 `setupComponent`，再 `setupStatefulComponent` 函数处理。

```js
function setupComponent(
  instance: ComponentInternalInstance,
  isSSR = false
) {
  isInSSRComponentSetup = isSSR

  const { props, children, shapeFlag } = instance.vnode
  const isStateful = shapeFlag & ShapeFlags.STATEFUL_COMPONENT
  initProps(instance, props, isStateful, isSSR)
  initSlots(instance, children)

  const setupResult = isStateful
    ? setupStatefulComponent(instance, isSSR)
    : undefined
  isInSSRComponentSetup = false
  return setupResult // 最终返回setup处理后的结果
}
function setupStatefulComponent(
  instance: ComponentInternalInstance,
  isSSR: boolean
) {
  const Component = instance.type as ComponentOptions

  if (__DEV__) {
    if (Component.name) {
      validateComponentName(Component.name, instance.appContext.config)
    }
    if (Component.components) {
      const names = Object.keys(Component.components)
      for (let i = 0; i < names.length; i++) {
        validateComponentName(names[i], instance.appContext.config)
      }
    }
    if (Component.directives) {
      const names = Object.keys(Component.directives)
      for (let i = 0; i < names.length; i++) {
        validateDirectiveName(names[i])
      }
    }
  }
  // 0. create render proxy property access cache
  instance.accessCache = Object.create(null)
  // 1. create public instance / render proxy
  // also mark it raw so it's never observed
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers)
  if (__DEV__) {
    exposePropsOnRenderContext(instance)
  }
  // 2. call setup()
  const { setup } = Component
  // 如果有setup选项就进去setup的处理
  if (setup) {
    const setupContext = (instance.setupContext =
      setup.length > 1 ? createSetupContext(instance) : null)

    currentInstance = instance
    pauseTracking()
    const setupResult = callWithErrorHandling(
      setup,
      instance,
      ErrorCodes.SETUP_FUNCTION,
      [__DEV__ ? shallowReadonly(instance.props) : instance.props, setupContext]
    )
    // 暂停依赖收集
    resetTracking()
    currentInstance = null

  } else {
    finishComponentSetup(instance, isSSR)
  }
}
```

判断有 `setup` 选项就通过 `callWithErrorHandling` 开始执行 `setup`，这个函数执行 `setup` 选项并做了错误处理机制。

```js
function callWithErrorHandling(
  fn: Function, // 这个fn就是setup选项
  instance: ComponentInternalInstance | null,
  type: ErrorTypes,
  args?: unknown[]
) {
  let res;
  try {
    res = args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
  return res;
}
```

执行完后在调 `handleSetupResult` 对 `setup` 的返回值进行判断是否合法，最终 `finishComponentSetup` 完成 `setup` 处理，看 `finishComponentSetup` 函数：

```js
function finishComponentSetup(
  instance: ComponentInternalInstance,
  isSSR: boolean
) {
  const Component = instance.type as ComponentOptions

  // template / render function normalization
  if (__NODE_JS__ && isSSR) {
    if (Component.render) {
      instance.render = Component.render as InternalRenderFunction
    }
  } else if (!instance.render) {
    // could be set from setup()
    if (compile && Component.template && !Component.render) {
      if (__DEV__) {
        startMeasure(instance, `compile`)
      }
      Component.render = compile(Component.template, {
        isCustomElement: instance.appContext.config.isCustomElement,
        delimiters: Component.delimiters
      })
      if (__DEV__) {
        endMeasure(instance, `compile`)
      }
    }

    instance.render = (Component.render || NOOP) as InternalRenderFunction

    if (instance.render._rc) {
      instance.withProxy = new Proxy(
        instance.ctx,
        RuntimeCompiledPublicInstanceProxyHandlers
      )
    }
  }

  // support for 2.x options
  if (__FEATURE_OPTIONS_API__) {
    currentInstance = instance
    applyOptions(instance, Component)
    currentInstance = null
  }
  ...
}
```

这个函数是将绑定 `render` 函数到当前实例 `instance`，然后再调 `applyOptions` 函数对 `setup` 之外的 `data`、`computed`、`watch` 之类选项进行处理和生命周期钩子的调用。所以可以得出结论，`setup` 里是访问不到 `data` 这些选项和其他生命周期。
