<template>
  <div class="practice-layout">
    <component :is="currentPracticeComponent" />
  </div>
</template>

<script>
import ListenPractice from './ListenPractice.vue'
import MatchPractice from './MatchPractice.vue'
import SpeakPractice from './SpeakPractice.vue'
import Quiz from './Quiz.vue' // 👈 Nu finns Quiz i samma mapp!

export default {
  name: 'PracticeLayout',
  components: {
    ListenPractice,
    MatchPractice,
    SpeakPractice,
    Quiz
  },
  computed: {
    practiceType() {
      return this.$route.params.type
    },
    currentPracticeComponent() {
      const componentMap = {
        'listen': 'ListenPractice',
        'match': 'MatchPractice', 
        'speak': 'SpeakPractice',
        'quiz': 'Quiz'
      }
      return componentMap[this.practiceType] || 'ListenPractice'
    }
  }
}
</script>

<style scoped>
.practice-layout {
  min-height: 100vh;
  background-color: #f7f3ed;
}</style>