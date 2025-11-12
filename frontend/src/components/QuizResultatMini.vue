<template>
  <div class="quiz-resultat-mini">
    <h3>📊 Quiz Statistik</h3>
    
    <div class="chart-container">
      <Bar 
        v-if="chartData"
        :data="chartData" 
        :options="chartOptions" />
    </div>

    <div v-if="!chartData" class="no-data">
      Inga quizresultat ännu 📘
    </div>
  </div>
</template>

<script>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

export default {
  name: 'QuizResultatMini',
  components: { Bar },
  data() {
    return {
      quizResults: [],
      chartData: null
    }
  },
  computed: {
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    }
  },
  async mounted() {
    await this.loadQuizResults();
  },
  methods: {
    async loadQuizResults() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id || 1;

        const response = await fetch(`http://localhost:9001/api/quiz/quiz-results/${userId}`);
        
        if (response.ok) {
          const data = await response.json();
          this.quizResults = data.slice(0, 5).reverse(); // Senaste 5 resultaten
          
          this.chartData = {
            labels: this.quizResults.map(r => {
              const date = new Date(r.created_at);
              return date.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' });
            }),
            datasets: [{
              label: 'Rätt svar (%)',
              data: this.quizResults.map(r => {
                const total = r.correct_answers + r.wrong_answers;
                return total > 0 ? Math.round((r.correct_answers / total) * 100) : 0;
              }),
              backgroundColor: ['#FF9A8B', '#4ECDC4', '#C77DFF', '#FFD93D', '#FF6B6B'],
              borderRadius: 8
            }]
          };
        }
      } catch (error) {
        console.error('Error loading quiz results:', error);
      }
    }
  }
}
</script>

<style scoped>
.quiz-resultat-mini {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 3px solid #6a11cb;
}

.quiz-resultat-mini h3 {
  margin: 0 0 15px 0;
  color: #333;
  text-align: center;
  font-size: 1.2em;
  font-weight: bold;
}

.chart-container {
  flex: 1;
  min-height: 200px;
  position: relative;
}

.no-data {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 40px 20px;
  font-size: 0.9em;
}
</style>