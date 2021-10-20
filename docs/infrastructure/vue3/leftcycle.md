---
nav:
  title: 架构
  order: 2
group:
  title: Vue3 架构
  order: 1
title: 生命周期
order: 5
---

# 生命周期

Vue2 和 Vue3 的生命周期对比：

| Vue2 生命周期   | Vue3 生命周期     | 说明                          |
| :-------------- | :---------------- | :---------------------------- |
| `beforeCreate`  | `setup`           | 组件创建之前                  |
| `created`       | `setup`           | 组件创建完成                  |
| `beforeMount`   | `onBeforeMount`   | 组件挂载之前                  |
| `mounted`       | `onMounted`       | 组件挂载完成                  |
| `beforeUpdate`  | `onBeforeUpdate`  | 数据更新，虚拟 DOM 打补丁之前 |
| `updated`       | `onUpdated`       | 数据更新，虚拟 DOM 渲染完成   |
| `beforeDestory` | `onBeforeUnmount` | 组件销毁之前                  |
| `destoryed`     | `onUnmounted`     | 组件销毁后                    |
