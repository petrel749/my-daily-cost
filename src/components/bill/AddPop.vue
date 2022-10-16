<!-- :style="{ height: '60%' }" -->
<template>
    <van-popup v-model:show="show" position="bottom" round>
        <div class="add-wrap">
            <header class="header">
                <span class="close" @click="toggle">
                    <van-icon name="cross" />
                </span>
                <van-button class="add-btn" type="primary" size="small" @click="addBill">
                    确定
                </van-button>
            </header>
            <div class="filter">
                <div class="type">
                    <span @click="changeType('expense')" :class="{ expense: true, active: payType == 'expense' }">
                        支出
                    </span>
                    <span @click="changeType('income')" :class="{ income: true, active: payType == 'income' }">
                        收入
                    </span>
                </div>
                <div @click="showDay = true" class="time">
                    {{ $filters.transDay(date) }}
                    <i class="iconfont sort-down" />
                </div>
            </div>
            <div class="money">
                <span class="sufix">¥</span>
                <span class="amount animation">{{ amount }}</span>
            </div>
            <!-- 种类列表 start -->
            <div class="type-warp">
                <div class="type-body" v-if="payType == 'expense'">
                    <div class="type-item" v-for="item in expense" :key="item.id" @click="choseType(item)">
                        <span :class="{'iconfont-wrap': true, 'expense': true, active: currentType.id == item.id}">
                            <i class="iconfont" :class="typeMap[item.id].icon" />
                        </span>
                        <span>{{ item.name }}</span>
                    </div>
                </div>
                <div class="type-body" v-else>
                    <div class="type-item" v-for="item in income" :key="item.id" @click="choseType(item)">
                        <span :class="{'iconfont-wrap': true, 'income': true, active: currentType.id == item.id}">
                            <i class="iconfont" :class="typeMap[item.id].icon" />
                        </span>
                        <span>{{ item.name }}</span>
                    </div>
                </div>
            </div>
            <!-- 种类列表 end -->
            <div class="remark" v-if="remark" @click="remarkShow = true">
                {{ remark }}
            </div>
            <div class="remark" v-else @click="remarkShow = true">添加备注</div>
            <van-number-keyboard :show="true" extra-key="." @delete="remove" @input="inputChange" />
        </div>
        <van-dialog v-model:show="remarkShow" title="备注" show-cancel-button>
            <van-field v-model="remark" rows="2" autosize type="textarea" maxlength="10" placeholder="请输入备注"
                show-word-limit />
        </van-dialog>
        <!-- :style="{ height: '46%' }" -->
        <van-popup v-model:show="showDay" position="bottom" round>
            <van-datetime-picker v-model="date" type="date" title="选择时间" @confirm="choseDay"
                @cancel="showDay = false" />
        </van-popup>
    </van-popup>
</template>
<script>
import { typeMap } from '../../utils/index'
import axios from '../../utils/axios'
import dayjs from 'dayjs'
import { reactive, toRefs, onMounted, ref, toRaw } from "vue";
import { Toast } from "vant";
import { useStore } from "vuex"
export default {
    props: {
        refresh: Function,
        detail: {
            type: Object,
            default: {}
        }
    },
    setup(props, ctx) {
        const store = useStore()
        const id = props.detail && props.detail.id // 外部传进来的账单详情 id
        const remarkShow = ref(false)
        const state = reactive({
            show: false, // 弹窗显示隐藏变量
            showDay: false, // 日期选择
            expense: [], // 支出类型数组
            income: [], // 收入类型数组
            typeMap: typeMap, // 类型 key-value 键值对
            payType: id ? (props.detail.pay_type == 1 ? 'expense' : 'income') : 'expense', // 支出或收入类型
            date: id ? dayjs(Number(props.detail.date)).$d : new Date(), // 日期
            amount: id ? props.detail.amount : '', // 账单价格
            currentType: id ? {
                id: props.detail.type_id,
                name: props.detail.type_name
            } : {}, // 当前选择的类型对象
            remark: id ? props.detail.remark : ''
        });
        // 初始化，请求消费类型列表
        onMounted(async () => {
            // const { data: { list } } = await axios.get('/type/list')
            // console.log(list)
            await store.dispatch('getTypeListAction')
            const list = toRaw(store.state.list)
            state.expense = list.filter(i => i.type == 1)
            state.income = list.filter(i => i.type == 2)
            // 没有 id 的情况下，说明是新建账单，给一个默认的消费类型。
            if (!id) {
                state.currentType = state.expense[0]
            }

        })
        /* onMounted(async () => {
            const { data: { list } } = await axios.get('/type/list')
            // console.log(list)
            state.expense = list.filter(i => i.type == 1)
            state.income = list.filter(i => i.type == 2)
            // 没有 id 的情况下，说明是新建账单，给一个默认的消费类型。
            if (!id) {
                state.currentType = state.expense[0]
            }

        }) */
        // 选择花销类型
        const choseType = (item) => {
            state.currentType = item
        }

        // 显示隐藏弹窗方法
        const toggle = () => {
            state.show = !state.show;
        };
        // 切换收入还是支出
        const changeType = (type) => {
            state.payType = type
            state.currentType = state[type][0] // 切换账单类型的时候，默认选中当前类型的第一项为当前项
        }

        // 选择日期
        const choseDay = (value) => {
            state.date = value
            state.showDay = false
        }

        // 删除输入框内容
        const remove = () => {
            // 通过 slice 过滤处字符串 0 到 字符串长度 - 1 的值，也就是除去了最后一个值
            state.amount = state.amount.slice(0, state.amount.length - 1)
        }

        // 监听输入框改变值
        const inputChange = (value) => {
            // 第一位输入点，变0.
            if (state.amount == '') {
                if (value == '.') {
                    state.amount = '0.'
                    return
                }
            }
            // 头两位不能输入0+数字
            if (state.amount[0] == '0' && state.amount.length == 1) {
                if (value != '.') return
            }
            // 当输入的值为 '.' 且 已经存在 '.'，则不让其继续字符串相加。
            if (value == '.') {
                if (value == '.' && state.amount.includes('.')) return
            }

            // 小数点后保留两位，当超过两位时，不让其字符串继续相加。
            if (value != '.' && state.amount.includes('.') && state.amount && state.amount.split('.')[1].length >= 2) return
            state.amount += value
        }
        // 添加账单方法
        const addBill = async () => {
            const reg = /(^[1-9](\d+)?(\.\d{1,2})?$)|(^0$)|(^\d\.\d{1,2}$)/;
            if (!state.amount) {
                Toast.fail('请输入具体金额')
                return
            }
            if (reg.test(state.amount) === false) {
                Toast.fail('请输入正确格式')
                return
            }
            const params = {
                amount: Number(state.amount).toFixed(2), // 金额
                type_id: state.currentType.id, // 当前消费类型 id
                type_name: state.currentType.name, // 当前消费类型 name
                date: dayjs(state.date).unix() * 1000, // 日期
                pay_type: state.payType == 'expense' ? 1 : 2, // 支出或收入
                remark: state.remark || ''
            }
            if (id) {
                params.id = id
                const result = await axios.post('/bill/update', params)
                state.show = false
                Toast.success('修改成功')
                ctx.emit('refresh')
            }
            else {
                const result = await axios.post('/bill/add', params)
                // 调完接口之后清空数据
                state.amount = ''
                state.payType = 'expense'
                state.currentType = state.expense[0]
                state.show = false
                state.date = new Date()
                state.remark = ''
                Toast.success('添加成功')
                // 并且刷新 Home 的列表数据，这里需要外部父组件传入
                // <PopAdd ref="popAddRef" @refresh="onRefresh" />
                ctx.emit('refresh')
            }
        }

        return {
            remarkShow,
            ...toRefs(state),
            toggle,
            changeType,
            choseDay,
            choseType,
            remove,
            inputChange,
            addBill
        };
    },
};
</script>

