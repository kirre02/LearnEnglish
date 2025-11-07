<template>
  <div class="practice-page match-practice">
    <div class="practice-container">
      <div v-if="!isResultsMode" class="practice-header">
        <button @click="handleBack" class="back-btn">
          {{ showDashboardButton ? '🏠 Dashboard' : '← Tillbaka' }}
        </button>
        <div class="progress-info">
          <h2>🔄 Matcha orden! Nivå {{ currentLevel }}</h2>
          <p class="game-stats">Poäng: <strong>{{ score }}</strong> | Tid: <strong>{{ formattedTime }}</strong> | Matchade: {{ matchedCount }}/{{ currentWordCount }}</p>
        </div>
        <div class="header-controls">
          <button v-if="!gameStarted && !practiceFinished" @click="startGame" class="start-btn">
            ▶️ Starta Spelet
          </button>
          <button v-if="gameStarted && !practiceFinished && !levelCompleted" @click="pauseGame" class="pause-btn">
            ⏸️ Pausa
          </button>
          <button v-if="isPaused" @click="resumeGame" class="resume-btn">
            ▶️ Fortsätt
          </button>
          <button v-if="gameStarted && !practiceFinished" @click="confirmQuit" class="quit-btn">
            ❌ Avsluta
          </button>
        </div>
      </div>

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
              <td>{{ formatDuration(r.duration_seconds) }}</td>
            </tr>
          </tbody>
        </table>

        <p v-else class="no-results">Inga resultat ännu. Gör en matchningsövning först 🧩</p>

        <div class="results-actions">
          <button @click="goToDashboard" class="action-btn dashboard-btn">🏠 Dashboard</button>
          <button @click="goBack" class="action-btn back-btn">← Tillbaka</button>
        </div>
      </div>

      <div v-if="!isResultsMode && !gameStarted && !practiceFinished" class="start-screen">
        <div class="start-bubble">
          <div class="start-emoji">🎮</div>
          <h3>Redo att matcha ord? 🧩</h3>
          <p class="start-description">Välj svårighetsgrad och börja spelet när du är redo!</p>
          
          <div class="level-selection">
            <h4>Välj nivå:</h4>
            <div class="level-options">
              <div 
                v-for="level in 3" 
                :key="level"
                class="level-option"
                :class="{ 
                  'selected': currentLevel === level,
                  'easy': level === 1,
                  'medium': level === 2,
                  'hard': level === 3
                }"
                @click="currentLevel = level"
              >
                <div class="level-header">
                  <span class="level-number">Nivå {{ level }}</span>
                  <span class="level-check" v-if="currentLevel === level">✓</span>
                </div>
                <div class="level-info">
                  <span class="word-count">{{ getWordCount(level) }} ordpar</span>
                  <span class="difficulty">{{ getDifficultyText(level) }}</span>
                </div>
                <div class="level-difficulty">
                  <div class="difficulty-dots">
                    <span 
                      v-for="dot in 3" 
                      :key="dot"
                      class="difficulty-dot"
                      :class="{ 
                          'active': dot <= level,
                          'easy': dot === 1,
                          'medium': dot === 2,
                          'hard': dot === 3 
                      }"
                    ></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="selected-level-info" v-if="currentLevel">
            <div class="selected-badge">
              <span class="selected-text">Vald nivå:</span>
              <span class="selected-level">Nivå {{ currentLevel }} - {{ getDifficultyText(currentLevel) }}</span>
            </div>
          </div>

          <div class="start-actions">
            <button @click="startGame" class="start-game-btn pulse">
              <span class="btn-emoji">▶️</span>
              <span class="btn-text">Starta Spelet</span>
            </button>
            <button @click="goToDashboard" class="dashboard-btn">
              <span class="btn-emoji">🏠</span>
              <span class="btn-text">Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading && !isResultsMode" class="loading-container">
        <div class="loading-bubble">
          <div class="loading-emoji">⏳</div>
          <h3>Hämtar ord...</h3>
          <p>Var god vänta medan vi förbereder ditt matchningsspel!</p>
        </div>
      </div>

      <div v-if="!loading && !isResultsMode && gameStarted && !practiceFinished" class="level-progress">
        <div class="level-indicators">
          <div 
            v-for="level in 3" 
            :key="level" 
            class="level-indicator"
            :class="{ 
              'active': level === currentLevel,
              'completed': level < currentLevel
            }"
          >
            {{ level }}
          </div>
        </div>
        <p class="level-info">Nivå {{ currentLevel }}: Matcha {{ currentWordCount }} ordpar</p>
      </div>

      <div v-if="!isResultsMode && gameStarted && !practiceFinished && !levelCompleted && !isPaused" class="instructions">
        <p>💡 <strong>Dra</strong> orden från ena kolumnen till den andra för att matcha rätt par!</p>
      </div>

      <div v-if="isPaused && !isResultsMode" class="pause-overlay">
        <div class="pause-bubble">
          <div class="pause-emoji">⏸️</div>
          <h3>Spelet är pausat</h3>
          <p>Tid: {{ formattedTime }} | Poäng: {{ score }}</p>
          <div class="pause-actions">
            <button @click="resumeGame" class="resume-btn">▶️ Fortsätt</button>
            <button @click="restartLevel" class="restart-btn">🔄 Starta om nivån</button>
            <button @click="confirmQuit" class="quit-btn">❌ Avsluta spelet</button>
          </div>
        </div>
      </div>

      <div v-if="!loading && !isResultsMode && gameStarted && !practiceFinished && !isPaused" class="matching-game">
        <div v-if="showFeedback" class="feedback-animation" :class="feedbackType">
          <div class="feedback-emoji">{{ feedbackEmoji }}</div>
          <div class="feedback-text">{{ feedbackText }}</div>
        </div>

        <div class="columns-container">
          <div class="column swedish-column">
            <h3>Svenska 🇸🇪</h3>
            <div class="words-list">
              <div 
                v-for="(word, index) in swedishWords" 
                :key="'sv-' + index"
                class="word-item"
                :class="{ 
                  matched: word.matched,
                  dragging: word === draggedWord,
                  'correct-match': word.matched && word.recentlyMatched,
                  'wrong-match': word.wrongMatch
                }"
                @dragstart="dragStart($event, word, 'swedish')"
                @dragend="dragEnd"
                draggable="true"
              >
                <span class="word-text">{{ word.text }}</span>
                <span v-if="word.matched" class="match-check">✅</span>
                <span v-if="word.wrongMatch" class="wrong-check">❌</span>
              </div>
            </div>
          </div>

          <div class="column english-column">
            <h3>Engelska 🇬🇧</h3>
            <div class="words-list">
              <div 
                v-for="(word, index) in englishWords" 
                :key="'en-' + index"
                class="word-item"
                :class="{ 
                  matched: word.matched,
                  'drop-zone': !word.matched,
                  'correct-match': word.matched && word.recentlyMatched,
                  'wrong-match': word.wrongMatch
                }"
                @dragstart="dragStart($event, word, 'english')"
                @dragover="dragOver"
                @drop="drop($event, word)"
                @dragend="dragEnd"
                draggable="true"
              >
                <span class="word-text">{{ word.text }}</span>
                <span v-if="word.matched" class="match-check">✅</span>
                <span v-if="word.wrongMatch" class="wrong-check">❌</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!isResultsMode && levelCompleted && !practiceFinished" class="level-completion-overlay">
        <div class="level-completion-bubble">
          <div class="level-completion-header">
            <span class="level-completion-emoji">🎉🏆✨</span>
            <h3 class="level-completion-title">Grattis! Nivå {{ currentLevel }} klar!</h3>
            <span class="level-completion-emoji">✨🏆🎉</span>
          </div>
          <p class="level-completion-text">Du matchade alla <strong class="highlight-text">{{ currentWordCount }}</strong> ord på <strong class="highlight-text">{{ formattedTime }}</strong>!</p>
          <p class="level-completion-score">Poäng denna nivå: <strong class="score-value">{{ levelScore }}</strong></p>
          
          <div class="celebration-animation-container">
            <div class="confetti-burst"></div>
            <div class="star-burst"></div>
            <div class="sparkle-fade"></div>
          </div>
          
          <div class="level-completion-actions">
            <button 
              v-if="currentLevel < 3" 
              @click="nextLevel" 
              class="action-btn next-level-btn pulse-effect"
            >
              <span class="button-icon">🌟</span> Gå till nivå {{ currentLevel + 1 }} <span class="button-icon">🌟</span>
            </button>
            <button 
              v-else 
              @click="finishGame" 
              class="action-btn finish-game-btn pulse-effect"
            >
              <span class="button-icon">🏅</span> Avsluta spelet <span class="button-icon">🏅</span>
            </button>
            <button @click="restartLevel" class="action-btn restart-level-btn">
              <span class="button-icon">🔄</span> Spela om denna nivå
            </button>
            <button @click="quitToDashboard" class="action-btn quit-to-dashboard-btn">
              <span class="button-icon">🏠</span> Avsluta till Dashboard
            </button>
          </div>
        </div>
      </div>

      <div v-if="!isResultsMode && practiceFinished" class="completion-message">
        <div class="success-bubble">
          <div class="success-emoji">🏆</div>
          <h3>Fantastiskt jobbat! Alla nivåer klara! 🎉</h3>
          <p>Totalt matchade: {{ totalMatchedWords }} ord på {{ formattedTime }}</p>
          <p class="final-score">Slutpoäng: <strong>{{ score }}</strong></p>
          
          <div class="big-celebration">
            <div class="celebration-item">🎊</div>
            <div class="celebration-item">🎉</div>
            <div class="celebration-item">✨</div>
            <div class="celebration-item">🥳</div>
            <div class="celebration-item">👏</div>
          </div>
          
          <div class="completion-actions">
            <button @click="restartGame" class="play-again-btn pulse">
              🔄 Spela igen från början
            </button>
            <button @click="goToAllResults" class="action-btn results-btn">
              📊 Se alla resultat
            </button>
            <button @click="quitToDashboard" class="quit-btn">
              🏠 Tillbaka till dashboard
            </button>
          </div>
        </div>
      </div>

      <div v-if="!loading && gameStarted && !practiceFinished && !levelCompleted && !isPaused" class="current-matches">
        <div class="matches-progress">
          <div class="matches-fill" :style="matchesProgressStyle"></div>
        </div>
        <p>Matchade: {{ matchedCount }} av {{ currentWordCount }}</p>
      </div>
    </div>

    <div v-if="showQuitConfirm" class="modal-overlay">
      <div class="confirm-modal">
        <div class="modal-emoji">⚠️</div>
        <h3>Avsluta spelet?</h3>
        <p>Är du säker på att du vill avsluta? Dina framsteg i denna omgång kommer att försvinna.</p>
        <div class="modal-actions">
          <button @click="quitGame" class="confirm-btn quit-btn">Ja, avsluta</button>
          <button @click="showQuitConfirm = false" class="cancel-btn">Avbryt</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'MatchPractice',
  data() {
    return {
      score: 0,
      time: 0,
      timer: null,
      draggedWord: null,
      draggedType: null,
      wordPairs: [],
      swedishWords: [],
      englishWords: [],
      loading: false,
      allWords: [],
      results: [],
      latestScore: null,
      total: null,
      practiceFinished: false,
      currentLevel: 1,
      levelCompleted: false,
      levelScore: 0,
      totalMatchedWords: 0,
      gameStarted: false,
      isPaused: false,
      showQuitConfirm: false,
      showDashboardButton: true,
      showFeedback: false,
      feedbackType: '',
      feedbackText: '',
      feedbackEmoji: '',
      feedbackTimer: null
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
    
    currentWordCount() {
      const wordCounts = { 1: 3, 2: 6, 3: 9 };
      return wordCounts[this.currentLevel] || 3;
    },
    
    allMatched() {
      return this.swedishWords.every(word => word.matched) && 
             this.englishWords.every(word => word.matched);
    },
    
    matchedCount() {
      return this.swedishWords.filter(word => word.matched).length;
    },
    
    matchesProgressStyle() {
      const progress = (this.matchedCount / this.currentWordCount) * 100;
      return { width: `${progress}%` };
    }
  },
  methods: {
    // --- HJÄLPFUNKTIONER ---

    getWordCount(level) {
      const counts = { 1: 3, 2: 6, 3: 9 };
      return counts[level] || 3;
    },

    getDifficultyText(level) {
      const difficulties = { 1: "Lätt", 2: "Medel", 3: "Svår" };
      return difficulties[level] || "Lätt";
    },

    formatDuration(seconds) {
      if (!seconds && seconds !== 0) return "-";
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    },

    shuffleArray(array) {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    },

    showVisualFeedback(type, message, emoji) {
      this.showFeedback = true;
      this.feedbackType = type;
      this.feedbackText = message;
      this.feedbackEmoji = emoji;
      
      if (this.feedbackTimer) {
        clearTimeout(this.feedbackTimer);
      }
      
      this.feedbackTimer = setTimeout(() => {
        this.showFeedback = false;
      }, 1500);
    },

    scrollToCompletion() {
      this.$nextTick(() => {
        setTimeout(() => {
          const completionElement = document.querySelector('.level-completion, .completion-message');
          if (completionElement) {
            completionElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
        }, 300);
      });
    },

    // --- DATALADDNING & NIVÅFÖRBEREDELSE ---

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
        { swedish: "Mat", english: "Food" },
        { swedish: "Stol", english: "Chair" },
        { swedish: "Fönster", english: "Window" },
        { swedish: "Dörr", english: "Door" }
      ];

      this.allWords = fallbackWordPairs.map(pair => ({
        swedish: pair.swedish,
        english: pair.english
      }));

      this.prepareLevel();
      console.log('Använder fallback-ord för matchningsspel');
    },

    async loadWordsFromDatabase() {
      this.loading = true;
      try {
        const response = await fetch('http://localhost:9001/api/words');
        if (!response.ok) throw new Error('Kunde inte hämta ord från databasen');
        
        this.allWords = await response.json();
        
        if (this.allWords.length === 0) {
          throw new Error('Inga ord hittades i databasen');
        }

        this.prepareLevel();

      } catch (error) {
        console.error('Error loading words from database:', error);
        this.useFallbackWords();
      } finally {
        this.loading = false;
      }
    },

    prepareLevel() {
      this.levelCompleted = false;
      this.levelScore = 0;
      
      this.wordPairs = this.shuffleArray([...this.allWords])
        .slice(0, this.currentWordCount)
        .map(word => ({
          swedish: word.swedish,
          english: word.english
        }));
      
      this.swedishWords = this.wordPairs.map(pair => ({
        text: pair.swedish,
        match: pair.english,
        matched: false,
        recentlyMatched: false,
        wrongMatch: false,
        id: Math.random().toString(36).substr(2, 9)
      }));
      
      this.englishWords = this.shuffleArray(this.wordPairs.map(pair => ({
        text: pair.english,
        match: pair.swedish, 
        matched: false,
        recentlyMatched: false,
        wrongMatch: false,
        id: Math.random().toString(36).substr(2, 9)
      })));
    },

    // --- SPELKONTROLLER & TIMER ---

    startGame() {
      this.gameStarted = true;
      this.showDashboardButton = false;
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

    pauseGame() {
      this.isPaused = true;
      clearInterval(this.timer);
    },

    resumeGame() {
      this.isPaused = false;
      this.startTimer();
    },

    // --- DRAG & DROP LOGIK ---

    dragStart(event, word, type) {
      if (word.matched || this.isPaused) {
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
    
    dragEnd() {
      this.draggedWord = null;
      this.draggedType = null;
    },

    async drop(event, targetWord) {
      event.preventDefault();
      
      if (!this.draggedWord || this.draggedWord.matched || targetWord.matched || this.isPaused) {
        return;
      }
      
      let isCorrect = false;
      
      if (this.draggedWord.match === targetWord.text) {
        isCorrect = true;
      } 
      
      if (isCorrect) {
        // RÄTT MATCH
        this.draggedWord.matched = true;
        targetWord.matched = true;
        
        this.draggedWord.recentlyMatched = true;
        targetWord.recentlyMatched = true;
        
        setTimeout(() => {
          this.draggedWord.recentlyMatched = false;
          targetWord.recentlyMatched = false;
        }, 1000);
        
        // Poängberäkning
        const basePoints = 10;
        const levelMultiplier = this.currentLevel;
        const points = basePoints * levelMultiplier;
        this.score += points;
        this.levelScore += points;
        
        // Speed bonus
        if (this.time < 30 * this.currentLevel) {
          const speedBonus = 5 * this.currentLevel;
          this.score += speedBonus;
          this.levelScore += speedBonus;
        }
        
        this.showVisualFeedback('correct', `+${points} poäng!`, '🎉');
        
        if (this.allMatched) {
          clearInterval(this.timer);
          
          const completionBonus = 20 * this.currentLevel;
          this.score += completionBonus;
          this.levelScore += completionBonus;
          
          this.totalMatchedWords += this.currentWordCount;
          this.levelCompleted = true;
          
          this.scrollToCompletion();
          
          if (this.currentLevel === 3) {
            // Avsluta spelet automatiskt om sista nivån är klar
            await this.finishPractice();
          }
        }
      } else {
        // FEL MATCH
        this.draggedWord.wrongMatch = true;
        targetWord.wrongMatch = true;
        
        setTimeout(() => {
          this.draggedWord.wrongMatch = false;
          targetWord.wrongMatch = false;
        }, 1000);
        
        // Penalty
        this.score = Math.max(0, this.score - 2);
        this.levelScore = Math.max(0, this.levelScore - 2);
        
        this.showVisualFeedback('wrong', 'Fel match! -2 poäng', '❌');
      }
      
      this.draggedWord = null;
      this.draggedType = null;
    },

    // --- NIVÅ/SPEL-HANTERING ---

    nextLevel() {
      this.currentLevel++;
      this.prepareLevel();
      this.levelCompleted = false;
      
      this.$nextTick(() => {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
      });
      this.startTimer();
    },

    restartLevel() {
      this.score -= this.levelScore;
      this.time = 0;
      this.prepareLevel();
      this.levelCompleted = false;
      this.isPaused = false;
      this.startTimer();
      
      this.$nextTick(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },

    restartGame() {
      clearInterval(this.timer);
      this.practiceFinished = false;
      this.currentLevel = 1;
      this.score = 0;
      this.time = 0;
      this.totalMatchedWords = 0;
      this.gameStarted = false;
      this.showDashboardButton = true;
      this.prepareLevel();
      
      this.$nextTick(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },

    finishGame() {
      this.practiceFinished = true;
      clearInterval(this.timer);
      this.scrollToCompletion();
    },

    // --- NAVIGERING & RESULTAT ---

    confirmQuit() {
      this.pauseGame();
      this.showQuitConfirm = true;
    },

    quitGame() {
      clearInterval(this.timer);
      this.showQuitConfirm = false;
      this.goToDashboard();
    },

    quitToDashboard() {
      clearInterval(this.timer);
      this.goToDashboard();
    },

    goToDashboard() {
      this.$router.push('/dashboard');
    },

    handleBack() {
      if (this.showDashboardButton) {
        this.goToDashboard();
      } else {
        this.goBack();
      }
    },

    goBack() {
      if (this.gameStarted && !this.practiceFinished) {
        this.confirmQuit();
      } else {
        this.$router.back();
      }
    },

    async finishPractice() {
      clearInterval(this.timer);

      const resultData = {
        userId: 1,
        score: this.score,
        total: this.totalMatchedWords,
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
      if (this.timer) clearInterval(this.timer);
      this.$router.push({ 
        path: "/practice/match/results", 
        query: { latestScore: this.score, total: this.totalMatchedWords }
      });
    },

    async loadPastResults() {
      this.loading = true;
      try {
        const userId = 1;
        const response = await fetch(`http://localhost:9001/api/results/${userId}`);
        if (!response.ok) throw new Error("Kunde inte hämta resultat");
        const data = await response.json();
        
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
  },

  // --- LIVSCYKELHAKAR ---

  async mounted() {
    if (this.timer) clearInterval(this.timer);

    if (this.isResultsMode) {
      const latestScore = this.$route.query.latestScore;
      const total = this.$route.query.total;

      await this.loadPastResults();

      if (latestScore && total) {
        this.latestScore = Number(latestScore);
        this.total = Number(total);
      }
    } else {
      await this.loadWordsFromDatabase();
    }
  },

  watch: {
    '$route.path'(newPath) {
      if (this.timer) clearInterval(this.timer);
      this.time = 0;

      if (!newPath.includes('results')) {
        this.gameStarted = false;
        this.showDashboardButton = true;
      }
    }
  },

  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
    }
  }
}
</script>
<style scoped>
/* Nya visuella feedback-stilar */

/* Feedback Animation */
.feedback-animation {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1500;
  padding: 20px 30px;
  border-radius: 50px;
  font-weight: bold;
  font-size: 1.5em;
  animation: popIn 0.5s ease-out, floatUp 1.5s ease-in-out;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.feedback-animation.correct {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: white;
}

.feedback-animation.wrong {
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: white;
}

.feedback-emoji {
  font-size: 2em;
  margin-bottom: 5px;
}

.feedback-text {
  font-size: 1em;
}

@keyframes popIn {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  70% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

@keyframes floatUp {
  0% { transform: translate(-50%, -50%); opacity: 1; }
  100% { transform: translate(-50%, -100%); opacity: 0; }
}

/* Word Item Animations */
.word-item.correct-match {
  animation: correctMatch 1s ease-out;
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.5);
}

.word-item.wrong-match {
  animation: wrongMatch 1s ease-out;
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
}

@keyframes correctMatch {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); background: linear-gradient(135deg, #4ECDC4, #44A08D); color: white; }
  100% { transform: scale(1); }
}

@keyframes wrongMatch {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); background: linear-gradient(135deg, #FF6B6B, #FF8E53); color: white; }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}

.wrong-check {
  font-size: 1.2em;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

/* Celebration Animations */
.celebration {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
}

.confetti {
  font-size: 2em;
  animation: confettiFall 2s ease-in-out infinite;
}

.confetti:nth-child(1) { animation-delay: 0s; }
.confetti:nth-child(2) { animation-delay: 0.3s; }
.confetti:nth-child(3) { animation-delay: 0.6s; }

@keyframes confettiFall {
  0%, 100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.big-celebration {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 30px 0;
}

.celebration-item {
  font-size: 3em;
  animation: celebrationBounce 1.5s ease-in-out infinite;
}

.celebration-item:nth-child(1) { animation-delay: 0s; }
.celebration-item:nth-child(2) { animation-delay: 0.2s; }
.celebration-item:nth-child(3) { animation-delay: 0.4s; }
.celebration-item:nth-child(4) { animation-delay: 0.6s; }
.celebration-item:nth-child(5) { animation-delay: 0.8s; }

@keyframes celebrationBounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.2); }
}

/* Förbättra pulserande knappar */
.play-again-btn.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

/* --- NYA START/LEVEL STILAR --- */

.start-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 40px 20px;
}

.start-bubble {
  background: white;
  padding: 50px;
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 800px;
  width: 100%;
  border: 3px solid #f0f0f0;
}

.start-emoji {
  font-size: 4em;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.start-bubble h3 {
  font-size: 2.2em;
  margin-bottom: 10px;
  color: #333;
  font-weight: bold;
}

.start-description {
  font-size: 1.3em;
  color: #666;
  margin-bottom: 40px;
  line-height: 1.5;
}

.level-selection {
  margin-bottom: 30px;
}

.level-selection h4 {
  font-size: 1.4em;
  margin-bottom: 25px;
  color: #444;
  font-weight: 600;
}

.level-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.level-option {
  background: #f8f9fa;
  border: 3px solid #e9ecef;
  border-radius: 20px;
  padding: 25px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.level-option:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.level-option.selected {
  border-width: 4px;
  transform: scale(1.05);
}

.level-option.easy {
  border-color: #4ECDC4;
  background: linear-gradient(135deg, #f8feff, #e8f7f6);
}

.level-option.easy.selected {
  border-color: #4ECDC4;
  box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.3);
}

.level-option.medium {
  border-color: #FFD93D;
  background: linear-gradient(135deg, #fffef8, #fcf8e8);
}

.level-option.medium.selected {
  border-color: #FFD93D;
  box-shadow: 0 0 0 3px rgba(255, 217, 61, 0.3);
}

.level-option.hard {
  border-color: #FF6B6B;
  background: linear-gradient(135deg, #fff8f8, #fce8e8);
}

.level-option.hard.selected {
  border-color: #FF6B6B;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.3);
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.level-number {
  font-size: 1.4em;
  font-weight: bold;
  color: #333;
}

.level-check {
  background: #4ECDC4;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9em;
  font-weight: bold;
}

.level-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.word-count {
  font-size: 1.1em;
  font-weight: 600;
  color: #555;
}

.difficulty {
  font-size: 1em;
  color: #777;
}

.level-difficulty {
  display: flex;
  justify-content: center;
}

.difficulty-dots {
  display: flex;
  gap: 6px;
}

.difficulty-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e0e0e0;
  transition: all 0.3s ease;
}

/* FIX: Ensure difficulty dots get color based on level */
.level-option.easy .difficulty-dot.active {
  background: #4ECDC4;
}

.level-option.medium .difficulty-dot.active {
  background: #FFD93D;
}

.level-option.hard .difficulty-dot.active {
  background: #FF6B6B;
}
/* END FIX */

.selected-level-info {
  margin-bottom: 30px;
}

.selected-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: white;
  padding: 15px 25px;
  border-radius: 25px;
  font-weight: 600;
}

.selected-text {
  font-size: 1em;
  opacity: 0.9;
}

.selected-level {
  font-size: 1.1em;
  font-weight: bold;
}

.start-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.start-game-btn, .dashboard-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 35px;
  border: none;
  border-radius: 25px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  justify-content: center;
}

.start-game-btn {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: white;
  box-shadow: 0 8px 25px rgba(78, 205, 196, 0.3);
}

.start-game-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(78, 205, 196, 0.4);
}

.dashboard-btn {
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: white;
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
}

.dashboard-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
}

.btn-emoji {
  font-size: 1.3em;
}

.btn-text {
  font-size: 1.1em;
}

/* Pulse animation för startknappen */
.start-game-btn.pulse {
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0% {
    box-shadow: 0 8px 25px rgba(78, 205, 196, 0.3);
  }
  50% {
    box-shadow: 0 8px 35px rgba(78, 205, 196, 0.6);
  }
  100% {
    box-shadow: 0 8px 25px rgba(78, 205, 196, 0.3);
  }
}

/* --- RESUMING PREVIOUS CSS --- */

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

.header-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.start-btn, .pause-btn, .resume-btn, .quit-btn {
  padding: 8px 15px;
  border-radius: 15px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9em;
}

.start-btn {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: white;
}

.pause-btn {
  background: linear-gradient(135deg, #FFD93D, #FF9A8B);
  color: white;
}

.resume-btn {
  background: linear-gradient(135deg, #6BCF7F, #4ECDC4);
  color: white;
}

.quit-btn {
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: white;
}

.start-btn:hover, .pause-btn:hover, .resume-btn:hover, .quit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  margin: 5px;
}

.play-again-btn:hover,
.action-btn.results-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.08);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
}

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

.action-btn.dashboard-btn {
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.action-btn.dashboard-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255,107,107,0.3);
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
  
  .success-bubble,
  .completion-bubble {
    margin: 20px;
    padding: 30px 20px;
  }
  
  .completion-actions {
    flex-direction: column;
  }
  
  .level-indicators {
    gap: 10px;
  }
  
  .level-indicator {
    width: 35px;
    height: 35px;
    font-size: 1em;
  }
  
  .completion-actions {
    gap: 10px;
  }
  
  .next-level-btn,
  .finish-game-btn {
    padding: 12px 20px;
    font-size: 1em;
  }
}
/* Nya stilar för "Nivå Klar!"-meddelandet */
.level-completion-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7); /* Mörkare overlay */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.4s ease-out;
}

.level-completion-bubble {
  background: linear-gradient(145deg, #FFEFBA, #FFFFFF); /* Mjuk gradient bakgrund */
  color: #333;
  padding: 50px 40px;
  border-radius: 30px;
  text-align: center;
  max-width: 500px;
  width: 90%;
  animation: popInBounce 0.6s ease-out; /* Ny animation */
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25), 0 0 0 5px rgba(255, 255, 255, 0.5) inset;
  border: 4px solid #FFD700; /* Gyllene kant */
  position: relative;
  overflow: hidden; /* För att dölja animationer utanför bubblan */
}

.level-completion-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.level-completion-emoji {
  font-size: 3.5em; /* Större emojis */
  line-height: 1;
  animation: emojiWiggle 2s infinite ease-in-out;
}

.level-completion-emoji:first-child { animation-delay: 0.1s; }
.level-completion-emoji:last-child { animation-delay: 0.3s; }

@keyframes emojiWiggle {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-5deg) scale(1.1); }
  75% { transform: rotate(5deg) scale(1.1); }
}

