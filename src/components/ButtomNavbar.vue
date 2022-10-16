<template>
    <div>
        <van-tabbar v-model="active">
            <!--代码2-->
            <van-tabbar-item name="/home" icon="notes-o" @click="link('/home')">明细</van-tabbar-item>
            <van-tabbar-item name="/data" icon="bar-chart-o" @click="link('/data')">统计</van-tabbar-item>
            <van-tabbar-item name="/user" icon="user-o" @click="link('/user')">我的</van-tabbar-item>
        </van-tabbar>
    </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
export default {
    name: "ButtomNavbar",
    props: {
        msg: String,
    },
    setup() {
        const router = useRouter();
        const active = ref(0);

        const link = (path) => {
            router.push({ path });
        };

        router.afterEach(() => {
            active.value = router.currentRoute.value.path;
        });

        return {
            active,
            link,
        };
    },
};
</script>

<style lang="less">
@import url('../assets/css/custom.less');

.van-tabbar-item--active {
    color: @primary !important;
}
</style>
  