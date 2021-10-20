---
nav:
  title: 架构
  order: 2
group:
  title: Vue2 架构
  order: 5
title: 响应式原理
order: 1
---

# 响应式原理

MVVM 是 Model-View-ViewModel 的简写，即 **模型-视图-视图** 模型。Model 指的是后端传递的数据。View 指的是所看到的页面。ViewModel 是 MVVM 模式的核心，它是连接 View 和 Model 的桥梁。

- 将 Model 转化成 View，即将后端传递的数据转化成所看到的页面。实现方式：数据绑定
- 将 View 转化成 Model，即将所看到的页面转化成后端的数据。实现方式：DOM 事件监听
- 这两个方向都实现的，称之为数据的**双向绑定**

在 MVVM 框架下 View 和 Model 是不能直接通信的，它们通过 ViewModel 来通信，ViewModel 通常要实现一个 Observer 观察者，当数据发生变化，ViewModel 能够监听到数据的这种变化，然后通知对应的视图做自动更新，而当用户操作视图，ViewModel 也能监听到视图的变化，然后通知数据做改动，这实际上就实现了数据的双向绑定。并且 MVVM 中的 View 和 ViewModel 可以互相通信。

## 发布订阅模式

发布订阅模式主要包含哪些内容呢？

1. 发布函数：发布的时候执行相应的回调
2. 订阅函数：添加订阅者，传入发布时要执行的函数，可能会携额外参数
3. 一个缓存订阅者以及订阅者的回调函数的列表
4. 取消订阅

JavaScript 中事件模型，在 DOM 节点上绑定事件函数（`addEventListener`），触发的时候执行就是应用了发布-订阅模式。

## 实现方式

1. 脏值检查：Angular 是通过脏值检测的方式比对数据是否有变更，来决定是否更新视图。
2. 数据劫持：使用 Object.defineProperty 把这些 `vm.data` 属性全部转成 setter 和 getter 方法。

Vue 采用 <span style="color:red;font-weight:bold">数据劫持</span> 结合 <span style="color:red;font-weight:bold">发布者-订阅者模式</span> 的方式来实现数据的响应式，通过 Object.defineProperty 来劫持数据的 setter 和 getter，在数据变动时发布消息给订阅者，订阅者收到消息后进行相应的处理。

要实现 MVVM 的双向绑定，就必须要实现以下几点：

1. <span style="color:red;font-weight:bold">Compile</span>：**指令解析系统**，对每个元素节点的指令进行扫描和解析，根据指令模板替换数据，以及绑定相应的更新函数

2. <span style="color:red;font-weight:bold">Observer</span>：**数据监听系统**，能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知订阅者

3. <span style="color:red;font-weight:bold">Dep+Watcher</span>：**发布订阅模型**，作为连接 Observer 和 Compile 的桥梁，能够订阅并收到每个属性变动的通知，执行指令绑定的相应回调函数，从而更新视图。

- **Dep 是发布订阅者模型中的发布者：**get 数据的时候，收集订阅者，触发 Watcher 的依赖收集；set 数据时发布更新，通知 Watcher 。一个 Dep 实例对应一个对象属性或一个被观察的对象，用来收集订阅者和在数据改变时，发布更新。

- **Watcher 是发布订阅者模型中的订阅者：**订阅的数据改变时执行相应的回调函数（更新视图或表达式的值）。一个 Watcher 可以更新视图，如 HTML 模板中用到的 `{{test}}`，也可以执行一个 `$watch` 监督的表达式的回调函数（Vue 实例中的 watch 项底层是调用的 `$watch` 实现的），还可以更新一个计算属性（即 Vue 实例中的 `computed` 项）。

```jsx | inline
import React from 'react';
import img from '../../assets/mvvm-in-vue.jpg';

export default () => <img alt="Vue 的 MVVM 实现流程图" src={img} width={640} />;
```

## Observer

> Observer 类用于附加到每个被观察的对象。一旦附加后，观察者会将目标对象的 Property 键转换成用于**收集依赖**以及**调度更新**的 getters 和 setters。

- Observer：附加至每个被观察对象的观察者类，一旦被添加，观察者会将目标对象进行响应式化
- observe：用于观察对象的方法，返回 Observer 类的实例对象

