<template>
  <div>
    <div id="example">
      <p>Original message: "{{ message }}"</p>
      <p>Computed reversed message: "{{ reversedMessage }}"</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'computed-watch',
  data () {
    return {
      message: 'Hello',
    }
  },

  computed: {
    // 计算属性的 getter
    // vs 方法：会缓存，只有依赖变更才会执行
    // vs 侦听属性
    reversedMessage: function () {
      // `this` 指向 vm 实例
      return this.message.split('').reverse().join('')
    }
  },
}
</script>