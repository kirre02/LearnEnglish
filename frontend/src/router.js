import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from './components/LoginForm.vue'
import Dashboard from './components/Dashboard.vue'
import WelcomePage from './components/WelcomePage.vue'
import Quiz from './components/Quiz.vue'
<<<<<<< HEAD
import QuizResults from './components/QuizResults.vue'  // <-- LÄGG TILL DENNA
=======
import PracticeLayout from './components/practice/PracticeLayout.vue' // IMPORTERA PRACTICE LAYOUT
import Register from './pages/Register.vue'
>>>>>>> 5-audio-support

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
<<<<<<< HEAD
  },  {
=======
  },
  {
>>>>>>> 5-audio-support
    path: '/quiz',
    name: 'Quiz',
    component: Quiz
  },
<<<<<<< HEAD
  {  // <-- LÄGG TILL DENNA NYA ROUTE
    path: '/results',
    name: 'Results',
    component: QuizResults
=======
  {
    // LÄGG TILL DENNA NYA ROUTE FÖR ÖVNINGAR
    path: '/practice/:type',
    name: 'Practice',
    component: PracticeLayout,
    props: true
>>>>>>> 5-audio-support
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router