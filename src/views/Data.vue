<template>
    <div class="data">
        <div class="total">
            <div class="time" @click="monthToggle">
                <span>{{ currentMonth }}</span>
                <van-icon name="notes-o" />
            </div>
            <div class="title">共支出</div>
            <div class="expense">¥{{ total_expense || 0 }}</div>
            <div class="income-title">共支出</div>
            <div class="income">¥{{ total_income || 0 }}</div>
            <!-- <div class="income">共收入¥{{ total_income || 0 }}</div> -->
        </div>
        <div class="structure">
            <div class="head">
                <span class="title">收支构成</span>
                <div class="tab">
                    <span @click="changeTotalType('expense')" class="expense"
                        :class="{ active: totalType == 'expense' }">
                        支出
                    </span>
                    <span @click="changeTotalType('income')" class="income" :class="{ active: totalType == 'income' }">
                        收入
                    </span>
                </div>
            </div>
            <div class="content">
                <div class="item" v-for="item in totalType == 'expense' ? expense_data : income_data"
                    :key="item.type_id">
                    <div class="left">
                        <div class="type">
                            <span :class="{ expense: totalType == 'expense', income: totalType == 'income' }">
                                <i class="iconfont" :class="item.type_id ? typeMap[item.type_id].icon : 0" />
                            </span>
                            <span>{{ item.type_name }}</span>
                        </div>
                        <div class="progress">
                            {{ Number((item.number / Number(totalType == 'expense' ?
                            total_expense : total_income)) * 100).toFixed(2) }}%
                        </div>
                    </div>
                    <div class="right">
                        <div class="percent">
                            <van-progress
                                :percentage="Number((item.number / Number(totalType == 'expense' ? total_expense : total_income)) * 100)"
                                stroke-width="6px" :show-pivot="false" track-color="#ffffff" color="#39be77" />
                        </div>
                        <div class="money">¥{{ Number(item.number).toFixed(2) || 0 }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="proportion">
            <div class="head">
                <span class="title">收支构成</span>
                <div class="tab">
                    <span @click="changePieType('expense')" class="expense"
                        :class="{ active: pieType == 'expense' }">支出</span>
                    <span @click="changePieType('income')" class="income"
                        :class="{ active: pieType == 'income' }">收入</span>
                </div>
            </div>
            <div id="proportion"></div>
        </div>
        <MothPop ref="monthPopRef" @select="selectMonth" />
    </div>
</template>
<script>
import { ref, onMounted, onUnmounted, reactive, toRefs } from "vue";
import dayjs from "dayjs";
import * as echarts from 'echarts'
import axios from "../utils/axios";
import { typeMap } from '../utils/index'
import MothPop from "../components/MonthPop.vue"; // 月份弹窗组件
let proportionChart = null
export default {
    name: "Data",
    components: {
        MothPop,
    },
    setup() {
        const monthPopRef = ref(null);
        const state = reactive({
            currentMonth: dayjs().format("YYYY-MM"), // 当前月份，默认当前时间的月份
            total_expense: 0, // 当月总支出
            total_income: 0, // 当月总收入
            expense_data: [], // 支出数组
            income_data: [], // 收入数组
            totalType: 'expense', // 收支类型切换变量
            typeMap, // icon 对象
            pieType: 'expense',
        });

        onMounted(() => {
            getData();
            // 初始化
            proportionChart = echarts.init(document.getElementById('proportion'));

        });

        onUnmounted(() => {
            // 每次组件卸载的时候，需要释放图表实例。clear 只是将其清空不会释放。
            proportionChart.dispose()
        })
        // 获取当月数据接口
        const getData = async () => {
            const { data } = await axios.get(
                `/bill/data?date=${state.currentMonth}`
            );
            data.total_data.map((el) => {
                el.type_name = typeMap[el.type_id].name
            })
            // 总收支
            state.total_expense = data.total_expense;
            state.total_income = data.total_income;

            // 过滤支出和收入
            state.expense_data = data.total_data.filter(item => item.pay_type == 1).sort((a, b) => b.number - a.number) // 过滤出账单类型为支出的项
            state.income_data = data.total_data.filter(item => item.pay_type == 2).sort((a, b) => b.number - a.number) // 过滤出账单类型为收入的项
            // 绘制饼图
            setPieChart()
        };

        // 月份弹窗开关
        const monthToggle = () => {
            monthPopRef.value.toggle();
        };

        // 选择月份后的回调方法，拿到月份数据
        const selectMonth = (item) => {
            state.currentMonth = item;
            getData()
        };

        // 更改收入支出类型
        const changeTotalType = (type) => {
            state.totalType = type
        }

        // 切换饼图收支类型
        const changePieType = (type) => {
            state.pieType = type
            // 重绘饼图
            setPieChart()
        }

        // 绘制饼图方法
        const setPieChart = () => {

            // 根据 pieType 变量判断是支出还是收入
            const _data = state.pieType == 'expense' ? state.expense_data : state.income_data
            // 添加图表配置数据
            proportionChart.setOption({
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                },
                // 图例
                legend: {
                    data: _data.map(item => item.type_name)
                },
                series: [
                    {
                        name: '支出',
                        type: 'pie', // 图标类型
                        radius: '55%',
                        // 饼图数据
                        data: _data.map(item => {
                            return {
                                value: item.number,
                                name: item.type_name
                            }
                        }),
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            },
                            normal: {
                                color: function (colors) {
                                    var colorList = [
                                        '#fc8251',
                                        '#5470c6',
                                        '#91cd77',
                                        '#ef6567',
                                        '#f9c956',
                                        '#75bedc'
                                    ];
                                    return colorList[colors.dataIndex];
                                }
                            },
                        }
                        /* emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)',
                            },
 
                        }, */

                    }
                ]
            })

        }

        return {
            ...toRefs(state),
            monthPopRef,
            selectMonth,
            monthToggle,
            changeTotalType,
            changePieType,
        };
    },
};
</script>

