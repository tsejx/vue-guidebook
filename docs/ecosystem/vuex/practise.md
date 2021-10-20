# 最佳实践

```js
import { computed } from 'vue';
import { useStore } from 'vuex';

const module = 'myModule';

export default {
  setup() {
    const store = useStore();

    return {
      // getter
      one: computed(() => store.getters[`${module}/myStateVariable`]),
      // state
      two: computed(() => store.state[module].myStateVariable),
    };
  },
};
```
