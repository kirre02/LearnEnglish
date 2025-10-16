
import {createRouter, createWebHistory} from "vue-router"
import Register from "./pages/Register.vue"
import Dashboard from "./pages/Dashboard.vue"

const routes = [
    {
    path: "/register",
    name:'register',
    component: Register
    },
    {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router