.level-completion-title {
  font-size: 2.8em; /* Mycket större titel */
  margin: 0;
  font-weight: 800; /* Tjockare text */
  color: #4ECDC4; /* Huvudfärg */
  text-shadow: 2px 2px #333; /* Subtil skugga */
}

.level-completion-text {
  font-size: 1.4em;
  color: #555;
  margin-bottom: 15px;
  line-height: 1.4;
}

.highlight-text {
  font-weight: bold;
  color: #333; /* Mörkare för att stå ut */
}

.level-completion-score {
  font-size: 1.8em;
  font-weight: 700;
  color: #E67E22; /* Kontrastfärg för poäng */
  margin-top: 20px;
  margin-bottom: 40px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.score-value {
  color: #E67E22; /* Matchar poängfärgen */
}

.level-completion-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 30px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px 25px;
  border-radius: 30px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}

.action-btn.next-level-btn {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: white;
}

.action-btn.finish-game-btn {
  background: linear-gradient(135deg, #FFD700, #FFA500); /* Guld/Orange */
  color: white;
}

.action-btn.restart-level-btn {
  background: linear-gradient(135deg, #5D9CEC, #4A7FD6); /* Blå */
  color: white;
}

.action-btn.quit-to-dashboard-btn {
  background: linear-gradient(135deg, #FF6B6B, #FF8E53); /* Röd/Orange */
  color: white;
}

.button-icon {
  font-size: 1.3em;
  line-height: 1;
}

/* Ny puls-effekt för knappar */
.pulse-effect {
  animation: buttonPulse 1.8s infinite;
}

@keyframes buttonPulse {
  0% { transform: scale(1); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
  50% { transform: scale(1.03); box-shadow: 0 8px 20px rgba(0,0,0,0.2); }
  100% { transform: scale(1); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
}

/* Små subtila animationer i bubblan */
.celebration-animation-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Viktigt så att det inte blockerar klick */
  overflow: hidden;
}

.confetti-burst {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 20px solid gold;
  transform-origin: 50% 100%;
  opacity: 0;
  animation: confettiFallDelayed 3s ease-out forwards;
  animation-delay: 0.2s;
}

.confetti-burst::before, .confetti-burst::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: hotpink;
  border-radius: 50%;
  opacity: 0;
  animation: confettiFloat 3s ease-out forwards;
}

.confetti-burst::before {
  top: -15px;
  left: -10px;
  background: deepskyblue;
  animation-delay: 0.4s;
}
.confetti-burst::after {
  top: -10px;
  right: -10px;
  background: limegreen;
  animation-delay: 0.6s;
}

@keyframes confettiFallDelayed {
  0% { transform: translate(-50%, -50%) rotate(0deg) scale(0); opacity: 0; }
  10% { opacity: 1; transform: translate(-50%, -50%) rotate(10deg) scale(1); }
  100% { transform: translate(calc(-50% + 50px), calc(-50% + 150px)) rotate(360deg) scale(0.5); opacity: 0; }
}

@keyframes confettiFloat {
  0% { transform: translateY(0) rotate(0); opacity: 0; }
  50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
  100% { transform: translateY(50px) rotate(360deg); opacity: 0; }
}

.star-burst {
  position: absolute;
  width: 30px;
  height: 30px;
  background: gold;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  opacity: 0;
  animation: starPop 1.5s ease-out forwards;
  left: 20%;
  top: 10%;
  animation-delay: 0.3s;
}

.star-burst:nth-child(2) {
  left: 80%;
  top: 15%;
  background: dodgerblue;
  animation-delay: 0.5s;
}

@keyframes starPop {
  0% { transform: scale(0) rotate(0deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
  100% { transform: scale(0.5) rotate(360deg); opacity: 0; }
}

.sparkle-fade {
  position: absolute;
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 5px 2px rgba(255, 255, 255, 0.8);
  opacity: 0;
  animation: sparkle 1s ease-out forwards;
}

.sparkle-fade:nth-child(1) { left: 10%; top: 5%; animation-delay: 0.1s; }
.sparkle-fade:nth-child(2) { right: 15%; top: 8%; animation-delay: 0.6s; }
.sparkle-fade:nth-child(3) { left: 5%; bottom: 10%; animation-delay: 0.3s; }

@keyframes sparkle {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.5); opacity: 1; }
  100% { transform: scale(0.5); opacity: 0; }
}

/* Modal för avslutningsbekräftelse */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;
}

.confirm-modal {
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  max-width: 450px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: popIn 0.4s ease-out;
  border: 3px solid #FFD93D;
}

.modal-emoji {
  font-size: 3em;
  margin-bottom: 15px;
}

.confirm-modal h3 {
  font-size: 1.8em;
  margin-bottom: 10px;
  color: #333;
}

.confirm-modal p {
  font-size: 1.1em;
  color: #666;
  margin-bottom: 30px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.confirm-btn, .cancel-btn {
  padding: 12px 25px;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.confirm-btn.quit-btn {
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: white;
}

.confirm-btn.quit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
}

.cancel-btn {
  background: #e0e0e0;
  color: #333;
}

.cancel-btn:hover {
  transform: translateY(-2px);
  background: #d0d0d0;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

/* Loading overlay */
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.loading-bubble {
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  max-width: 350px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  border: 3px solid #4ECDC4;
}

.loading-emoji {
  font-size: 3.5em;
  margin-bottom: 15px;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-bubble h3 {
  font-size: 1.8em;
  margin-bottom: 10px;
  color: #333;
}

.loading-bubble p {
  font-size: 1.1em;
  color: #666;
}

/* Level Progress Bar */
.current-matches {
  text-align: center;
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
}

.matches-progress {
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  height: 15px;
  margin-bottom: 10px;
}

.matches-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ECDC4, #6BCF7F);
  border-radius: 10px;
  transition: width 0.5s ease-out;
}

.current-matches p {
  margin: 0;
  font-size: 1em;
  color: #555;
  font-weight: 600;
}

.level-progress {
  margin-bottom: 30px;
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.level-indicators {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
}

.level-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1em;
  transition: all 0.3s ease;
  border: 2px solid #ccc;
}

.level-indicator.active {
  background: linear-gradient(135deg, #FFD93D, #FF9A8B);
  color: white;
  border-color: #FFD93D;
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(255, 217, 61, 0.5);
}

.level-indicator.completed {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: white;
  border-color: #4ECDC4;
  transform: scale(0.95);
  box-shadow: 0 0 5px rgba(78, 205, 196, 0.3);
}

.level-info {
  margin: 0;
  color: #555;
  font-size: 1.1em;
}

/* --- Responsive design --- */
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
  
  .level-completion-bubble,
  .success-bubble,
  .completion-bubble {
    margin: 20px;
    padding: 30px 20px;
  }
  
  .level-completion-title {
    font-size: 2em;
  }

  .level-completion-emoji {
    font-size: 2.5em;
  }

  .level-completion-text,
  .level-completion-score {
    font-size: 1.2em;
  }

  .level-completion-actions {
    flex-direction: column;
  }
  
  .level-indicators {
    gap: 10px;
  }
  
  .level-indicator {
    width: 35px;
    height: 35px;
    font-size: 1em;
  }
  
  .action-btn {
    padding: 12px 20px;
    font-size: 1em;
  }

  .start-bubble {
    padding: 30px 20px;
  }

  .level-options {
    grid-template-columns: 1fr; /* Stacka nivåval på mobiler */
  }

  .start-game-btn, .dashboard-btn {
    width: 100%;
    min-width: unset;
  }

  .modal-actions {
    flex-direction: column;
    gap: 10px;
  }
}
</style>