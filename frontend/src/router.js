import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from './components/LoginForm.vue'
import Dashboard from './components/Dashboard.vue'
import WelcomePage from './components/WelcomePage.vue'
import Quiz from './components/practice/Quiz.vue'
import QuizResults from './components/QuizResults.vue'
import PracticeLayout from './components/practice/PracticeLayout.vue'
import Register from './pages/Register.vue'

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
    component: Register
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    // Från gren 4: Resultat-sida
  path: '/quiz-results',
  alias: '/results',
  name: 'QuizResults',
  component: QuizResults
  },
  {
    // Från gren 5: Practice modes
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