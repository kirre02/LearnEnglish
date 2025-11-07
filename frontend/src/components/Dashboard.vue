<template>
  <div class="dashboard">
    <div class="top-section">
      <div class="floating-balloons">
        <div class="balloon balloon1">🎈</div>
        <div class="balloon balloon2">🎈</div>
        <div class="balloon balloon3">🎈</div>
      </div>
      
      <div class="welcome-container">
        <div class="welcome-bubble">
          <div class="bubble-tail"></div>
          <h1>Hej {{ user.name }}! 🎉</h1>
          <p>Vad kul att du är här! Vad vill du göra idag?</p>
          
          <!-- PROFIL-KNAPP MED KORREKT INDDRAGNING -->
          <button class="profile-action-btn" @click="goToProfile">
            👤 Min Profil
          </button>
          
          <div class="sparkles">✨✨✨</div>
        </div>
        
        <UserInfoBubble
          :learnedWords="learnedWords"
          @logout="handleLogout"
          @show-profile="goToProfile" 
          class="user-info-bubble-position"/>
      </div>
    </div>

    <div class="progress-bubbles three-columns">
      <div class="progress-bubble progress-main">
        <div class="bubble-emoji">🚀</div>
        <div class="bubble-content">
          <h3>Ditt äventyr börjar!</h3>
          <p>{{ learnedWords }} av {{ totalWords }} ord upptäckta</p>
          <div class="progress-ring">
            <div class="ring-fill" :style="progressStyle"></div>
            <span class="ring-text">{{ progressPercentage }}%</span>
          </div>
        </div>
      </div>
      
      <div class="progress-bubble quiz-bubble">
        <div class="bubble-emoji">🏆</div>
        <div class="bubble-content">
          <h3>Quiz-mästare!</h3>
          <p>{{ completedQuizzes }} quiz avklarade</p>
        </div>
      </div>

      <div class="progress-bubble chart-bubble">
        <QuizResultatMini />
      </div>
    </div>

    <div class="quick-actions">
      <div class="actions-header">
        <h3>Snabbstart ⚡</h3>
        <div class="action-sparkles">🌟⚡🌟</div>
      </div>
      <div class="action-buttons">
        <button class="action-btn listen-btn" @click="startQuickPractice('listen')">
          <span class="btn-emoji">🎧</span>
          <span>Lyssna</span>
        </button>
        <button class="action-btn match-btn" @click="startQuickPractice('match')">
          <span class="btn-emoji">🔄</span>
          <span>Matcha</span>
        </button>
        <button class="action-btn speak-btn" @click="startQuickPractice('speak')">
          <span class="btn-emoji">🎤</span>
          <span>Upprepa</span>
        </button>
        <button class="action-btn quiz-btn" @click="showQuizOptions">
          <span class="btn-emoji">🎯</span>
          <span>Quiz</span>
        </button>
      </div>
    </div>

    <div v-if="showQuizModal" class="modal-overlay" @click="closeQuizModal">
      <div class="quiz-modal" @click.stop>
        <div class="modal-header">
          <h3>Välj Quiz-alternativ 🎯</h3>
          <button @click="closeQuizModal" class="close-modal-btn">✕</button>
        </div>
        
        <div class="quiz-options">
          <div 
            v-if="hasSavedQuiz" 
            class="quiz-option continue-option"
            @click="continueSavedQuiz"
          >
            <div class="option-emoji">⏯️</div>
            <div class="option-content">
              <h4>Fortsätt Quiz</h4>
              <p>Fortsätt där du slutade</p>
              <div class="option-badge">Påbörjad</div>
            </div>
            <div class="option-arrow">→</div>
          </div>
          
          <div 
            class="quiz-option new-option"
            @click="startNewQuiz"
          >
            <div class="option-emoji">🆕</div>
            <div class="option-content">
              <h4>Nytt Quiz</h4>
              <p>Starta ett nytt quiz från början</p>
            </div>
            <div class="option-arrow">→</div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeQuizModal" class="cancel-btn">Avbryt</button>
        </div>
      </div>
    </div>

    <div class="explore-section">
      <div class="section-header">
        <h2>Vad vill du utforska idag? 🗺️</h2>
        <div class="header-decoration">🎨🌟🎯</div>
      </div>

      <div class="explore-cards">
        <div
          v-for="(category, index) in categories"
          :key="category.id"
          :class="['explore-card', 'card-' + (index + 1)]"
          @click="navigateToCategory(category.name)">
          <div class="card-emoji">{{ category.emoji }}</div>
          <div class="card-wave"></div>
          <h3>{{ category.name }}</h3>
          <p>{{ category.description }}</p>
          <div class="card-sparkle">✨</div>
        </div>
      </div>
    </div>

    <div class="encouragement-footer">
      <div class="encouragement-message">
        <div class="message-emoji">💫</div>
        <div class="message-text">
          <h4>Du är fantastisk! 🌟</h4>
          <p>Kom tillbaka när du känner för det - varje ord är ett steg närmare!</p>
        </div>
        <div class="message-emoji">💫</div>
      </div>
    </div>
  </div>
