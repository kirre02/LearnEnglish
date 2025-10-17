<template>
  <div class="practice-page speak-practice">
    <div class="practice-container">
      <div class="practice-header">
        <button @click="goBack" class="back-btn">← Tillbaka</button>
        <div class="progress-info">
          <span class="progress-text">Ord {{ currentWordIndex + 1 }} av {{ words.length }}</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="progressBarStyle"></div>
          </div>
        </div>
      </div>

      <div class="practice-content">
        <div class="word-section">
          <div class="word-card">
            <div class="word-english">
              <h2>{{ currentWord.english }}</h2>
              <button @click="playWordAudio" class="audio-btn" :disabled="audioLoading">
                <span v-if="audioLoading">⏳</span>
                <span v-else>🔊</span>
              </button>
            </div>
            <div class="word-translation">
              <p>{{ currentWord.swedish }}</p>
            </div>
          </div>
        </div>

        <div class="recognition-section">
          <div class="recognition-controls">
            <button 
              @click="toggleRecognition" 
              class="record-btn"
              :class="{ 
                recording: isListening, 
                success: recognitionSuccess,
                error: recognitionError && hasAttempted && !recognitionSuccess
              }"
              :disabled="audioLoading || recognitionLoading"
            >
              <span v-if="recognitionLoading">⏳</span>
              <span v-else-if="isListening" class="pulse-animation">🎤●</span>
              <span v-else-if="recognitionSuccess">✅</span>
              <span v-else-if="recognitionError && hasAttempted">❌</span>
              <span v-else>🎤</span>
            </button>
            
            <div class="recognition-status">
              <p v-if="!hasAttempted && !isListening" class="instruction">
                Tryck på mikrofonen och säg ordet på engelska
              </p>
              <p v-if="isListening" class="listening">
                🎯 Lyssnar... <strong>{{ listeningTime }}s</strong>
              </p>
              <p v-if="userSpeech && !isListening" class="user-speech">
                Du sa: "<strong>{{ userSpeech }}</strong>"
              </p>
              <p v-if="hasAttempted && !isListening && !recognitionSuccess" class="try-again">
                Försök igen! Rätt svar är "<strong>{{ currentWord.english }}</strong>"
              </p>
              <p v-if="recognitionSuccess" class="success">
                🎉 Perfekt! "<strong>{{ userSpeech }}</strong>"
              </p>
            </div>
          </div>

          <div v-if="showFeedback" class="feedback-section">
            <div class="feedback-bubble" :class="feedbackClass">
              <div class="feedback-emoji">{{ feedbackEmoji }}</div>
              <div class="feedback-text">{{ feedbackText }}</div>
              <div class="feedback-actions">
                <button 
                  v-if="!recognitionSuccess"
                  @click="tryAgain" 
                  class="action-btn try-again-btn"
                  :class="{ 'try-again-btn-non-success': !recognitionSuccess }"
                >
                  🔄 Försök igen
                </button>
                <button @click="nextWord" class="action-btn next-btn">
                  {{ isLastWord ? 'Avsluta övning' : 'Nästa ord' }} →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="tips-section">
          <div class="tip-bubble">
            <div class="tip-emoji">💡</div>
            <div class="tip-content">
              <strong>Tips för bättre igenkänning:</strong>
              <ul>
                <li>🎯 Tala tydligt och i normal takt</li>
                <li>🔇 Håll bakgrundsljud till minimum</li>
                <li>🎧 Använd headset för bäst resultat</li>
                <li>🗣️ Uttala ordet exakt som det ska låta</li>
              </ul>
            </div>
          </div>
        </div>

        <div v-if="!isSpeechSupported" class="browser-warning">
          <div class="warning-bubble">
            <div class="warning-emoji">⚠️</div>
            <div class="warning-content">
              <strong>Röstigenkänning stöds inte i din webbläsare</strong>
              <p>För bästa resultat, använd Chrome eller Edge. Just nu fungerar endast inspelning utan igenkänning.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SpeakPractice',
  data() {
    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const allWords = [
      { english: "Hello", swedish: "Hej" },
      { english: "Thank you", swedish: "Tack" },
      { english: "Goodbye", swedish: "Hejdå" },
      { english: "Please", swedish: "Snälla" },
      { english: "Sorry", swedish: "Förlåt" },
      { english: "Yes", swedish: "Ja" },
      { english: "No", swedish: "Nej" },
      { english: "Water", swedish: "Vatten" },
      { english: "Food", swedish: "Mat" },
      { english: "Family", swedish: "Familj" },
      { english: "House", swedish: "Hus" },
      { english: "School", swedish: "Skola" },
      { english: "Book", swedish: "Bok" },
      { english: "Car", swedish: "Bil" },
      { english: "Cat", swedish: "Katt" },
      { english: "Dog", swedish: "Hund" }
    ];

    return {
      currentWordIndex: 0,
      audioLoading: false,
      recognitionLoading: false,
      isListening: false,
      hasAttempted: false,
      recognitionSuccess: false,
      recognitionError: false, // Nu mer specifik för ett misslyckat försök
      showFeedback: false,
      listeningTime: 0,
      listeningTimer: null,
      userSpeech: '',
      score: 0,
      words: shuffleArray(allWords).slice(0, 10),
      allWords: allWords,
      shuffleArray: shuffleArray,
      recognition: null,
      isSpeechSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    }
  },
  computed: {
    currentWord() {
      return this.words[this.currentWordIndex];
    },
    isLastWord() {
      return this.currentWordIndex === this.words.length - 1;
    },
    progressBarStyle() {
      const progress = ((this.currentWordIndex + 1) / this.words.length) * 100;
      return { width: `${progress}%` };
    },
    feedbackClass() {
      // Ändra till 'encouraging' om det var ett felaktigt försök
      return this.recognitionSuccess ? 'correct' : 'incorrect'; 
    },
    feedbackEmoji() {
      return this.recognitionSuccess ? '🎉' : '🤔'; // Ändrade '💡' till '🤔' för icke-korrekt
    },
    feedbackText() {
      return this.recognitionSuccess 
        ? 'Perfekt uttal! Bra jobbat!' 
        : `Ljudet var otydligt eller ordet var fel. Det förväntade ordet var: "${this.currentWord.english}"`;
    }
  },
  methods: {
    async playWordAudio() {
      await this.playAudio(this.currentWord.english);
    },
    async playAudio(text) {
      try {
        if (this.audioLoading) return;
        
        this.audioLoading = true;
        
        if ('speechSynthesis' in window) {
          speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          utterance.rate = 0.8;
          utterance.volume = 0.8;
          
          utterance.onend = () => {
            this.audioLoading = false;
          };
          
          utterance.onerror = () => {
            this.audioLoading = false;
          };
          
          speechSynthesis.speak(utterance);
        } else {
          this.audioLoading = false;
        }
      } catch (error) {
        console.error('Ljudfel:', error);
        this.audioLoading = false;
      }
    },
    initSpeechRecognition() {
      if (!this.isSpeechSupported) return null;
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      return recognition;
    },
    async toggleRecognition() {
      if (this.isListening) {
        this.stopRecognition();
      } else {
        await this.startRecognition();
      }
    },
    async startRecognition() {
      if (!this.isSpeechSupported) {
        alert('Röstigenkänning stöds inte i din webbläsare. Prova Chrome eller Edge.');
        return;
      }
      
      try {
        this.recognitionLoading = true;
        this.userSpeech = '';
        this.recognitionSuccess = false;
        this.recognitionError = false;
        this.showFeedback = false; // Dölj feedback vid nytt försök
        
        this.recognition = this.initSpeechRecognition();
        
        if (!this.recognition) {
          throw new Error('Speech recognition not supported');
        }
        
        this.recognition.onstart = () => {
          this.isListening = true;
          this.recognitionLoading = false;
          this.listeningTime = 0;
          this.listeningTimer = setInterval(() => {
            this.listeningTime++;
            // Auto-stop after 5 seconds
            if (this.listeningTime >= 5) {
              this.stopRecognition();
            }
          }, 1000);
        };
        
        this.recognition.onresult = (event) => {
          const speechResult = event.results[0][0].transcript.trim(); // Behåll case för visning
          const normalizedSpeechResult = speechResult.toLowerCase();
          const expectedWord = this.currentWord.english.toLowerCase();
          
          this.userSpeech = speechResult;
          this.hasAttempted = true;
          
          // Använd en enklare jämförelse för engelska ord
          if (normalizedSpeechResult === expectedWord) {
            this.recognitionSuccess = true;
            this.recognitionError = false;
            this.score += 10;
          } else {
            this.recognitionSuccess = false;
            this.recognitionError = true;
            this.score += 2; // Small points for attempting
          }
          
          this.showFeedback = true;
        };
        
        this.recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          this.recognitionSuccess = false;
          this.recognitionError = true;
          if (!this.userSpeech) {
             this.userSpeech = 'Kunde inte höra tydligt...';
          }
          this.hasAttempted = true;
          this.showFeedback = true;
        };
        
        this.recognition.onend = () => {
          this.stopRecognition();
          // Sätt feedback om den inte redan visats av onresult/onerror
          if (!this.showFeedback) {
             this.hasAttempted = true;
             this.recognitionError = true;
             this.showFeedback = true;
          }
        };
        
        this.recognition.start();
        
      } catch (error) {
        console.error('Speech recognition failed:', error);
        this.recognitionLoading = false;
        this.recognitionError = true;
        alert('Kunde inte starta röstigenkänning. Kontrollera mikrofontillåtelser.');
      }
    },
    stopRecognition() {
      if (this.recognition && this.isListening) {
        this.recognition.stop();
      }
      this.isListening = false;
      
      if (this.listeningTimer) {
        clearInterval(this.listeningTimer);
        this.listeningTimer = null;
      }
    },
    tryAgain() {
      this.resetWordState();
    },
    nextWord() {
      if (this.isLastWord) {
        this.finishPractice();
      } else {
        this.currentWordIndex++;
        this.resetWordState();
      }
    },
    resetWordState() {
      this.stopRecognition(); // Säkerställ att igenkänningen stoppas
      this.hasAttempted = false;
      this.recognitionSuccess = false;
      this.recognitionError = false;
      this.showFeedback = false;
      this.userSpeech = '';
      this.listeningTime = 0;
      this.recognitionLoading = false;
    },
    finishPractice() {
      this.saveProgress();
      alert(`Övning avslutad! 🎉\nDu fick ${this.score} poäng för ${this.words.length} ord!`);
      // Simulerar router push - byt ut med din faktiska routelogik
      console.log('Navigera till /dashboard');
      // this.$router.push('/dashboard'); 
    },
    saveProgress() {
      // Simulerar lagring av framsteg
      const progress = JSON.parse(localStorage.getItem('learningProgress') || '{}');
      progress.speakingPractice = (progress.speakingPractice || 0) + 1;
      progress.learnedWords = Math.min(125, (progress.learnedWords || 0) + Math.floor(this.score / 5));
      localStorage.setItem('learningProgress', JSON.stringify(progress));
    },
    goBack() {
      this.stopRecognition();
      // Simulerar router back
      console.log('Gå tillbaka');
      // this.$router.back();
    }
  },
  beforeUnmount() {
    this.stopRecognition();
  },
  // Lägg till created-hook för att initiera recognition
  created() {
    // Initialisera recognition-objektet tidigt
    if (this.isSpeechSupported) {
      this.recognition = this.initSpeechRecognition();
    }
  }
}
</script>