通过向 observe 方法传入需要双向绑定的数据对象。如果观察数据为数组类型，将会修改该该数据类型原型上 7 个原生数组方法，并遍历数组对数组每个成员进行观察，达到监听数组数据变化响应的效果。如果观察数据为对象类型，则使用 walk 方法遍历对象中每对键值，并触发 defineReactive 进行双向绑定。defineReactive 内部的 Object.defineProperty 的 getter 将会实例化一个订阅者类 Dep，并通过闭包的方式将实例对象 dep 用于收集以及缓存订阅者。而其 setter 将会通过 dep.notify 通知所有观察者，进行派发更新。

- getter：**正确地返回属性值**以及**收集依赖**
- setter：**正确地为属性设置新值**以及**触发相应的依赖**（不存在添加属性的情况，添加属性请用 Vue.set）

```js
function defineReactive(obj, key, val) {
  // 每个字段的 Dep 实例都被用于收集那些属于对应字段的依赖
  const dep = new Dep();

  const property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return;
  }

  const getter = property && property.get;
  const setter = property && property.set;
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key];
  }

  let childOb = !shallow && observe(val);

  Object.defineProperty(obj, key, {
    enumerble: true,
    configurable: true,
    get: function reactiveGetter() {
      // 如果原本对象拥有 getter 方法则执行
      const value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        // 进行依赖收集
        dep.depend();
        if (childOb) {
          // 子对象进行依赖收集
          childOb.dep.depend();
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value;
    },
    set: function reactiveSetter() {
      const value = getter ? getter.call(obj) : val;

      if (newVal === value || (newVal !== newVal && value !== value)) {
        return;
      }

      if (getter && !setter) return;
      if (setter) {
        // 如果原本对象拥有 setter 方法则执行 setter
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      // 新的值需要重新进行 observe，报纸数据响应式
      childOb = !shallow && observe(newVal);
      // dep 对象通知所有的观察者
      dep.notify();
    },
  });
}
```

