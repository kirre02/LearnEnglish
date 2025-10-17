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
        // TODO: Hämta userId från localStorage/auth
        const userId = 1; // Temporärt - använd userId 1
        const response = await fetch(`http://localhost:9001/api/results/${userId}`);
        
        if (response.ok) {
          this.results = await response.json();
        } else {
          console.error('Error fetching results:', response.status);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        this.loading = false;
      }
    },
    
    calculatePercentage(score, total) {
      return Math.round((score / total) * 100);
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('sv-SE', { 
        timeZone: 'Europe/Stockholm'
      });
    },
    
    formatDateTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('sv-SE', { 
        timeZone: 'Europe/Stockholm',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    
    getProgressClass(score, total) {
      const percentage = this.calculatePercentage(score, total);
      if (percentage >= 80) return 'excellent';
      if (percentage >= 60) return 'good';
      return 'needs-improvement';
    },

     goBackToQuiz() {
    // Gå till quiz-sidan och skicka med data om att visa resultat direkt
    this.$router.push({
      path: '/quiz',
      query: { showResults: 'true' }
    });
  },
  

    goToQuiz() {
      // Gå direkt till quiz-sidan
      this.$router.push('/quiz');
    },

    goToDashboard() {
      // Gå till dashboard
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
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #4CAF50;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.result-header h3 {
  margin: 0;
  color: #333;
}

.score-badge {
  background: #4CAF50;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: bold;
}

.result-details {
  margin-bottom: 10px;
}

.result-details p {
  margin: 5px 0;
  color: #555;
}

.progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.excellent {
  background: #4CAF50;
}

.progress-fill.good {
  background: #FFC107;
}

.progress-fill.needs-improvement {
  background: #F44336;
}

/* Responsiv design */
@media (max-width: 768px) {
  .quiz-results {
    padding: 10px;
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
}
</style>