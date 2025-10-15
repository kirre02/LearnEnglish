<template>
  <div class="random-words">
    <h2>Glostränare</h2>

    <div class="buttons">
      <button @click="getRandomWords">🎲 Hämta slumpmässiga glosor</button>
      <button @click="getSelectedWords">⭐ Hämta utvalda glosor</button>
    </div>

    <ul v-if="words.length">
      <li v-for="word in words" :key="word.id">
        {{ word.swedish }} – {{ word.english }}
      </li>
    </ul>

    <p v-else class="info">Tryck på en knapp för att hämta glosor.</p>
  </div>
</template>

<script setup>
import { ref } from "vue";

const words = ref([]);

// Hämta slumpmässiga glosor (10 st)
async function getRandomWords() {
  try {
    const res = await fetch("http://localhost:9001/api/random-words");
    words.value = await res.json();
  } catch (err) {
    console.error("Fel vid hämtning av slumpmässiga glosor:", err);
  }
}

// Hämta utvalda glosor (t.ex. dagens glosor)
async function getSelectedWords() {
  try {
    const res = await fetch("http://localhost:9001/api/selected-words");
    words.value = await res.json();
  } catch (err) {
    console.error("Fel vid hämtning av utvalda glosor:", err);
  }
}
</script>

<style scoped>
.random-words {
  max-width: 400px;
  margin: 1rem auto;
  text-align: center;
}

h2 {
  margin-bottom: 1rem;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 1rem;
}

button {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}

button:hover {
  background: #0056b3;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  background: #f8f9fa;
  margin: 5px 0;
  padding: 0.5rem;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.info {
  color: #666;
}
</style>
