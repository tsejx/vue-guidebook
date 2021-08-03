<template>
  <div>
    <!-- 文本插值 -->
    <div class="item">
      <div>文本插值：</div>
      <div>{{msg}}</div>
    </div>
    <!-- 原始 HTML -->
    <div class="item">
      <div>原始 HTML：</div>
      <div v-html="rawHtml"></div>
    </div>
    <!-- Attribute -->
    <div class="item">
      <div>Attribute：</div>
      <div v-bind:id="dynamicId">123</div>
      <button v-bind:disabled="isButtonDisabled">按钮</button>
    </div>
    <!-- JS 表达式 -->
    <div class="item">
      <div>JS 表达式：</div>
      <div>{{message.split('').reverse().join('')}}</div>
    </div>
    <!-- 参数 -->
    <div class="item">
      <div>参数：</div>
      <a v-bind:href="url">属性参数</a>
      <a v-on:click="doSomething">事件参数</a>
    </div>
    <!-- 动态参数 -->
    <div class="item">
      <div>动态参数：</div>
      <a v-bind:[attributeName]="url">动态属性名</a>
      <a v-on:[eventName]="doSomething">动态事件名</a>
    </div>
    <!-- 修饰符 -->
    <div class="item">
      <div>修饰符：</div>
      <form v-on:submit.prevent="onSubmit">
        <button type="submit">Submit</button>
      </form>
    </div>
    <!-- v-bind 缩写 -->
    <div class="item">
      <div>v-bind：</div>
      <a :href="url">链接</a>
    </div>
    <!-- v-on 缩写 -->
    <div class="item">
      <div>v-on：</div>
      <a @click="doSomething">点击</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'basic',
  data() {
    return {
      msg: 'Basic',
      rawHtml: '<span style="color:red">This should be red</span>',
      dynamicId: '123',
      isButtonDisabled: true,
      message: 'Hello world!',
      url: 'https://www.baidu.com/',
      attributeName: 'href',
      eventName: 'click'
    }
  },
  methods: {
    doSomething () {
      console.log('do something')
    },
    onSubmit () {
      console.log('提交表单')
    }
  }
}
</script>

<style scoped>
.item {
  display: flex;
  justify-content: center;
}
</style>