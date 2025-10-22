import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from './components/LoginForm.vue'
import Dashboard from './components/Dashboard.vue'
import WelcomePage from './components/WelcomePage.vue'
import Quiz from './components/Quiz.vue'
import QuizResults from './components/QuizResults.vue'  // Från gren 4
import PracticeLayout from './components/practice/PracticeLayout.vue' // Från gren 5
import Register from './pages/Register.vue' // Från gren 5

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
    component: Dashboard  },  {
    path: '/quiz',
    name: 'Quiz',
    component: Quiz
  },
  {
    // Från gren 4: Resultat-sida
    path: '/results',
    name: 'Results',
    component: QuizResults
  },
  {
    // Från gren 5: Practice modes
    path: '/practice/:type',
    name: 'Practice',
    component: PracticeLayout,
    props: true  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router