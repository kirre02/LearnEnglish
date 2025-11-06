<template>
  <div class="practice-page match-practice">
    <div class="practice-container">
      <!-- Header -->
      <div v-if="!isResultsMode" class="practice-header">
        <button @click="goBack" class="back-btn">← Tillbaka</button>
        <div class="progress-info">
          <h2>🔄 Matcha orden!</h2>
          <p class="game-stats">Poäng: <strong>{{ score }}</strong> | Tid: <strong>{{ formattedTime }}</strong></p>
        </div>
      </div>
<!-- 📊 RESULT MODE (visas när man går till /practice/match/results) -->
<div v-if="isResultsMode" class="results-page">
  <h2 class="results-title">🧩 Dina matchningsresultat</h2>
  <h3 style="color:#555; margin-bottom:20px;">
  Här ser du dina tidigare poäng och tider ⏱️
  </h3>
  <div v-if="latestScore && total" class="latest-result">
    <p>Senaste resultat: <strong>{{ latestScore }}/{{ total }}</strong></p>
    <p>Procent: <strong>{{ Math.round((latestScore / total) * 100) }}%</strong></p>
  </div>  
  
  <table v-if="results.length" class="results-table">
    <thead>
      <tr>
        <th>Datum</th>
        <th>Poäng</th>
        <th>Tid</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(r, index) in results" :key="index">
        <td>{{ new Date(r.date).toLocaleDateString('sv-SE') }}</td>
        <td>{{ r.score }}</td>
        <td>{{ formatDuration(r.duration_seconds) }}</td>
      </tr>
    </tbody>
  </table>

  <p v-else class="no-results">Inga resultat ännu. Gör en matchningsövning först 🧩</p>

  <button @click="goBack" class="action-btn dashboard-btn">⬅️ Tillbaka</button>
</div>

      <!-- Laddningsskärm -->
      <div v-if="loading && !isResultsMode" class="loading-container">
        <div class="loading-bubble">
          <div class="loading-emoji">⏳</div>
          <h3>Hämtar ord...</h3>
          <p>Var god vänta medan vi förbereder ditt matchningsspel!</p>
        </div>
      </div>

      <!-- Game Instructions -->
      <div v-else-if="!isResultsMode" class="instructions">
        <p>💡 <strong>Dra</strong> orden från ena kolumnen till den andra för att matcha rätt par!</p>
      </div>

      <!-- Matching Game -->
      <div v-if="!loading && !isResultsMode && !practiceFinished " class="matching-game">
        <div class="columns-container">
          <!-- Swedish Column -->
          <div class="column swedish-column">
            <h3>Svenska 🇸🇪</h3>
            <div class="words-list">
              <div 
                v-for="(word, index) in swedishWords" 
                :key="'sv-' + index"
                class="word-item"
                :class="{ 
                  matched: word.matched,
                  dragging: word === draggedWord
                }"
                @dragstart="dragStart($event, word, 'swedish')"
                @dragend="dragEnd"
                draggable="true"
              >
                <span class="word-text">{{ word.text }}</span>
                <span v-if="word.matched" class="match-check">✅</span>
              </div>
            </div>
          </div>

          <!-- English Column -->
          <div class="column english-column">
            <h3>Engelska 🇬🇧</h3>
            <div class="words-list">
              <div 
                v-for="(word, index) in englishWords" 
                :key="'en-' + index"
                class="word-item"
                :class="{ 
                  matched: word.matched,
                  'drop-zone': !word.matched
                }"
                @dragstart="dragStart($event, word, 'english')"
                @dragover="dragOver"
                @drop="drop($event, word)"
                @dragend="dragEnd"
                draggable="true"
              >
                <span class="word-text">{{ word.text }}</span>
                <span v-if="word.matched" class="match-check">✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>
          <!-- Completion Message -->