</template>

<script>
import QuizResultatMini from "@/components/QuizResults.vue"; 
import UserInfoBubble from './UserInfoBubble.vue';

export default {
  components: { QuizResultatMini, UserInfoBubble },
  name: 'Dashboard',
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      learnedWords: 0,
      totalWords: 120,
      completedQuizzes: 0,
      hasSavedQuiz: false,
      showQuizModal: false,
      quizResults: [],
      chartData: null,
      categories: [
        { id: 1, name: 'Färger', emoji: '🎨', description: 'Upptäck alla färger' },
        { id: 2, name: 'Djur', emoji: '🐶', description: 'Djur från hela världen' },
        { id: 3, name: 'Siffror', emoji: '🔢', description: '1, 2, 3... låt oss räkna!' },
        { id: 4, name: 'Mat', emoji: '🍎', description: 'Gott och nyttigt' },
        { id: 5, name: 'Familj', emoji: '👨‍👩‍👧‍👦', description: 'Mamma, pappa & alla andra' },
        { id: 6, name: 'Vardagsord', emoji: '💬', description: 'Ord för vardagen' }
      ],
    }
  },
  computed: {
    progressPercentage() {
      return this.totalWords > 0 ? Math.round((this.learnedWords / this.totalWords) * 100) : 0;
    },
    progressStyle() {
      return {
        background: `conic-gradient(#4ECDC4 ${this.progressPercentage}%, #e0e0e0 0%)`
      };
    }
  },
  async mounted() {
    if (!localStorage.getItem('token')) {
      this.$router.push('/');
    }
    
    try {
      const userId = 1;
      const res = await fetch(`http://localhost:9001/api/quiz/quiz-results/${userId}`);
      const data = await res.json();

      if (data.length > 0) {
        data.shift();
      }

      this.quizResults = data.map(r => ({
        date: new Date(r.created_at).toLocaleDateString("sv-SE"),
        correct: r.correct_answers,
        total: r.correct_answers + r.wrong_answers,
        percent: Math.round((r.correct_answers / (r.correct_answers + r.wrong_answers)) * 100)
      }));

      this.chartData = {
        labels: this.quizResults.map(r => r.date),
        datasets: [
          {
            label: "Quizresultat (%)",
            data: this.quizResults.map(r => r.percent),
            backgroundColor: ["#FF9A8B", "#4ECDC4", "#C77DFF", "#FFD93D", "#FF6B6B"]
          }
        ]
      };

    } catch (err) {
      console.error("❌ Fel vid hämtning av quizresultat:", err);
    }

    await this.loadUserProgress();
    this.checkForSavedQuiz();
  },
  methods: {
    async loadUserProgress() {
      try {
        const response = await fetch('http://localhost:9001/api/user-progress');
        
        if (response.ok) {
          const progress = await response.json();
          this.learnedWords = progress.learnedWords;
          this.totalWords = progress.totalWords;
          this.completedQuizzes = progress.completedQuizzes;
          console.log('Progress loaded from API:', progress);
        } else {
          console.log('API not available, using localStorage');
          this.loadProgressFromLocalStorage();
        }
      } catch (error) {
        console.log('Error loading from API:', error);
        this.loadProgressFromLocalStorage();
      }
    },

    loadProgressFromLocalStorage() {
      const progress = JSON.parse(localStorage.getItem('learningProgress') || '{}');
      this.learnedWords = progress.learnedWords || 0;
      this.completedQuizzes = progress.completedQuizzes || 0;
    },

    checkForSavedQuiz() {
      const savedQuiz = localStorage.getItem('savedQuizState');
      this.hasSavedQuiz = !!savedQuiz;
    },

    showQuizOptions() {
      this.showQuizModal = true;
    },

    closeQuizModal() {
      this.showQuizModal = false;
    },

    continueSavedQuiz() {
      this.closeQuizModal();
      this.$router.push({ path: '/practice/quiz', query: { continue: 'true' } });
    },

    startNewQuiz() {
      this.closeQuizModal();
      localStorage.removeItem('savedQuizState');
      localStorage.removeItem('currentQuizState');
      this.$router.push('/practice/quiz');
    },

    handleLogout() { 
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('learningProgress');
      localStorage.removeItem('savedQuizState');
      localStorage.removeItem('currentQuizState');
      this.$router.push('/');
    },

    goToProfile() { 
      this.$router.push('/profile');
    },

    navigateToCategory(categoryName) {
      const routes = {
        'Färger': '/färger',
        'Djur': '/djur',
        'Siffror': '/siffror',
        'Mat': '/mat',
        'Familj': '/familj',
        'Vardagsord': '/vardagsord'
      };

      if (routes[categoryName]) {
        this.$router.push(routes[categoryName]);
      } else {
        alert(`Öppnar ${categoryName} - kommer snart!`);
      }
    },

    startQuickPractice(type) {
      this.$router.push(`/practice/${type}`);
    },

    startQuiz() {
      this.$router.push('/practice/quiz');
    },

    goToResults() {
      this.$router.push('/quiz-results');
    }
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f7f3ed;
  min-height: 100vh;
  font-family: 'Comic Sans MS', 'Marker Felt', cursive, sans-serif;
  position: relative;
  overflow-x: hidden;
}

