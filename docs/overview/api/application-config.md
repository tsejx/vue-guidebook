---
nav:
  title: 基础
  order: 1
group:
  title: API
  order: 10
title: 应用配置
order: 1
---

# 应用配置

每个 Vue 应用都会暴露一个 config 对象，该对象包含此应用的配置设置：

```js
const app = createApp({});

console.log(app.config);
```

在挂载应用之前，你可以修改其 property，如下所示。

| 应用配置                | 说明                                                                                             |
| :---------------------- | :----------------------------------------------------------------------------------------------- |
| `errorHandler`          | 用于处理组件渲染方法和侦听器执行期间抛出的未捕获错误                                             |
| `warnHandler`           | 为 Vue 的运行时警告指定一个自定义处理函数                                                        |
| `globalProperties`      | 添加一个可以在应用的任何组件实例中访问的全局 property。组件的 property 在命名冲突具有优先权。    |
| `optionMergeStrategies` | 为自定义选项定义合并策略                                                                         |
| `performance`           | 在浏览器开发工具的 `performance` / `timeline` 面板中启用对组件初始化、编译、渲染和更新的性能追踪 |
| `compilerOptions`       | 配置运行时编译器的选项                                                                           |

**compilerOptions API**

| API               | 说明                                        |
| :---------------- | :------------------------------------------ |
| `isCustomElement` | 指定一个方法来识别 Vue 以外定义的自定义元素 |
| `whitespace`      | 移除/压缩模版元素之间空格的策略             |
| `delimiters`      | 设置用在模板内的文本插值的边界符            |
| `comments`        | 生产环境是否保留 HTML 注释                  |

## 参考资料

- [自定义选项合并策略](https://v3.cn.vuejs.org/guide/mixins.html#%E8%87%AA%E5%AE%9A%E4%B9%89%E9%80%89%E9%A1%B9%E5%90%88%E5%B9%B6%E7%AD%96%E7%95%A5)
