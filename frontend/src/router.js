import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from './components/LoginForm.vue'
import Dashboard from './components/Dashboard.vue'
import WelcomePage from './components/WelcomePage.vue'
import Quiz from './components/Quiz.vue'
import QuizResults from './components/QuizResults.vue'  // <-- LÄGG TILL DENNA

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
  },  {
    path: '/quiz',
    name: 'Quiz',
    component: Quiz
  },
  {  // <-- LÄGG TILL DENNA NYA ROUTE
    path: '/results',
    name: 'Results',
    component: QuizResults
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router