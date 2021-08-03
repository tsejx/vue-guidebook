<template>
  <div>
    <!-- 数组 -->
    <ul id="example-1">
      <li v-for="(item, index) of items" :key="item.message">
        {{ index }} - {{ item.message }}
      </li>
    </ul>
    <!-- 对象 -->
    <ul id="v-for-object" class="demo">
      <li v-for="(value, name) in object" v-bind:key="value">
        {{ name }} - {{ value }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'list-render',
  data () {
    return {
      items: [
        { message: 'Foo' },
        { message: 'Bar' }
      ],
      object: {
        title: 'How to do lists in Vue',
        author: 'Jane Doe',
        publishedAt: '2016-04-10'
      }
    }
  },
}
</script>