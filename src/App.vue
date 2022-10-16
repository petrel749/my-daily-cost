<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
  <!-- <HelloWorld msg="Hello Vue 3.0 + Vite" /> -->
  <router-view />
  <!-- <Home/> -->
  <ButtomNavbar v-if="isShow" />
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import { useRouter } from 'vue-router'
import ButtomNavbar from './components/ButtomNavbar.vue';
import { reactive, toRefs } from "vue";

export default {
  name: 'App',
  components: {
    ButtomNavbar
  },
  setup() {
    const state = reactive({
      // 代码2
      menu: ["/home", "/data", "/user"],
      isShow: false,
    });
    const router = useRouter();
    router.afterEach(() => {
      // menu 内的路径都是需要展示底部导航栏的
      state.isShow = state.menu.includes(router.currentRoute.value.path);
    });
    return {
      ...toRefs(state),
    };
  }
}
</script>