.floating-balloons {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10; 
}

.balloon {
  font-size: 24px;
  position: absolute;
  animation: float 3s ease-in-out infinite;
}

.balloon1 { top: 0; right: 0; animation-delay: 0s; }
.balloon2 { top: 30px; right: 40px; animation-delay: 1s; }
.balloon3 { top: -10px; right: 80px; animation-delay: 2s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

.top-section {
  position: relative;
  margin-bottom: 30px;
  z-index: 15;
}

.welcome-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  position: relative;
}

.welcome-bubble {
  flex: 2;
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: white;
  padding: 30px;
  border-radius: 35px;
  position: relative;
  box-shadow: 0 15px 35px rgba(255,107,107,0.3);
  animation: bounceIn 1s ease-out;
  display: flex; 
  flex-direction: column;
}

.bubble-tail {
  position: absolute;
  bottom: -15px;
  left: 50px;
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 20px solid #FF8E53;
}

.welcome-bubble h1 {
  margin: 0 0 10px 0;
  font-size: 2.5em;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.welcome-bubble p {
  margin: 0;
  font-size: 1.2em;
  opacity: 0.9;
}

.sparkles {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 1.5em;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.profile-action-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1em;
  margin-top: 15px;
  align-self: flex-start;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.profile-action-btn:hover {
  background-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}

.user-info-bubble-position {
  position: relative; 
  z-index: 20;
  align-self: flex-start;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.quiz-modal {
  background: white;
  border-radius: 25px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  background: linear-gradient(135deg, #FF9A8B, #FF6A88);
  color: white;
  padding: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5em;
}

.close-modal-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2em;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-modal-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.1);
}

.quiz-options {
  padding: 25px;
}

.quiz-option {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 15px;
  border: 2px solid transparent;
}

.quiz-option:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.continue-option {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.new-option {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: white;
}

.option-emoji {
  font-size: 2.5em;
  flex-shrink: 0;
}

.option-content {
  flex: 1;
}

.option-content h4 {
  margin: 0 0 5px 0;
  font-size: 1.2em;
}

.option-content p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9em;
}

.option-badge {
  background: rgba(255,255,255,0.3);
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.7em;
  margin-top: 8px;
  display: inline-block;
  backdrop-filter: blur(10px);
}

.option-arrow {
  font-size: 1.5em;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.quiz-option:hover .option-arrow {
  transform: translateX(5px);
  opacity: 1;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #eee;
  text-align: right;
}

.cancel-btn {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  color: #6c757d;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.progress-bubbles.three-columns {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 40px;
}

.chart-bubble {
  border: 3px solid #6a11cb;
  padding: 10px;
}

.progress-bubble {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  animation: slideUp 0.8s ease-out;
}

.progress-main {
  border: 3px solid #4ECDC4;
}

.quiz-bubble {
  border: 3px solid #FF9A8B;
}

.bubble-emoji {
  font-size: 3em;
}

.bubble-content h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.3em;
}

.bubble-content p {
  margin: 0 0 15px 0;
  color: #666;
}

.progress-ring {
  position: relative;
  width: 60px;
  height: 60px;
  background: #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-fill {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  mask: radial-gradient(transparent 55%, black 56%);
}

.ring-text {
  font-size: 0.8em;
  font-weight: bold;
  color: #333;
}

.explore-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 35px;
  margin-bottom: 30px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.section-header {
  text-align: center;
  margin-bottom: 30px;
}

.section-header h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 2em;
  background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-decoration {
  font-size: 1.5em;
  opacity: 0.8;
}

.explore-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.explore-card {
  position: relative;
  padding: 30px 20px;
  border-radius: 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  color: white;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  animation: cardAppear 0.6s ease-out;
}

.explore-card:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 15px 35px rgba(0,0,0,0.25);
}

.card-1 { background: linear-gradient(135deg, #FF6B6B, #FF8E53); }
.card-2 { background: linear-gradient(135deg, #4ECDC4, #44A08D); }
.card-3 { background: linear-gradient(135deg, #FFD700, #FF8E00); }
.card-4 { background: linear-gradient(135deg, #667eea, #764ba2); }
.card-5 { background: linear-gradient(135deg, #FD746C, #FF9068); }
.card-6 { background: linear-gradient(135deg, #A8FF78, #78FFD6); }

.card-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: rgba(255,255,255,0.2);
  border-radius: 50% 50% 0 0;
}

.card-emoji {
  font-size: 3em;
  margin-bottom: 15px;
  display: block;
}

.explore-card h3 {
  margin: 0 0 8px 0;
  font-size: 1.3em;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}

.explore-card p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9em;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}

.card-sparkle {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 1.2em;
  animation: twinkle 1.5s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.quick-actions {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 30px;
  margin-bottom: 25px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.actions-header {
  text-align: center;
  margin-bottom: 20px;
}

.actions-header h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.5em;
}

.action-sparkles {
  font-size: 1.2em;
  opacity: 0.8;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.action-btn {
  color: white;
  border: none;
  padding: 20px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}

.action-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0,0,0,0.5);
}

.listen-btn { background: linear-gradient(135deg, #FF6B6B, #FF8E53); }
.match-btn { background: linear-gradient(135deg, #4ECDC4, #44A08D); }
.speak-btn { background: linear-gradient(135deg, #FFD700, #FF8E00); }
.quiz-btn { background: linear-gradient(135deg, #FF9A8B, #FF6A88); }

.btn-emoji {
  font-size: 1.5em;
}

.results-btn {
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: white;
  border: none;
  padding: 20px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.results-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.encouragement-footer {
  text-align: center;
}

.encouragement-message {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 30px;
  border-radius: 25px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  animation: pulse 2s ease-in-out infinite;
}

.message-emoji {
  font-size: 1.5em;
}

.message-text h4 {
  margin: 0;
  color: #333;
  font-size: 1.1em;
}

.message-text p {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 0.9em;
}

@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes slideUp {
  0% { transform: translateY(30px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes cardAppear {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@media (max-width: 768px) {
  .welcome-container {
    flex-direction: column;
  }
  
  .progress-bubbles {
    grid-template-columns: 1fr;
  }
  
  .explore-cards {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .encouragement-message {
    flex-direction: column;
    text-align: center;
  }
  
  .quiz-modal {
    width: 95%;
    margin: 20px;
  }
  
  .quiz-option {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .option-emoji {
    font-size: 2em;
  }

  .results-btn {
    background: linear-gradient(135deg, #ff6a88, #ff99ac); 
  }
}

@media (min-width: 769px) {
  .user-info-bubble-position {
    position: absolute; 
    right: 0px; 
    top: 90px;
    flex-shrink: 0;
  }

  .welcome-bubble {
    flex: 2; 
    margin-right: 180px; 
  }
}
</style>