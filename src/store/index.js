import { createStore } from "vuex";
import axios from "../utils/axios";
import { typeMap } from "../utils/index";
const store = createStore({
    state() {
        return {
            list: [],
        };
    },
    mutations: {
        getTypeList(state, payload) {
            state.list = payload;
        },
    },
    actions: {
        async getTypeListAction({ commit }) {
            const {
                data: { list },
            } = await axios.get("/type/list");
            list.map((el) => {
                el.name = typeMap[el.id].name;
            });
            commit("getTypeList", list);
        },
    },
});

export default store;
