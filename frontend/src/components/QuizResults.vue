<template>
  <div class="results-page">
    <h1>📊 Mina Quizresultat</h1>

    <div v-if="loading" class="loading">Laddar...</div>

    <div v-else>
      <div v-if="quizResults.length === 0" class="no-results">
        Du har inte gjort några quiz ännu!
      </div>

      <div v-else>
        <div class="summary">
          <div class="circle-chart">
            <svg viewBox="0 0 36 36">
              <path
                class="circle-bg"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                class="circle"
                :stroke-dasharray="`${correctPercentage}, 100`"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" class="percentage">{{ correctPercentage }}%</text>
            </svg>
            <p>Totalt rätta svar</p>
          </div>

          <div class="summary-stats">
            <div><strong>{{ totalQuizzes }}</strong> quiz totalt</div>
            <div><strong>{{ totalCorrect }}</strong> rätt</div>
            <div><strong>{{ totalWrong }}</strong> fel</div>
          </div>
        </div>

        <table class="results-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Rätt</th>
              <th>Fel</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(result, index) in quizResults" :key="index">
              <td>{{ new Date(result.created_at).toLocaleString() }}</td>
              <td>{{ result.correct_answers }}</td>
              <td>{{ result.wrong_answers }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { getQuizResults } from "../api/quizResults.js";

export default {
  name: "QuizResults",
  data() {
    return {
      quizResults: [],
      loading: true,
    };
  },
  computed: {
    totalQuizzes() {
      return this.quizResults.length;
    },
    totalCorrect() {
      return this.quizResults.reduce((sum, r) => sum + r.correct_answers, 0);
    },
    totalWrong() {
      return this.quizResults.reduce((sum, r) => sum + r.wrong_answers, 0);
    },
    correctPercentage() {
      const total = this.totalCorrect + this.totalWrong;
      return total === 0 ? 0 : Math.round((this.totalCorrect / total) * 100);
    },
  },
  async mounted() {
    const token = localStorage.getItem("token");
    try {
      this.quizResults = await getQuizResults(token);
    } catch (err) {
      console.error("Fel vid hämtning av quizresultat:", err);
    } finally {
      this.loading = false;
    }
  },
};
</script>

<style scoped>
.results-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  background-color: #f7f3ed;
  font-family: 'Comic Sans MS', cursive;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}
.loading, .no-results {
  text-align: center;
  font-size: 1.2em;
  margin-top: 40px;
  color: #555;
}
.summary {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 30px;
}
.circle-chart {
  width: 150px;
  text-align: center;
}
.circle-bg {
  fill: none;
  stroke: #eee;
  stroke-width: 3.8;
}
.circle {
  fill: none;
  stroke: #4ECDC4;
  stroke-width: 3.8;
  stroke-linecap: round;
  animation: progress 1s ease-out forwards;
}
.percentage {
  fill: #333;
  font-size: 0.5em;
  text-anchor: middle;
}
@keyframes progress {
  0% { stroke-dasharray: 0 100; }
}
.summary-stats {
  font-size: 1.2em;
  line-height: 1.8;
}
.results-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
}
.results-table th, .results-table td {
  text-align: center;
  padding: 12px;
  border-bottom: 1px solid #ddd;
}
.results-table th {
  background-color: #FF9A8B;
  color: white;
}
.results-table tr:hover {
  background-color: #f9f9f9;
}
</style>
