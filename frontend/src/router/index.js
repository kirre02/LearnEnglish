import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'


const routes = [
  { path: '/', component: HomePage },
  {
  path: "/quiz-results",
  name: "QuizResults",
  component: () => import("../components/QuizResults.vue"),
  meta: { requiresAuth: true }
}

]

export default createRouter({
  history: createWebHistory(),
  routes
})