<div v-if="!isResultsMode && practiceFinished" class="completion-message">
          <div class="success-bubble">
            <div class="success-emoji">🎉</div>
            <h3>Fantastiskt jobbat! 🏆</h3>
            <p>Du matchade alla {{ wordPairs.length }} ord på {{ formattedTime }}!</p>
            <p class="final-score">Slutpoäng: <strong>{{ score }}</strong></p>
            <div class="completion-actions">
              <button @click="restartGame" class="play-again-btn">
                🔄 Spela igen
              </button>
              <button @click="goBack" class="back-btn">
                🏠 Tillbaka till dashboard
              </button>
              <button @click="goToAllResults" class="action-btn results-btn">
                📊 Se alla resultat
              </button>
            </div>
          </div>
        </div>

      <!-- Current Matches -->
      <div v-if="!loading && !allMatched" class="current-matches">
        <p>Matchade: {{ matchedCount }} av {{ wordPairs.length }}</p>
        <div class="matches-progress">
          <div class="matches-fill" :style="matchesProgressStyle"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MatchPractice',
  data() {    return {
      score: 0,
      time: 0,
      timer: null,
      draggedWord: null,
      draggedType: null,
      wordPairs: [],
      swedishWords: [],
      englishWords: [],
      loading: false,
      allWords: [], // Lagra alla ord från databasen
      results: [],
      latestScore: null, // 👈 ekledik
    total: null,       // 👈 ekledik
        practiceFinished: false // ✅ eksik olan bu

    }
  },
  computed: {
    
    formattedTime() {
      const minutes = Math.floor(this.time / 60);
      const seconds = this.time % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },
  
     isResultsMode() {
      return this.$route.path.includes("results");
    },
    allMatched() {
      return this.swedishWords.every(word => word.matched) && 
             this.englishWords.every(word => word.matched);
    },
    matchedCount() {
      return this.swedishWords.filter(word => word.matched).length;
    },
    matchesProgressStyle() {
      const progress = (this.matchedCount / this.wordPairs.length) * 100;
      return { width: `${progress}%` };
    }
  },
  methods: {
    // Fisher-Yates shuffle function
    shuffleArray(array) {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    },

    formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
},


    async loadWordsFromDatabase() {
      this.loading = true;
      try {
        // Hämta alla ord från databasen
        const response = await fetch('http://localhost:9001/api/words');
        if (!response.ok) throw new Error('Kunde inte hämta ord från databasen');
        
        this.allWords = await response.json();
        
        if (this.allWords.length === 0) {
          throw new Error('Inga ord hittades i databasen');
        }

        // Initiera spelet med databasorden
        this.initGame();

      } catch (error) {
        console.error('Error loading words from database:', error);
        this.useFallbackWords();
      } finally {
        this.loading = false;
      }
    },

    async finishPractice() {
        clearInterval(this.timer);


  const resultData = {
    userId: 1,
    score: this.score,
    total: this.wordPairs.length,
    duration_seconds: this.time,
    quiz_type: "match"    
  };

  try {
    const res = await fetch("http://localhost:9001/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resultData)
    });
    if (res.ok) console.log("Result saved ✅");
  } catch (err) {
    console.error("Error saving match result:", err);
  }
},
goToAllResults() {
    if (this.timer) clearInterval(this.timer); // ✅ sonuç sayfasına giderken durdur

      this.$router.push("/practice/match/results");
    },

    useFallbackWords() {
      const fallbackWordPairs = [
        { swedish: "Hej", english: "Hello" },
        { swedish: "Tack", english: "Thank you" },
        { swedish: "Äpple", english: "Apple" },
        { swedish: "Vatten", english: "Water" },
        { swedish: "Bok", english: "Book" },
        { swedish: "Hus", english: "House" },
        { swedish: "Katt", english: "Cat" },
        { swedish: "Hund", english: "Dog" },
        { swedish: "Skola", english: "School" },
        { swedish: "Bil", english: "Car" },
        { swedish: "Familj", english: "Family" },
        { swedish: "Mat", english: "Food" }
      ];

      // Spara fallback-orden så vi kan använda dem i initGame
      this.allWords = fallbackWordPairs.map(pair => ({
        swedish: pair.swedish,
        english: pair.english
      }));

      this.initGame();
      console.log('Använder fallback-ord för matchningsspel');
    },

    async loadPastResults() {
    this.loading = true;
    try {
      const userId = 1;
        const response = await fetch(`http://localhost:9001/api/results/${userId}`);
        if (!response.ok) throw new Error("Kunde inte hämta resultat");
        const data = await response.json();
        console.log("RESULTS FROM BACKEND:", data);
        this.results = data
          .filter(r => !r.quiz_type || r.quiz_type === "match")
          .sort((a, b) => new Date(b.date) - new Date(a.date));
      } catch (err) {
        console.error("❌ Fel vid hämtning av resultat:", err);
        this.results = [];
      } finally {
        this.loading = false;
      }
    },

    initGame() {
      // Reset game state
      this.score = 0;
      this.time = 0;
      
      // Get random word pairs from database (8 pairs)
      this.wordPairs = this.shuffleArray([...this.allWords]).slice(0, 8).map(word => ({
        swedish: word.swedish,
        english: word.english
      }));
      
      // Prepare words for each column
      this.swedishWords = this.wordPairs.map(pair => ({
        text: pair.swedish,
        match: pair.english,
        matched: false,
        id: Math.random().toString(36).substr(2, 9)
      }));
      
      this.englishWords = this.shuffleArray(this.wordPairs.map(pair => ({
        text: pair.english,
        match: pair.swedish, 
        matched: false,
        id: Math.random().toString(36).substr(2, 9)
      })));
      if (!this.isResultsMode) {

      // Start timer
      this.startTimer();}
    },

    startTimer() {
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.timer = setInterval(() => {
        this.time++;
      }, 1000);
    },

    dragStart(event, word, type) {
      if (word.matched) {
        event.preventDefault();
        return;
      }
      this.draggedWord = word;
      this.draggedType = type;
      event.dataTransfer.setData('text/plain', word.text);
      event.dataTransfer.effectAllowed = 'move';
    },

    dragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    },

   async drop(event, targetWord) {
      event.preventDefault();
      
      if (!this.draggedWord || this.draggedWord.matched || targetWord.matched) {
        return;
      }
      
      let isCorrect = false;
      
      // Check if match is correct
      if (this.draggedType === 'swedish' && this.draggedWord.match === targetWord.text) {
        isCorrect = true;
      } 
      else if (this.draggedType === 'english' && this.draggedWord.match === targetWord.text) {
        isCorrect = true;
      }
      
      if (isCorrect) {
        // Correct match
        this.draggedWord.matched = true;
        targetWord.matched = true;
        this.score += 10;
        
        // Bonus for speed
        if (this.time < 30) {
          this.score += 5; // Speed bonus
        }
        
        // Check if game is complete
        if (this.allMatched) {
          clearInterval(this.timer);
            if (this.time < 30) this.score += 20; // bitirme bonusu

           this.practiceFinished = true;
            await this.finishPractice();
         // this.saveProgress();
        }
      } else {
        // Incorrect match - small penalty
        this.score = Math.max(0, this.score - 2);
      }
      
      this.draggedWord = null;
      this.draggedType = null;
    },

    dragEnd() {
      this.draggedWord = null;
      this.draggedType = null;
    },

    restartGame() {
      clearInterval(this.timer);
        this.practiceFinished = false; // ✅ ekle

      this.initGame();
    },

    saveProgress() {
      const progress = JSON.parse(localStorage.getItem('learningProgress') || '{}');
      progress.matchingPractice = (progress.matchingPractice || 0) + 1;
      progress.learnedWords = Math.min(125, (progress.learnedWords || 0) + this.wordPairs.length);
      localStorage.setItem('learningProgress', JSON.stringify(progress));
    },

    goBack() {
      clearInterval(this.timer);
      this.$router.back();
    }
  },
  //async mounted() {
    //await this.loadWordsFromDatabase();
  //},
 async mounted() {
    if (this.timer) clearInterval(this.timer); // ✅ timer reset eklendi


  if (this.isResultsMode) {
    const latestScore = this.$route.query.latestScore;
    const total = this.$route.query.total;

    // Her zaman geçmiş sonuçları yükle
    if (typeof this.loadPastResults === "function") {
      await this.loadPastResults();
    }

    // Yeni sonuç varsa en üste ekle
    if (latestScore && total) {
      this.results.unshift({
        date: new Date(),
        score: Number(latestScore),
        total: Number(total)
      });
    }
  } else {
    await this.loadWordsFromDatabase();
  }
}
,watch: {
  // route veya query değiştiğinde çalışır
  '$route.path'(newPath) {
    if (this.timer) clearInterval(this.timer); // her geçişte önce bir durdur
    this.time = 0;

    if (!newPath.includes('results')) {
      // pratik sayfasına döndüysek tekrar başlat
      this.startTimer();
    }
  }
},



  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
  ,
}
</script>

