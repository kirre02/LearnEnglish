import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from './components/LoginForm.vue'
import Dashboard from './components/Dashboard.vue'
import WelcomePage from './components/WelcomePage.vue'
import Quiz from './components/Quiz.vue'
import QuizResults from './components/QuizResults.vue'  // Från gren 4
import PracticeLayout from './components/practice/PracticeLayout.vue' // Från gren 5
import Register from './pages/Register.vue' // Från gren 5
import Djur from './components/Djur.vue'
import Familj from './components/Familj.vue'
import Färger from './components/Färger.vue'
import Mat from './components/Mat.vue'
import Siffror from './components/Siffror.vue'
import Vardagsord from './components/Vardagsord.vue'

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
    props: true
  },
  {
    path: '/djur',
    name: 'Djur',
    component: Djur
  },
  {
    path: '/familj',
    name: 'Familj',
    component: Familj
  },
  {
    path: '/färger',
    name: 'Färger',
    component: Färger
  },
  {
    path: '/mat',
    name: 'Mat',
    component: Mat
  },
  {
    path: '/siffror',
    name: 'Siffror',
    component: Siffror
  },
  {
    path: '/vardagsord',
    name: 'Vardagsord',
    component: Vardagsord
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
