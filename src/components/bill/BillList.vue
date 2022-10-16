<template>
    <div class="content-wrap">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
            <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
                <BillCard v-for="item in list" :bill="item" :key="item" />
            </van-list>
        </van-pull-refresh>
    </div>
</template>

<script>
import axios from '../../utils/axios'
import dayjs from 'dayjs' // 日期插件，适用于 H5 
import BillCard from './BillCard.vue';
import { reactive, toRefs, ref, onMounted } from 'vue';
export default {
    components: {
        BillCard: BillCard
    },
    props: ['currentSelect', 'currentTime'],
    setup(props) {
        // const propsState = reactive(props)
        const { currentTime, currentSelect } = props
        const state = reactive(
            {

            }
        )

        // 获取账单列表方法。
        const getBillList = async () => {
            console.log(currentSelect)
            console.log(currentTime)
            // 请求列表接口。
            const { data } = await axios.get(`/bill/list?date=${currentTime}&type_id=${currentSelect.id || 'all'}&page=${state.page}&page_size=5`)
            // console.log(data)
            // 如果 refreshing 为 true，代表下拉刷新了，需要重置 list = []。
            if (state.refreshing) {
                state.list = []
                state.refreshing = false
            }
            state.loading = false
            // 通过 concat 将数据拼接在旧的 list 后面。
            state.list = state.list.concat(data.list)
            state.totalPage = data.totalPage
            // 如果当前页 page 大于等于总页数 totalPage，则代表数据已经请求完，将 finished 设置为 true。
            if (state.page >= state.totalPage) state.finished = true
        }
        /* const getBillList = async (currentTime,id) => {
            // 请求列表接口。
            const { data } = await axios.get(`/bill/list?date=${state.currentTime}&type_id=${state.currentSelect.id || 'all'}&page=${state.page}&page_size=5`)
            // 如果 refreshing 为 true，代表下拉刷新了，需要重置 list = []。
            if (state.refreshing) {
                state.list = []
                state.refreshing = false
            }
            state.loading = false
            // 通过 concat 将数据拼接在旧的 list 后面。
            state.list = state.list.concat(data.list)
            state.totalPage = data.totalPage
            // 如果当前页 page 大于等于总页数 totalPage，则代表数据已经请求完，将 finished 设置为 true。
            if (state.page >= state.totalPage) state.finished = true
        } */

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

        onMounted(() => {
            console.log(currentSelect)
            console.log(currentTime)
            console.log('onMounted方法')
        })


        return {
            ...toRefs(state),

        }
    }
}
</script>

<style lang="less" scoped>
.content-wrap {
    height: calc(~"(100% - 50px)");
    overflow: hidden;
    overflow-y: scroll;
    background-color: #f5f5f5;
    padding: 10px;
    // padding-bottom: 50px;
}
</style>