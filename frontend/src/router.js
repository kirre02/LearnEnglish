import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from './components/LoginForm.vue'
import Dashboard from './components/Dashboard.vue'
import WelcomePage from './components/WelcomePage.vue'
import Quiz from './components/practice/Quiz.vue'
import QuizResults from './components/QuizResults.vue'
import PracticeLayout from './components/practice/PracticeLayout.vue'
import Register from './pages/Register.vue'
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
    // Resultat-sida från båda versioner
    path: '/quiz-results',
    alias: '/results',
    name: 'QuizResults',
    component: QuizResults
  },
  {
    // Practice modes från gren 5
    path: '/practice/:type',
    name: 'Practice',
    component: PracticeLayout,
    props: true
  }, 
  {
    // Practice result routes från gren 5
    path: '/practice/listen/results',
    component: () => import('./components/practice/ListenPractice.vue')   
  },
  {
    path: '/practice/match/results',
    component: () => import('./components/practice/MatchPractice.vue')
  },
  {
    path: '/practice/speak/results',
    component: () => import('./components/practice/SpeakPractice.vue')
  },
  {
    path: '/practice/quiz/results',
    alias: '/quiz/results',
    component: () => import('./components/practice/Quiz.vue')
  },
  {
    // Kategori routes från main
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