<style scoped>
/* Lägg till laddningsstilar */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-bubble {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: white;
  padding: 40px;
  border-radius: 25px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(78, 205, 196, 0.3);
}

.loading-emoji {
  font-size: 4em;
  margin-bottom: 20px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-bubble h3 {
  margin: 0 0 15px 0;
  font-size: 1.5em;
}

.loading-bubble p {
  margin: 0;
  opacity: 0.9;
}

/* Behåll alla ursprungliga CSS-stilar */
.practice-page {
  min-height: 100vh;
  background-color: #f7f3ed;
  padding: 20px;
  font-family: 'Comic Sans MS', 'Marker Felt', cursive, sans-serif;
}

.practice-container {
  max-width: 900px;
  margin: 0 auto;
}

.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.back-btn {
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  transform: translateX(-3px);
  box-shadow: 0 5px 15px rgba(255,107,107,0.3);
}

.progress-info h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.8em;
}

.game-stats {
  margin: 0;
  color: #666;
  font-size: 1.1em;
}

.instructions {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: white;
  padding: 15px 20px;
  border-radius: 15px;
  margin-bottom: 25px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(78,205,196,0.3);
}

.instructions p {
  margin: 0;
  font-size: 1.1em;
}

.matching-game {
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.columns-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.column h3 {
  text-align: center;
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.4em;
  padding: 10px;
  background: rgba(0,0,0,0.05);
  border-radius: 10px;
}

.words-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.word-item {
  background: #f8f9fa;
  border: 3px solid #E2E8F0;
  padding: 15px 20px;
  border-radius: 12px;
  cursor: grab;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 1.1em;
}

.word-item:hover:not(.matched) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-color: #4ECDC4;
}

