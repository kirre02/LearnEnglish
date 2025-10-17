<template>
  <div class="practice-page match-practice">
    <div class="practice-container">
      <!-- Header -->
      <div class="practice-header">
        <button @click="goBack" class="back-btn">← Tillbaka</button>
        <div class="progress-info">
          <h2>🔄 Matcha orden!</h2>
          <p class="game-stats">Poäng: <strong>{{ score }}</strong> | Tid: <strong>{{ formattedTime }}</strong></p>
        </div>
      </div>

      <!-- Game Instructions -->
      <div class="instructions">
        <p>💡 <strong>Dra</strong> orden från ena kolumnen till den andra för att matcha rätt par!</p>
      </div>

      <!-- Matching Game -->
      <div class="matching-game">
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

        <!-- Completion Message -->
        <div v-if="allMatched" class="completion-message">
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
            </div>
          </div>
        </div>
      </div>

      <!-- Current Matches -->
      <div v-if="!allMatched" class="current-matches">
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
  data() {
    // Fisher-Yates shuffle function
    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // All word pairs
    const allWordPairs = [
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

    return {
      score: 0,
      time: 0,
      timer: null,
      draggedWord: null,
      draggedType: null,
      wordPairs: shuffleArray(allWordPairs).slice(0, 8), // Random 8 pairs
      swedishWords: [],
      englishWords: [],
      shuffleArray: shuffleArray,
      allWordPairs: allWordPairs
    }
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.time / 60);
      const seconds = this.time % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
    initGame() {
      // Reset game state
      this.score = 0;
      this.time = 0;
      
      // Get new random word pairs
      this.wordPairs = this.shuffleArray([...this.allWordPairs]).slice(0, 8);
      
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
      
      // Start timer
      this.startTimer();
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
    drop(event, targetWord) {
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
          this.saveProgress();
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
  mounted() {
    this.initGame();
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
</script>

<style scoped>
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
  background: linear-gradient(135deg, #FFD700, #FF8E00);
  color: white;
  padding: 40px;
  border-radius: 25px;
  text-align: center;
  max-width: 400px;
  animation: bounceIn 0.8s ease-out;
}

.success-emoji {
  font-size: 4em;
  margin-bottom: 15px;
}

.success-bubble h3 {
  margin: 0 0 10px 0;
  font-size: 1.8em;
}

.success-bubble p {
  margin: 0 0 15px 0;
  font-size: 1.1em;
}

.final-score {
  font-size: 1.3em !important;
  font-weight: bold;
}

.completion-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.play-again-btn {
  background: rgba(255,255,255,0.2);
  border: 2px solid white;
  color: white;
  padding: 12px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1em;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.play-again-btn:hover {
  background: white;
  color: #FF8E00;
  transform: scale(1.05);
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