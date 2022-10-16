<template>
    <van-popup v-model:show="show" position="bottom" round>
        <div class="pop">
            <div class="header van-hairline--bottom">
                请选择类型
                <van-icon name="cross" class="cross" @click="toggle" />
            </div>
            <div class="content">
                <div @click="choseType({ id: 0,name:'全部类型' })" :class="{ all: true, active: active == 0 }">全部类型</div>
                <!-- <div @click="choseType({ id: 'all' })" :class="{ all: true, active: active == '全部类型' }">全部类型</div> -->
                <div class="title">支出</div>
                <div class="expense-wrap">
                    <p @click="choseType(item)" :class="{active: active == item.id}" v-for="item in expense"
                        :key="item">{{ item.name }}</p>
                </div>
                <div class="title">收入</div>
                <div class="income-wrap">
                    <p @click="choseType(item)" :class="{active: active == item.id}" v-for="item in income" :key="item">
                        {{ item.name }}</p>
                </div>
            </div>
        </div>
    </van-popup>
</template>

<script>
import { onMounted, reactive, toRefs, computed, toRaw } from "vue";
import { useStore } from 'vuex';
import axios from "../utils/axios";
import { typeMap } from '../utils/index'
export default {
    props: {
        select: Function, // 外部传入的 select 方法，回去组件内选择的类型数据
    },
    setup(props, ctx) {
        const store = useStore()
        const state = reactive({
            active: "全部类型",
            show: false,
            expense: [],
            income: [],
        });
        // 请求标签接口放在弹窗内，这个弹窗可能会被复用，所以请求如果放在外面，会造成代码冗余。
        onMounted(async () => {
            // 请求标签列表数据，数据放在内部请求，如果放在外部传入的话，父组件每次都要写接口请求，会造成代码冗余
            // type=1 代表支出的标签类型，type=2 代表收入的标签类型
            // console.log(list)
            await store.dispatch('getTypeListAction')
            const list = toRaw(store.state.list)
            // console.log(JSON.parse(JSON.stringify(store.state.list)))
            state.expense = list.filter((i) => i.type == 1);
            state.income = list.filter((i) => i.type == 2);
        });
        /* onMounted(async () => {
            // 请求标签列表数据，数据放在内部请求，如果放在外部传入的话，父组件每次都要写接口请求，会造成代码冗余
            // type=1 代表支出的标签类型，type=2 代表收入的标签类型
            const {
                data: { list },
            } = await axios.get("/type/list");
            // console.log(list)
            store.dispatch('getTypeListAction')
            // state.newList = computed(() => store.state.list)
            // state.newList = JSON.parse(JSON.stringify(store.state.list))
            console.log('typePop onMounted')
            console.log(store.state.list)
            list.map((el) => {
                el.name = typeMap[el.id].name;
            });
            state.expense = list.filter((i) => i.type == 1);
            state.income = list.filter((i) => i.type == 2);
        }); */
        // 控制弹窗的展示和隐藏
        const toggle = () => {
            state.show = !state.show;
        };
        // 选择标签方法
        const choseType = (item) => {
            state.active = item.id;
            state.show = false;
            // 通过 emit 方法触发父组件传入的 select 方法，并将选择好的类型数据传回去
            ctx.emit("select", item);
        };

        return {
            ...toRefs(state),
            toggle,
            choseType,
        };
    },
};
</script>
  
<style lang="less" scoped>
@import url("../assets/css/custom.less");

.pop {
    position: relative;
    background-color: #f5f5f5;

    .header {
        position: sticky;
        top: 0;
        left: 0;
        z-index: 1000;
        width: 100%;
        height: 56px;
        text-align: center;
        font-size: 14px;
        line-height: 56px;
        color: @color-text-base;
        background-color: #fff;

        .cross {
            position: absolute;
            left: 10px;
            top: 50%;
            font-size: 20px;
            transform: translateY(-50%);
            color: @color-text-secondary;
        }
    }

    .content {
        padding: 20px;

        .all {
            display: inline-block;
            padding: 12px 20px;
            font-size: 16px;
            color: @color-text-base;
            background-color: #fff;
        }

        .title {
            color: @color-text-caption;
            margin: 10px 0;
            font-size: 14px;
        }

        .expense-wrap,
        .income-wrap {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;

            p {
                width: calc(~"(100% - 20px) / 3");
                text-align: center;
                padding: 12px 0;
                margin-bottom: 10px;
                background-color: #fff;
                font-size: 16px;
            }
        }

        .active {
            background-color: @primary !important;
            color: #fff;
        }
    }
}
</style>