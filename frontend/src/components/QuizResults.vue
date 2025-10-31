<template>
  <div class="quiz-resultat">
    <h1>📊 Ditt språkframsteg</h1>

    <div v-if="loading" class="loading">Laddar resultat...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="quizResults.length === 0" class="no-data">
      Inga resultat ännu. Gör ett quiz först! 😊
    </div>
    <div v-else>
      <div class="chart-container">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const loading = ref(true);
const error = ref(null);
const quizResults = ref([]);

onMounted(async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Ingen token hittades");

    const res = await fetch("http://localhost:9001/api/quiz/quiz-results", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Kunde inte hämta quizresultat");

    const data = await res.json();
    quizResults.value = data.reverse();
  } catch (err) {
    console.error(err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

const correctAnswers = computed(() =>
  quizResults.value.map((r) => r.correct_answers)
);

// 🔹 Eğlenceli renk geçişleri
const funColors = [
  "rgba(255, 140, 0, 0.85)",
  "rgba(255, 99, 132, 0.8)",
  "rgba(78, 205, 196, 0.8)",
  "rgba(255, 206, 86, 0.8)",
  "rgba(153, 102, 255, 0.8)"
];

// 🔹 Chart verisi
const chartData = computed(() => ({
  labels: quizResults.value.map(
    (r) => new Date(r.created_at).toLocaleDateString("sv-SE")
  ),
  datasets: [
    {
      data: correctAnswers.value,
      backgroundColor: correctAnswers.value.map(
        (_, i) => funColors[i % funColors.length]
      ),
      borderRadius: 8,
      borderSkipped: false,
      barThickness: 25, // daha ince bar
    },
  ],
}));

// ✅ Küçük, eğlenceli, 4'er adımlı grafik
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 800,
    easing: "easeOutBounce", // 🎈 eğlenceli zıplama efekti
  },
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => `Rätt svar: ${context.parsed.y}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      min: 0,
      max: 20,
      ticks: {
        stepSize: 4,
        callback: (value) => value,
        font: { size: 9 },
      },
      grid: {
        drawBorder: true,
        color: "#f3f3f3",
      },
      title: { display: false },
    },
    x: {
      title: { display: false },
      ticks: {
        font: { size: 9 },
      },
      categoryPercentage: 0.35,
      barPercentage: 0.55,
    },
  },
  layout: {
    padding: 0,
  },
  backgroundColor: "transparent",
};
</script>

<style scoped>
.quiz-resultat {
  max-width: 600px;
  margin: 1.5rem auto;
  text-align: center;
  font-family: "Comic Sans MS", cursive;
  background: linear-gradient(135deg, #fefefe, #fdf5f8);
  padding: 1rem 1.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.quiz-resultat h1 {
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
  color: #222; /* ✅ Siyah ton (dashboard’la uyumlu) */
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  letter-spacing: 0.5px;
}

.quiz-resultat h1 span.emoji {
  margin-right: 6px;
}

.chart-container {
  width: 100%;
  height: 160px; /* ✅ daha küçük yükseklik */
}

:deep(.chart-container div),
:deep(.chart-container canvas) {
  background-color: transparent !important;
  box-shadow: none !important;
  border: none !important;
}

.loading {
  font-size: 1.1rem;
  color: #666;
}

.error {
  color: red;
  font-weight: bold;
}

.no-data {
  color: #666;
  margin-top: 1rem;
}


</style>
