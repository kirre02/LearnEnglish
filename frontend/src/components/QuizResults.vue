<template>
  <div class="quiz-results">
    <!-- Tillbaka-knappar -->
    <div class="navigation-header">
      <button @click="goBackToQuiz" class="back-btn">← Tillbaka till Quiz</button>
      <button @click="goToDashboard" class="dashboard-btn">🏠 Dashboard</button>
    </div>

    <h2>Mina Quiz-Resultat</h2>
    
    <div v-if="loading" class="loading">
      <p>Laddar resultat...</p>
    </div>

    <div v-else-if="results.length === 0" class="no-results">
      <p>Inga quiz-resultat att visa ännu.</p>
      <p>Gör ett quiz för att se dina resultat här!</p>
      <button @click="goToQuiz" class="action-btn">🎮 Gör ett Quiz</button>
    </div>

    <div v-else class="results-container">
      <div v-for="result in results" :key="result.id" class="result-card">
        <div class="result-header">
          <h3>Quiz {{ formatDate(result.date) }}</h3>
          <span class="score-badge">{{ calculatePercentage(result.score, result.total) }}%</span>
        </div>
        <div class="result-details">
          <p><strong>Poäng:</strong> {{ result.score }}/{{ result.total }} rätt</p>
          <p><strong>Datum:</strong> {{ formatDateTime(result.date) }}</p>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: calculatePercentage(result.score, result.total) + '%' }"
            :class="getProgressClass(result.score, result.total)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuizResults',
  data() {
    return {
      results: [],
      loading: true
    }
  },
  async mounted() {
    await this.fetchResults();
  },
  methods: {
    async fetchResults() {
      try {
        this.loading = true;
        const userId = 1; // Använd userId 1
        const response = await fetch(`http://localhost:9001/api/results/${userId}`);
        
        if (response.ok) {
          this.results = await response.json();
          console.log('Results loaded:', this.results); // Debug
        } else {
          console.error('Error fetching results:', response.status);
          // Fallback - visa testdata om API inte fungerar
          this.results = this.getFallbackResults();
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        // Fallback - visa testdata vid fel
        this.results = this.getFallbackResults();
      } finally {
        this.loading = false;
      }
    },

    // Fallback data om API inte fungerar
    getFallbackResults() {
      return [
        {
          id: 1,
          user_id: 1,
          score: 7,
          total: 20,
          date: new Date().toISOString()
        },
        {
          id: 2, 
          user_id: 1,
          score: 5,
          total: 20,
          date: new Date(Date.now() - 86400000).toISOString() // 1 dag sedan
        }
      ];
    },
    
    calculatePercentage(score, total) {
      return Math.round((score / total) * 100);
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('sv-SE');
    },
    
    formatDateTime(dateString) {
      const date = new Date(dateString);
      // Korrekt tidszonhantering - konvertera UTC till svensk tid
      const swedishTime = new Date(date.getTime());
      return swedishTime.toLocaleString('sv-SE', {
        timeZone: 'Europe/Stockholm',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    getProgressClass(score, total) {
      const percentage = this.calculatePercentage(score, total);
      if (percentage >= 80) return 'excellent';
      if (percentage >= 60) return 'good';
      return 'needs-improvement';
    },

    goBackToQuiz() {
      this.$router.push({
        path: '/quiz',
        query: { showResults: 'true' }
      });
    },    goToQuiz() {
      this.$router.push('/quiz');
    },    goToDashboard() {
      this.$router.push('/dashboard');
    }
  }
}
</script>

<style scoped>
.quiz-results {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Comic Sans MS', 'Marker Felt', cursive, sans-serif;
  background-color: #f7f3ed;
  min-height: 100vh;
}

/* Navigation Header */
.navigation-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  gap: 15px;
}

.back-btn {
  background: linear-gradient(135deg, #FF9A8B, #FF6A88);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255,154,139,0.3);
}

.back-btn:hover {
  transform: translateX(-5px);
  box-shadow: 0 6px 20px rgba(255,154,139,0.5);
}

.dashboard-btn {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(78,205,196,0.3);
}

.dashboard-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(78,205,196,0.5);
}

.loading, .no-results {
  text-align: center;
  padding: 40px;
  color: #666;
  background: white;
  border-radius: 15px;
  margin: 20px 0;
}

.action-btn {
  background: linear-gradient(135deg, #FF9A8B, #FF6A88);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 15px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(255,154,139,0.4);
}
.result-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  border-left: 6px solid #4CAF50;
  transition: transform 0.3s ease;
}

.result-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.result-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2em;
}

.score-badge {
  background: #4CAF50;
  color: white;
  padding: 6px 15px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.1em;
}

.result-details {
  margin-bottom: 15px;
}

.result-details p {
  margin: 8px 0;
  color: #555;
  font-size: 1em;
}

.progress-bar {
  height: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 10px;
}

.progress-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.progress-fill.excellent {
  background: linear-gradient(135deg, #4CAF50, #45a049);
}

.progress-fill.good {
  background: linear-gradient(135deg, #FFC107, #ffb300);
}

.progress-fill.needs-improvement {
  background: linear-gradient(135deg, #F44336, #d32f2f);
}

/* Responsiv design */
@media (max-width: 768px) {
  .quiz-results {
    padding: 15px;
  }

  .navigation-header {
    flex-direction: column;
    gap: 10px;
  }

  .back-btn, .dashboard-btn {
    width: 100%;
    text-align: center;
  }
  
  .result-card {
    padding: 15px;
  }
  
  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .score-badge {
    align-self: flex-start;
  }
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 2em;
  background: linear-gradient(135deg, #FF9A8B, #FF6A88);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>