<style scoped>
/* Globals */
.practice-page {
  min-height: 100vh;
  background-color: #f7f3ed;
  padding: 20px;
  font-family: 'Comic Sans MS', 'Marker Felt', cursive, sans-serif;
}

.practice-container {
  max-width: 600px;
  margin: 0 auto;
}

/* Header */
.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.back-btn {
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateX(-5px);
}

.progress-info {
  text-align: right;
}

.progress-text {
  display: block;
  margin-bottom: 5px;
  color: #666;
  font-size: 0.9em;
}

.progress-bar {
  width: 150px;
  height: 8px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  transition: width 0.3s ease;
}

/* Word Section */
.practice-content {
  text-align: center;
}

.word-section {
  margin-bottom: 40px;
}

.word-card {
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.word-english {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 15px;
}

.word-english h2 {
  margin: 0;
  font-size: 2.5em;
  color: #333;
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.audio-btn {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 1.5em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.audio-btn:hover:not(:disabled) {
  transform: scale(1.1);
}

.audio-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.word-translation p {
  margin: 0;
  font-size: 1.3em;
  color: #666;
  font-style: italic;
}

/* Recognition Section - NEW/UPDATED STYLES */
.recognition-section {
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.recognition-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
}

.record-btn {
  background: linear-gradient(135deg, #FF9A8B, #FF6A88);
  border: none;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  font-size: 2em;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(255,154,139,0.3);
}

.record-btn:hover:not(:disabled) {
  transform: scale(1.1);
}

.record-btn.recording {
  background: linear-gradient(135deg, #FF6B6B, #FF5252);
  animation: pulse 1s infinite;
  color: white; /* Ensure text/emoji is white when recording */
}

.record-btn.success {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: white;
}

.record-btn.error {
  background: linear-gradient(135deg, #FF6B6B, #FF5252);
  color: white;
}

.record-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.pulse-animation {
  animation: pulse 0.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.recognition-status p {
  margin: 0;
  font-size: 1.1em;
}

.instruction {
  color: #666;
}

.listening {
  color: #4ECDC4;
  font-weight: bold;
}

.user-speech {
  color: #667eea;
  font-weight: bold;
  background: #f0f4ff;
  padding: 8px 15px;
  border-radius: 10px;
  border-left: 4px solid #667eea;
  display: inline-block;
}

.try-again {
  color: #FF8E53;
}

.success {
  color: #4ECDC4;
  font-weight: bold;
}

/* Feedback Section */
.feedback-section {
  margin-top: 20px;
}

.feedback-bubble {
  padding: 25px;
  border-radius: 20px;
  text-align: center;
  animation: slideUp 0.5s ease-out;
}

.feedback-bubble.correct {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: white;
}

.feedback-bubble.incorrect {
  /* Använder en mer dämpad färg för "inte perfekt" istället för rött */
  background: linear-gradient(135deg, #FFD700, #FF8E00); 
  color: white;
}

.feedback-emoji {
  font-size: 3em;
  margin-bottom: 15px;
}

.feedback-text {
  font-size: 1.2em;
  margin-bottom: 20px;
}

.feedback-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.action-btn {
  border: none;
  padding: 12px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9em;
  transition: all 0.3s ease;
}

.try-again-btn {
  /* Uppdaterade färger för att fungera med incorrect/encouraging bubble */
  background: rgba(255,255,255,0.2); 
  color: white;
  border: 2px solid white;
}

.next-btn {
  background: white;
  color: #333;
}

.action-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

/* Tips Section */
.tips-section {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  margin-bottom: 20px; /* Lägg till lite marginal */
}

.tip-bubble {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  text-align: left;
}

.tip-emoji {
  font-size: 1.5em;
  flex-shrink: 0;
}

.tip-content {
  flex: 1;
}

.tip-content strong {
  display: block;
  margin-bottom: 8px;
  color: #333;
}

.tip-content ul {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.tip-content li {
  margin-bottom: 5px;
  color: #666;
}

/* Browser Warning - NEW/UPDATED STYLES */
.browser-warning {
  background: linear-gradient(135deg, #FFD700, #FF8E00);
  color: white;
  padding: 20px;
  border-radius: 15px;
  margin-top: 20px;
}

.warning-bubble {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  text-align: left;
}

.warning-emoji {
  font-size: 1.5em;
  flex-shrink: 0;
}

.warning-content strong {
  display: block;
  margin-bottom: 5px;
}

.warning-content p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9em;
}


/* Animations */
@keyframes slideUp {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* Media Queries */
@media (max-width: 768px) {
  .practice-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .progress-info {
    text-align: center;
  }
  
  .word-english {
    flex-direction: column;
    gap: 10px;
  }
  
  .feedback-actions {
    flex-direction: column;
  }
}
</style>