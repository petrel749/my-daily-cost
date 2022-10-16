<template>
    <div class="home">
        <div class="header">
            <div class="type-wrap" @click="toggle">
                <!--  -->
                <span class="title">{{ currentSelect.name || '全部类型'}}</span>
                <i class="iconfont leixing" />
            </div>
            <div class="data-wrap">
                <span class="time" @click="monthToggle"> {{ currentTime }} <i class="iconfont sort-down" /></span>
                <span class="expense">总支出 ¥{{ totalExpense }}</span>
                <span class="income">总收入 ¥{{ totalIncome }}</span>
            </div>
        </div>
        <div class="content-wrap">
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
                    <BillCard v-for="item in list" :bill="item" :key="item" />
                </van-list>
            </van-pull-refresh>
        </div>
        <div class="add" @click="addToggle">
            <van-icon name="records" />
        </div>
        <!-- <BillList :currentSelect='currentSelect' :currentTime='currentTime' ref='billListRef' /> -->
        <TypePop ref="popRef" @select="select" />
        <MonthPop ref="monthPopRef" @select="selectMonth" />
        <AddPop ref="addPopRef" @refresh="onRefresh" />
    </div>
</template>

<script>

import { reactive, ref, toRefs, onMounted } from "vue";
import TypePop from '../components/TypePop.vue';
import MonthPop from '../components/MonthPop.vue';
// import BillList from "../components/bill/BillList.vue";
import BillCard from '../components/bill/BillCard.vue'
import axios from '../utils/axios'
import dayjs from 'dayjs'
import AddPop from '../components/bill/AddPop.vue'
import { typeMap } from '../utils/index'
export default {
    name: "Home",
    components: {
        TypePop: TypePop,
        MonthPop: MonthPop,
        BillCard: BillCard,
        AddPop: AddPop
    },
    setup() {
        // 声明 ref，通过 popRef 我们可以拿到 PopType 组件内的属性和方法，在之前的实验中介绍过。
        const popRef = ref(null);
        const monthPopRef = ref(null)
        const addPopRef = ref(null)

        // const billListRef = ref(null)
        const state = reactive({
            totalExpense: 0,
            totalIncome: 0,
            currentSelect: {},
            currentTime: dayjs().format('YYYY-MM'),
            page: 1, // 列表分页。
            totalPage: 0, // 总页数。
            list: [], // 列表数据。
            loading: false,
            finished: false,
            refreshing: false,
        })

        const toggle = () => {
            // PopTye 组件的 toggle 方法在 popRef.value 内可以找到，所以在此调用 popRef.value.toggle 方法，可以让弹窗的 show 属性变为 true，让弹窗从底部弹出。
            popRef.value.toggle();
        }

        const monthToggle = () => {
            monthPopRef.value.toggle()
        }

        // 添加账单弹窗开关
        const addToggle = () => {
            addPopRef.value.toggle()
        }


        // 筛选类型
        // 这个方法将传入 PopType 组件，组件内部已经声明了 emit 触发下面的 select，并且附带了类型数据 item，所以我们在这里可以拿到属性，将其显示到头部。
        const select = (item) => {
            state.currentSelect = item
            // console.log('父组件S' + state.currentSelect.id)
            onRefresh()
        }

        const selectMonth = (item) => {
            state.currentTime = item
            // console.log('父组件T' + state.currentTime)
            onRefresh()
        }

        // 获取账单列表方法。
        const getBillList = async () => {
            // 请求列表接口。
            const { data } = await axios.get(`/bill/list?date=${state.currentTime}&type_id=${state.currentSelect.id || 'all'}&page=${state.page}&page_size=5`)
            data.list.map((el) => {
                el.bills.map((el2) => {
                    el2.type_name = typeMap[el2.type_id].name
                })
            })
            // 如果 refreshing 为 true，代表下拉刷新了，需要重置 list = []。
            if (state.refreshing) {
                state.list = []
                state.refreshing = false
            }
            state.loading = false
            // 通过 concat 将数据拼接在旧的 list 后面。
            state.list = state.list.concat(data.list)
            state.totalExpense = data.totalExpense.toFixed(2)
            state.totalIncome = data.totalIncome.toFixed(2)
            state.totalPage = data.totalPage
            // 如果当前页 page 大于等于总页数 totalPage，则代表数据已经请求完，将 finished 设置为 true。
            if (state.page >= state.totalPage) state.finished = true
        }

        // van-list 加载方法。
        const onLoad = () => {
            // 当不是下拉刷新且当前页 page 小于总页数 totalPage，需要加载下一页的数据，所以这里
            if (!state.refreshing && state.page < state.totalPage) {
                state.page = state.page + 1
            }
            getBillList()
        }

        // van-pull-refresh 刷新方法。
        const onRefresh = () => {

            // 清空列表数据。
            state.finished = false;
            // 页数重置。
            state.page = 1
            // 重新加载数据。
            // 将 loading 设置为 true，表示处于加载状态。
            state.refreshing = true
            state.loading = true;
            onLoad()
        }

        return {
            ...toRefs(state),
            popRef,
            monthPopRef,
            addPopRef,
            toggle,
            monthToggle,
            addToggle,
            select,
            selectMonth,
            onRefresh,
            onLoad
        }
    }
};
</script>
<style lang='less' scoped>
@import url('../assets/css/custom.less');

.home {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding-top: 80px;

    .header {
        position: fixed;
        top: 0;
        left: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        height: 80px;
        background-color: @primary;
        color: #fff;
        font-size: 14px;
        padding: 20px 20px;
        z-index: 100;

        .type-wrap {
            background-color: #50ca84;
            display: inline-block;
            padding: 6px;
            border-radius: 4px;
            position: relative;
            align-self: baseline;

            .title {
                margin-right: 22px;
            }

            .title::after {
                content: '';
                position: absolute;
                top: 10px;
                bottom: 9px;
                right: 32px;
                width: 1px;
                background-color: #e9e9e9;
            }
        }

        .data-wrap {
            margin-top: 10px;
            font-size: 13px;

            .time {
                margin-right: 12px;

                .sort-down {
                    font-size: 12px;
                }
            }

            .expense {
                margin-right: 10px;
            }
        }
    }

    .content-wrap {
        height: calc(~"(100% - 50px)");
        overflow: hidden;
        overflow-y: scroll;
        background-color: #f5f5f5;
        padding: 10px;
        // padding-bottom: 50px;
    }

    .content-wrap {
        height: calc(~"(100% - 50px)");
        overflow: hidden;
        overflow-y: scroll;
        background-color: #f5f5f5;
        padding: 10px;
        // padding-bottom: 50px;
    }

    .add {
        position: fixed;
        bottom: 100px;
        right: 30px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 1px solid #e9e9e9;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
        background-color: #fff;
        box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
        color: @primary;
    }
}
</style>