关于双向数据绑定以及 Dep、Watcher 实现参考[《从源码角度再看数据绑定》](https://github.com/answershuto/learnVue/blob/master/docs/%E4%BB%8E%E6%BA%90%E7%A0%81%E8%A7%92%E5%BA%A6%E5%86%8D%E7%9C%8B%E6%95%B0%E6%8D%AE%E7%BB%91%E5%AE%9A.MarkDown)

### 不足

使用 Object.defineProperty 定义响应式的数据对象的访问器属性 getter 和 setter 进行数据劫持时存在以下问题。

1. 无法监控对象的增删。

例如 `data = { foo: 'bar' }`，如果我们设置 `data.test = 'test'`，Observer 是无法监控到的，因为在 observe 的时候（初始化 Vue 构造函数的配置对象时），会遍历已有的每个属性（比如 `foo`），并添加 getter 和 setter，而后面设置的 test 属性并没有设置 getter 和 setter 的机会，因而无法监控变化。同样地，删除对象属性时候，getter 和 setter 会跟着属性一起被删除，拦截不到变化。

2. 数组的修改

同样地，数组类型作为最常用的引用数据类型之一，使用 push、pop、shift、unshift、splice 等方法操作数组元素时，数组的 getter 和 setter 同样无法监控到变化。Vue 通过重写 Array 默认方法的方式，在调用这些方法的时候发布更新消息，一般无需关注，但是对于如下两种情况。

- 当利用索引直接设置某项数组元素时：`vm.items[index] = newValue`
- 当你修改数组长度时：`vm.items.length = newLength`

对于这两种情况，可以使用 `vm.$set` / `Vue.set` 和 `vm.items.splice(newLength)` 解决，具体参考[官方说明](https://cn.vuejs.org/v2/guide/list.html#%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9)。

## 订阅者 Dep

订阅者 Dep 类，它的主要作用是用于存放 Watcher 观察者对象。主要实现了两件事情：

1. 用 addSub 方法可以在目前 Dep 对象中增加一个 Watcher 的订阅操作
2. 用 notify 方法通知目前 Dep 对象的 subs 中的所有 Watcher 对象触发更新操作

```js
class Dep {
  constructor() {
    /* 用来存放Watcher对象的数组 */
    this.subs = [];
  }

  /* 在subs中添加一个Watcher对象 */
  addSub(sub) {
    this.subs.push(sub);
  }

  /* 通知所有Watcher对象更新视图 */
  notify() {
    this.subs.forEach((sub) => {
      sub.update();
    });
  }
}
```

Dep.target 相当于全局的 Watcher，因为同一时间只有一个 Watcher 被计算。这个静态属性表明了 Vue 当前计算的 Watcher。

## 观察者 Watcher

Watcher 的四个使用场景：

- 第一种：观察模版中的数据
- 第二种：观察创建 Vue 实例时 watch 选项中的数据
- 第三种：观察创建 Vue 实例时 computed 选项里的数据所以来的数据
- 第四种：调用 `$watch` API 观察的数据或表达式

Watcher 只有在这四种场景中，Watcher 才会收集依赖，更新模版或表达式，否则，数据变更后无法通知依赖这个数据的模版或表达式：

所以在解决数据改变，模版或表达式没有改变的问题时，可以这么做：

首先仔细看看数据是否在上述四种应用场景中，以便确认数据已经收集依赖；其次查看改变数据的方式，确定这种方式会使数据的改变被拦截。

Watcher 对象通过调用 updateComponent 方法达到更新视图的目的。其实 Watcher 并不实时更新视图，在实例化 Vue 构造函数时默认会将 Watcher 对象存在一个队列中，在下个 Tick 时更新异步更新视图，完成了性能优化。

## 依赖收集

- 依赖收集就是订阅数据变化的 watcher 的收集
- 依赖收集的目的是为了当这些响应式数据发生变化时，触发它们的 setter 的时候，能知道应该通知哪些订阅者去做相应的逻辑处理

依赖收集的前提条件：

1. 触发 get 方法
2. 新建一个 Watcher 对象

Vue 构造函类中新建一个 Watcher 对象只需要 `new` 出来，这时候 `Dep.target` 已经指向这个 new 出来的 Watcher 对象来。而触发 `get` 方法也很简单，实际上只要把 render function 进行渲染，那么其中的依赖的对象都会被**读取**。

Watcher 原理通过对被观测目标的求值，触发数据的 `get` 拦截器函数从而收集依赖，至于被观测目标到底是表达式还是函数或者是其他形式的内容都不重要，重要的是被观测目标能否触发数据属性的 `get` 拦截器函数，很显然函数是具备这个能力的。

前面提到 defineReactive 对数据对象进行双向绑定，该函数内部通过闭包方式实例化一个 Dep 类的对象。在对象被「读」的时候，会触发 reactiveGetter 函数把当前的 Watcher 对象（存放在 Dep.target 中）收集到 Dep 类中。之后如果当该对象「写」的时候，则会触发 reactiveSetter 方法，通知 Dep 类调用 notify 来触发所有 Watcher 对象的 update 方法更新视图。

其实依赖收集的过程就是把 Watcher 实例存放到对应的 Dep 对象中去。get 方法可以让当前的 Watcher 对象（Dep.target）存放到它的 subs 中（addSub）方法，在数据变化时，set 会调用 Dep 对象的 notify 方法通知它内部所有 Watcher 对象进行视图更新。

构造函数 Vue 中的 new Watcher 生成当前实例的观察者实例，其中包括着更新视图的方法。当该 Vue 实例读取 data 对象中某个属性时，会把这个 watch 实例添加到该属性的 dep 对象放入 subs 中。当这个属性的值发生变化时，触发 dep 对象的 notify 方法，调用加入到 subs 中的 watcher 对象中的 update 方法，也就是触发视图 notify 方法，调用加入到 subs 中的 watcher 对象中的 update 方法，也就是触发视图更新的方法。

依赖收集发生在 render 阶段，在 Vue 实例进行 \$mount 的时候进行。在 render 过程中两个地方触发同一个数据的 getter，则将两个 watcher 都 addSub 到同一个 Dep 类对象中（Object.defineProperty 闭包中 Dep 类对象）。当数据修改时，该 Dep 类对象进行 notify 遍历通知 watcher 进行更新。

派发更新：

- 派发更新就是当数据发生改变后，通知所有订阅了这个数据变化的 watcher 执行 update
- 派发更新的过程中会把所有执行 update 的 watcher 推入到队列中，在 nextTick 后执行 flush

派发更新的核心流程是给对象赋值，触发 set 中派发更新函数。将所有 Watcher 都放入 nextTick 中进行更新，nextTick 回调中执行用户 watch 的回调函数并且渲染组件。

updateComponent 函数的执行会间接触发渲染函数（`vm.$options.render`）的执行，而渲染函数的执行则会触发数据属性的 `get` 拦截器函数，从而将依赖（观察者）收集，当数据变化时重新执行 `updateComponent` 函数，这就完成了重新渲染。

## 总结

```jsx | inline
import React from 'react';
import img from '../../assets/reactive.png';

export default () => <img alt="Reactive" src={img} width={640} />;
```

Vue 的响应式原理的核心就是观察这些数据的变化，当这些数据发生变化以后，能通知到对应的观察者以实现相关的逻辑。整个响应式原理最核心的实现就是 Dep 类，这个类实际上是连接数据与观察者的桥梁。

在 Vue 初始化阶段，会对配置对象中定义的不同属性做相关的处理，对于 data 和 props 而言，Vue 会通过 observe 和 defineReactive 等一系列的操作把 data 和 props 的每个属性变成响应式属性，同时它们内部会持有一个 Dep 实例对象，当我们访问这些数据的时候，就会触发 dep 的 depend 方法来收集依赖，这些依赖是当前正在计算的 Watcher，当前在计算的依赖也就是 Dep.target，作为 Subscriber 订阅者用于订阅这些数据的变化。当修改数据的时候，会触发 dep 的 notify 方法通知这些订阅者执行 update 的逻辑。

对于 computed 计算属性而言，实际上会在内部创建一个 computed watcher，每个 computed watcher 会持有一个 Dep 实例，当我们访问 computed 属性的时候，会调用 computed watcher 的 evaluate 方法，这时候会触发其持有的 depend 方法用于收集依赖，同时也会收集到正在计算的 watcher，然后把它计算的 watcher 作为 Dep 的 Subscriber 订阅者收集起来，收集起来的作用就是当计算属性所依赖的值发生变化以后，会触发 computed watcher 重新计算，如果重新计算过程中计算结果变了也会调用 dep 的 notify 方法，然后通知订阅 computed 的订阅者触发相关的更新。

对于 watch 而言，会创建一个 user watcher，可以理解为用户的 watcher，也就是用户自定义的一些 watch，它可以观察 data 的变化，也可以观察 computed 的变化。当这些数据发生变化以后，我们创建的这个 watcher 去观察某个数据或计算属性，让他们发生变化就会通知这个 Dep 然后调用这个 Dep 去遍历所有 user watchers，然后调用它们的 update 方法，然后求值发生新旧值变化就会触发 run 执行用户定义的回调函数（user callback）。

Vue 的渲染都是基于这个响应式系统的。在 Vue 的创建过程中，对于每个组件而言，它都会执行组件的 `$mount` 方法，`$mount` 执行过程中内部会创建唯一的 render watcher，该 render watcher 会在 render 也就是创建 VNode 过程中会访问到定义的 data、props 或者 computed 等等。render watcher 相当于订阅者，订阅了这些定义的数据的变化，一旦它们发生变化以后，就会触发例如 setter 里的 notify 或者 computed watcher 中的 dep.notify，从而触发 render watcher 的 update，然后执行其 run 方法，执行过程中最终会调用 updateComponent 的方法，该方法会重新进行视图渲染。

这就是整个 Vue 的响应式系统。

## 参考资料

- [梳理 Vue 双向绑定的实现原理](https://zhuanlan.zhihu.com/p/56725739)
- [Vue 双向绑定实现原理](https://www.cnblogs.com/kidney/p/6052935.html)
- [Vue 源码解读：Vue 数据响应式原理](https://www.jianshu.com/p/1032ecd62b3a)
- [一步步实现 VUE-MVVM 系列](https://juejin.im/post/5b4efdd86fb9a04fe0180af2)
- [结合 Vue 源码谈谈发布-订阅模式](https://juejin.im/post/5b29b5dff265da59615bff61)
