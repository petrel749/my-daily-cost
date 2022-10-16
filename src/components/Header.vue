<template>
    <div>
        <div class="block"></div>
        <!--代码2-->
        <van-nav-bar class="header" @click-left="back" :title="title" left-text="返回" left-arrow>
            <template #right>
                <!--代码3-->
                <i class="iconfont more" />
            </template>
        </van-nav-bar>
    </div>
</template>

<script>
import { useRouter } from "vue-router";
export default {
    name: "Header",
    // 代码4
    props: {
        title: {
            type: String,
            default: "",
        },
    },
    setup() {
        const router = useRouter();
        // 代码5
        // 返回方法
        const back = () => {
            router.back();
        };

        return {
            back,
        };
    },
};
</script>
  
<style lang="less" scoped>
.block {
    width: 100%;
    height: 46px;
}

.header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;

    .more {
        font-size: 20px;
    }
}
</style>