<template>
    <div class="about">
        <Header title="相关介绍" />
        <!-- content-position="left" -->
        <van-divider :style="{ color: '#39be77', borderColor: '#39be77', padding: '0 16px' }">
            项目介绍
        </van-divider>
        <div class="content">
            <p>记账本项目</p>
            <p>
                主要功能用于使用者可以在手机端登录账号，然后方便的进行记账等功能。
            </p>
            <p>
                技术包括 Vite 构建项目、flexible 移动端适配、Vant 3.x
                组件库、Vue-Router 实现路由匹配和路由守卫、Vuex 状态管理、Echarts 5.x 图表插件等等。
            </p>
            <p>项目部署到云服务器</p>
        </div>
    </div>
</template>
  
<script>
import Header from "../components/Header.vue";
export default {
    name: "About",
    components: {
        Header,
    },
};
</script>
  
<style lang="less">
.about {
    .content {
        padding: 0 16px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.5);
        line-height: 24px;

        p {
            margin-bottom: 10px;
        }
    }
}
</style>