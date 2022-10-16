import {
    createRouter,
    createWebHashHistory,
    createWebHistory,
} from "vue-router";
import Home from "../views/Home.vue";
import Data from "../views/Data.vue";
import User from "../views/User.vue";
import Login from "../views/Login.vue";
import Detail from "../views/Detail.vue";
import Account from "../views/Account.vue";
import About from "../views/About.vue";
// createRouter 创建路由实例
const router = createRouter({
    history: createWebHistory(), // hash 模式：createWebHashHistory，history 模式：createWebHistory
    routes: [
        {
            path: "/",
            redirect: "/home",
        },
        {
            path: "/home",
            component: Home,
            meta: {
                title: "账单",
            },
        },
        {
            path: "/data",
            component: Data,
            meta: {
                title: "详细数据",
            },
        },
        {
            path: "/user",
            component: User,
            meta: {
                title: "个人信息",
            },
        },
        {
            path: "/login",
            component: Login,
            meta: {
                title: "登录/注册",
            },
        },
        {
            path: "/detail",
            component: Detail,
            meta: {
                title: "账单详情",
            },
        },
        {
            path: "/account",
            component: Account,
            meta: {
                title: "账户安全",
            },
        },
        {
            path: "/about",
            component: About,
            meta: {
                title: "相关介绍",
            },
        },
    ],
});

// "/login",
const whiteList = [
    "/",
    "/home",
    "/data",
    "/user",
    "/detail",
    "/account",
    "/about",
];

router.beforeEach((to, from, next) => {
    // 判断token是否存在
    if (!window.localStorage.getItem("token")) {
        if (whiteList.indexOf(to.path) > -1) {
            next("/login");
        } else {
            next();
        }
    } else {
        if (to.path === "/login") {
            next("/");
        } else {
            next();
        }
    }
    if (to.meta.title) {
        document.title = to.meta.title;
    }
});

// 抛出路由实例, 在 main.js 中引用
export default router;