<style lang="less" scoped>
@import url('../../assets/css/custom.less');

.add-wrap {
    padding-top: 12px;

    .header {
        display: flex;
        justify-content: space-between;
        padding: 0 24px;

        .van-icon-cross {
            font-size: 20px;
            color: @color-text-secondary;
        }

        .close {
            display: flex;
            align-items: center;
        }

        .add-btn {
            padding: 0 12px;
            background-color: @primary;
            border-color: @primary;
        }
    }

    .filter {
        padding: 12px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .type {
            span {
                display: inline-block;
                background: #f5f5f5;
                color: @color-text-caption;
                padding: 4px 12px;
                font-size: 12px;
                border-radius: 24px;
                border: 1px solid #f5f5f5;
            }

            .expense {
                margin-right: 6px;

                &.active {
                    background-color: #eafbf6;
                    border-color: @primary;
                    color: @primary;
                }
            }

            .income {
                &.active {
                    background-color: #fbf8f0;
                    border-color: @text-warning;
                    color: @text-warning;
                }
            }
        }

        .time {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 4px 12px;
            background-color: #f0f0f0;
            border-radius: 20px;
            color: @color-text-base;

            .sort-down {
                font-size: 12px;
                margin-left: 5px;
            }
        }
    }

    .money {
        padding-bottom: 12px;
        border-bottom: 1px solid #e9e9e9;
        margin: 0 24px;

        .sufix {
            font-size: 36px;
            font-weight: bold;
            vertical-align: top;
        }

        .amount {
            font-size: 40px;
            padding-left: 10px;
        }
    }

    .animation::after {
        content: '';
        display: inline-block;
        margin-left: 5px;
        width: 2px;
        height: 28px;
        animation: blink 1s infinite steps(1, start);
    }

    @keyframes blink {
        0% {
            background-color: white;
        }

        50% {
            background-color: @color-text-secondary;
        }

        100% {
            background-color: white;
        }
    }

    .van-number-keyboard {
        position: unset;
    }

    .type-warp {
        display: flex;
        overflow-x: auto;
        margin: 0 24px;
        margin-bottom: 20px;

        * {
            touch-action: pan-x;
        }

        .type-body {
            display: flex;
            white-space: nowrap;

            .type-item {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 16px 12px 10px 12px;

                .iconfont-wrap {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: #f5f5f5;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    margin-bottom: 5px;

                    .iconfont {
                        color: @color-text-caption;
                        font-size: 20px;
                    }
                }

                .expense {
                    &.active {
                        background-color: @primary;

                        .iconfont {
                            color: #fff;
                        }
                    }
                }

                .income {
                    &.active {
                        background-color: @text-warning;

                        .iconfont {
                            color: #fff;
                        }
                    }
                }
            }
        }
    }

    .remark {
        padding: 0 24px;
        padding-bottom: 12px;
        color: #4b67e2;
    }
}
</style>