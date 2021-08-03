<template>
  <div>
    <!-- 基本例子 -->
    <div>
      <h1 v-if="awesome">Vue is awesome!</h1>
      <h1 v-else>Oh no 😢</h1>
    </div>
    <!-- 在 template 上使用 v-if -->
    <div>
      <template v-if="ok">
        <h1>Title</h1>
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
      </template>
    </div>
    <!-- v-els-if -->
    <div>
      <div v-if="type === 'A'">
        A
      </div>
      <div v-else-if="type === 'B'">
        B
      </div>
      <div v-else-if="type === 'C'">
        C
      </div>
    </div>
    <!-- key 管理可复用元素 -->
    <template v-if="loginType === 'username'">
      <label>Username</label>
      <input placeholder="Enter your username">
    </template>
    <template v-else>
      <label>Email</label>
      <input placeholder="Enter your email address">
    </template>
    <!-- v-show -->
    <h1 v-show="ok">Hello!</h1>
  </div>
</template>

<script>
export default {
  name: 'conditional-render',
  data () {
    return {
      awesome: true,
      ok: false,
      type: 'B',
      loginType: 'username'
    }
  },
}
</script>