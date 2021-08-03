<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <Home msg="Hello world!"/>
    <Basic />
    <ComputedWatch />
    <ConditionalRender />
    <ListRender />
  </div>
</template>

<script>
import Home from './components/Home.vue'
import Basic from './components/Basic'
import ComputedWatch from './components/ComputedWatch'
import ConditionalRender from './components/ConditionalRender'
import ListRender from './components/ListRender'

export default {
  name: 'App',
  components: {
    Home,
    Basic,
    ComputedWatch,
    ConditionalRender,
    ListRender,
  },
  methods: {
    clickTo (path) {
      this.$router.push({ path })
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
