<template>
    <Header :title="type == 'login' ? '登录' : '注册'"></Header>
    <div class="auth">
        <img class="logo" src="//s.yezgea02.com/1606836859539/onpeice.png" alt="" />
        <!--登录表单-->
        <van-form class="form-wrap" @submit="onSubmit" v-if="type == 'login'">
            <div class="form">
                <van-field clearable v-model="username" name="username" label="登录账号" placeholder="请输入账号"
                    :rules="[{ required: true, message: '请填写账户' }]" />
                <van-field clearable v-model="password" type="password" name="password" label="登录密码" placeholder="请输入密码"
                    :rules="[{ required: true, message: '请填写密码' }]" />
            </div>
            <div style="margin: 16px 0;">
                <van-button round block type="primary" native-type="submit">
                    登录
                </van-button>
                <!--代码 3-->
                <p @click="chanegType('register')" class="change-btn">
                    没有账号，前往注册
                </p>
            </div>
        </van-form>
        <!--注册表单-->
        <van-form class="form-wrap" @submit="onSubmit" v-if="type == 'register'">
            <div class="form">
                <van-field clearable v-model="username" name="username" label="注册账号" placeholder="请输入账号"
                    :rules="[{ required: true, message: '请填写账号' }]" />
                <van-field clearable v-model="password" type="password" name="password" label="注册密码" placeholder="请输入密码"
                    :rules="[{ required: true, message: '请填写密码' }]" />
                <van-field center clearable label="验证码" placeholder="输入验证码" v-model="verify">
                    <template #button>
                        <VerifyImage ref="verifyRef" />
                    </template>
                </van-field>
            </div>
            <div style="margin: 16px 0;">
                <van-button round block type="primary" :loading="loading" native-type="submit">
                    注册
                </van-button>
                <!--代码 5-->
                <p @click="chanegType('login')" class="change-btn">登录已有账号</p>
            </div>
        </van-form>
    </div>
</template>

<script>
import Header from '../components/Header.vue'
import VerifyImage from '../components/VerifyImage.vue'
import { reactive, toRefs, ref } from "vue";
import axios from "../utils/axios";
import { Toast } from "vant";
export default {
    name: 'Login',
    components: {
        Header: Header,
        VerifyImage: VerifyImage
    },
    setup() {
        const verifyRef = ref(null)
        const state = reactive({
            username: "",
            password: "",
            type: "login", // 登录注册模式切换参数
            verify: '', // 验证码输入框输入的内容
            imgCode: '', // 生成的验证图片内的文字
            loading: false, // 点击注册时，让按钮处于加载状态
        });
        // 提交登录 or 注册表单
        const onSubmit = async (values) => {
            try {
                if (state.type == "login") {
                    const { data } = await axios.post("/user/login", {
                        username: state.username,
                        password: state.password,
                    });
                    localStorage.setItem("token", data.token);
                    Toast.success("登录成功")
                    window.location.href = "/";
                } else {
                    state.imgCode = verifyRef.value.imgCode || "";
                    if (
                        verifyRef.value.imgCode.toLowerCase() !=
                        state.verify.toLowerCase()
                    ) {
                        // console.log("verifyRef.value.imgCode", verifyRef.value.imgCode);
                        Toast.fail("验证码错误");
                        return;
                    }
                    state.loading = true;
                    const { data } = await axios.post("/user/register", {
                        username: state.username,
                        password: state.password,
                    });
                    Toast.success("注册成功,跳转到登录页面");
                    state.username = '';
                    state.password = '';
                    state.loading = false;
                    setTimeout(() => {
                        state.type = "login";
                    }, 2000)
                }
            } catch (error) {
                state.loading = false;
            }
        };
        // 切换登录和注册两种模式
        const chanegType = (type) => {
            state.type = type;
            state.username = ''
            state.password = ''
            state.verify = ''
        };
        return {
            verifyRef,
            ...toRefs(state),
            onSubmit,
            chanegType,
        };
    }
}
</script>

<style lang='less' scoped>
@import url('../assets/css/custom.less');

.auth {
    height: calc(~"(100% - 46px)");
    padding: 30px 20px 0 20px;
    background: @primary-bg;

    .logo {
        width: 150px;
        display: block;
        margin: 0 auto;
        margin-bottom: 30px;
    }

    .form-wrap {
        .form {
            border-radius: 10px;
            overflow: hidden;

            .van-cell:first-child {
                // padding-top: 20px;
            }

            .van-cell:last-child {
                // padding-bottom: 20px;
            }
        }
    }

    .change-btn {
        text-align: center;
        margin: 10px 0;
        color: @link-color;
        font-size: 14px;
    }
}
</style>