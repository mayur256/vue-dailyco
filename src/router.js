import { createWebHistory, createRouter } from 'vue-router'

import Call from './components/Call.vue'
import PreJoin from "./components/PreJoin.vue";

const routes = [
    { path: '/', component: Call },
    { path: '/pre-join', component: PreJoin },
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})