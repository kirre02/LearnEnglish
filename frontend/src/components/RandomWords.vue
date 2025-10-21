<template>
  <div class="random-words-page">
    <div class="random-words-container">
      <h2 class="title">Glostränare</h2>

      <div class="buttons-container">
        <button class="action-btn" @click="getRandomWords">🎲 Slumpmässiga glosor</button>
        <button class="action-btn" @click="getSelectedWords">⭐ Utvalda glosor</button>
      </div>

      <ul v-if="words.length" class="words-list">
        <li v-for="word in words" :key="word.id" class="word-item">
          <span class="swedish">{{ word.swedish }}</span> – <span class="english">{{ word.english }}</span>
        </li>
      </ul>

      <p v-else class="info-text">Tryck på en knapp för att hämta glosor.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const words = ref([]);

// Hämta slumpmässiga glosor
async function getRandomWords() {
  try {
    const res = await fetch("http://localhost:9001/api/words"); // ändrat
    if (!res.ok) throw new Error('Kunde inte hämta glosor');
    words.value = await res.json();
  } catch (err) {
    console.error("Fel vid hämtning av slumpmässiga glosor:", err);
  }
}

async function getSelectedWords() {
  try {
    const res = await fetch("http://localhost:9001/api/words/selected");
    if (!res.ok) throw new Error('Kunde inte hämta glosor');
    words.value = await res.json();
  } catch (err) {
    console.error("Fel vid hämtning av utvalda glosor:", err);
  }
}

</script>

<style scoped>
/* === SIDAN === */
.random-words-page {
  min-height: 100vh;
  background-color: #F7F3ED;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Arial', sans-serif;
}

.random-words-container {
  max-width: 500px;
  width: 100%;
  background: #FFFFFF;
  border-radius: 15px;
  padding: 30px 25px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border: 2px solid #FF8E53;
  text-align: center;
}

/* === TITEL === */
.title {
  font-size: 2rem;
  font-weight: 800;
  color: #FF8E53;
  margin-bottom: 20px;
}

/* === KNAPPAR === */
.buttons-container {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
}

.action-btn {
  padding: 12px 25px;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 12px;
  border: none;
  color: #FFFFFF;
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.3);
}

.action-btn:hover {
  transform: translateY(-3px);
  background: linear-gradient(135deg, #FF8E53, #FF6B6B);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

/* === GLORLISTA === */
.words-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.word-item {
  background: #FFFBEB;
  border-left: 4px solid #FF8E53;
  margin-bottom: 10px;
  padding: 12px 15px;
  border-radius: 10px;
  font-size: 1.1rem;
  display: flex;
  justify-content: center;
  gap: 10px;
  color: #2D3748;
  box-shadow: 0 1px 6px rgba(0,0,0,0.1);
}

.swedish {
  font-weight: 700;
}

.english {
  font-style: italic;
}

/* === INFO-TEXT === */
.info-text {
  color: #666;
  font-size: 0.95rem;
  margin-top: 20px;
}
</style>
