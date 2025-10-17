import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from './components/LoginForm.vue'
import Dashboard from './components/Dashboard.vue'
import WelcomePage from './components/WelcomePage.vue'
import Quiz from './components/Quiz.vue'
import PracticeLayout from './components/practice/PracticeLayout.vue' // IMPORTERA PRACTICE LAYOUT

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: WelcomePage
  },
  {
    path: '/login',
    name: 'Login', 
    component: LoginForm
  },
  {
    path: '/register',
    name: 'Register', 
    component: LoginForm
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/quiz',
    name: 'Quiz',
    component: Quiz
  },
  {
    // LÄGG TILL DENNA NYA ROUTE FÖR ÖVNINGAR
    path: '/practice/:type',
    name: 'Practice',
    component: PracticeLayout,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router