<style lang='less' scoped>
@import url('../assets/css/custom.less');

.data {
    min-height: 100%;
    background-color: #f5f5f5;

    .total {
        background-color: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px 0;
        margin-bottom: 10px;

        .time {
            position: relative;
            width: 96px;
            padding: 6px;
            background-color: #f5f5f5;
            color: @color-text-base;
            border-radius: 4px;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;

            span:nth-of-type(1)::after {
                content: '';
                position: absolute;
                top: 9px;
                bottom: 8px;
                right: 28px;
                width: 1px;
                background-color: rgba(0, 0, 0, .5);
            }

            .van-icon-notes-o {
                font-size: 16px;
                color: @color-text-caption;
            }
        }

        .title {
            color: @primary;
            margin-bottom: 8px;
            font-size: 12px;
            font-weight: 500;
        }

        .expense {
            font-size: 24px;
            color: @primary;
            font-weight: 600;
            margin-bottom: 16px;
        }

        .income-title {
            color: @income;
            margin-bottom: 8px;
            font-size: 12px;
            font-weight: 500;
        }

        /* .income {
            color: @color-text-caption;
            font-weight: 500;
        } */
        .income {
            font-size: 24px;
            color: @income;
            font-weight: 600;
        }
    }

    .structure {
        padding: 0 16px;
        background-color: #fff;
        margin-bottom: 10px;

        .head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;

            .title {
                font-size: 18px;
                color: @color-text-base;
            }

            .tab {
                span {
                    display: inline-block;
                    width: 40px;
                    height: 24px;
                    background-color: #f5f5f5;
                    text-align: center;
                    line-height: 24px;
                    margin-left: 10px;
                    border-radius: 4px;
                }

                .expense {
                    &.active {
                        background-color: rgba(57, 190, 119, 0.2);
                        color: @primary;
                    }
                }

                .income {
                    &.active {
                        background-color: rgba(236, 190, 37, 0.2);
                        color: @text-warning;
                    }
                }
            }
        }

        .content {
            .item {
                display: flex;
                height: 50px;
                align-items: center;

                .left {
                    // flex: 4;
                    flex: 5;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-right: 10px;

                    .type {
                        display: flex;
                        align-items: center;

                        span:nth-of-type(1) {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            border-radius: 50%;
                            width: 30px;
                            height: 30px;
                            margin-right: 10px;
                            color: #fff;
                        }

                        .expense {
                            background-color: @primary;
                        }

                        .income {
                            background-color: @text-warning;
                        }
                    }
                }

                .right {
                    // flex: 8;
                    flex: 7;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    .percent {
                        width: 120px
                    }

                    .momey {
                        width: 100px;
                    }
                }
            }
        }
    }

    .proportion {
        background-color: #fff;
        padding: 12px;

        .head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;

            .title {
                font-size: 18px;
                color: @color-text-base;
            }

            .tab {
                span {
                    display: inline-block;
                    width: 40px;
                    height: 24px;
                    background-color: #f5f5f5;
                    text-align: center;
                    line-height: 24px;
                    margin-left: 10px;
                    border-radius: 4px;
                }

                .expense {
                    &.active {
                        background-color: rgba(57, 190, 119, 0.2);
                        color: @primary;
                    }
                }

                .income {
                    &.active {
                        background-color: rgba(236, 190, 37, 0.2);
                        color: @income;
                    }
                }
            }
        }

        #proportion {
            width: 100%;
            height: 400px;
        }
    }
}
</style>