.word-item.matched {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: white;
  border-color: #4ECDC4;
  cursor: default;
  transform: scale(0.98);
}

.word-item.dragging {
  opacity: 0.6;
  transform: scale(0.95);
}

.word-item.drop-zone {
  border-style: dashed;
  border-color: #FF9A8B;
  background: rgba(255,154,139,0.1);
}

.word-text {
  flex: 1;
}

.match-check {
  font-size: 1.2em;
}

.completion-message {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.5s ease-out;
}

.success-bubble {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: white;
  padding: 40px;
  border-radius: 25px;
  text-align: center;
  max-width: 400px;
  animation: bounceIn 0.8s ease-out;
  box-shadow: 0 10px 25px rgba(78, 205, 196, 0.3);
}

.play-again-btn,
.back-btn,
.action-btn.results-btn {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 20px;
  padding: 12px 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;              /* 🟢 ikon + yazı hizalama */
  align-items: center;        /* dikey ortalama */
  justify-content: center;    /* 🟢 yatay ortalama */
  gap: 8px;                   /* ikon ve metin arası mesafe */
  text-align: center;       
}

.play-again-btn:hover,
.back-btn:hover,
.action-btn.results-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.08);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
}

/* Başlık ve ikon uyumu */
.success-emoji {
  font-size: 3.5em;
  margin-bottom: 15px;
}

.success-bubble h3 {
  font-size: 2em;
  margin-bottom: 10px;
  font-weight: bold;
}

.final-score {
  font-size: 1.3em;
  font-weight: bold;
  margin-top: 5px;
}

.completion-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  
}


.current-matches {
  background: white;
  padding: 15px 20px;
  border-radius: 15px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.current-matches p {
  margin: 0 0 10px 0;
  color: #333;
  font-weight: bold;
  text-align: center;
}

.matches-progress {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.matches-fill {
  height: 100%;
  background: linear-gradient(135deg, #FF9A8B, #FF6A88);
  transition: width 0.5s ease;
}

.results-page {
  text-align: center;
  padding: 40px 20px;
}

.results-title {
  font-size: 1.8em;
  margin-bottom: 25px;
}

.results-table {
  width: 100%;
  max-width: 600px;
  margin: 0 auto 30px;
  border-collapse: collapse;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.results-table th, .results-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}

.results-table th {
  background: #4ECDC4;
  color: white;
}

.results-table tr:last-child td {
  border-bottom: none;
}

.no-results {
  color: #666;
  font-style: italic;
  margin-bottom: 20px;
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

/* Responsive design */
@media (max-width: 768px) {
  .practice-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .columns-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .success-bubble {
    margin: 20px;
    padding: 30px 20px;
  }
  
  .completion-actions {
    flex-direction: column;
  }
}
</style>