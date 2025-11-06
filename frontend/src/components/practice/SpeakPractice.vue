<template>
  <div class="practice-page speak-practice">
    <div class="practice-container">
      <div class="practice-header">
        <button 
          @click="goToPreviousWord" 
          class="back-btn"
          :disabled="currentWordIndex === 0"
        >
          ← Föregående
        </button>
        <div class="progress-info">
          <span class="progress-text">Ord {{ currentWordIndex + 1 }} av {{ words.length }}</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="progressBarStyle"></div>
          </div>
        </div>
        
        <button @click="cancelPractice" class="cancel-btn">
          🏠 Avbryt
        </button>
      </div>

      <!-- Laddningsskärm -->
      <div v-if="loading" class="loading-container">
        <div class="loading-bubble">
          <div class="loading-emoji">⏳</div>
          <h3>Hämtar ord...</h3>
          <p>Var god vänta medan vi förbereder din uttalsövning!</p>
        </div>
      </div>

      <div v-else class="practice-content">
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
              :disabled="audioLoading || recognitionLoading || currentWord.completed"
            >
              <span v-if="recognitionLoading">⏳</span>
              <span v-else-if="isListening" class="pulse-animation">🎤●</span>
              <span v-else-if="recognitionSuccess">✅</span>
              <span v-else-if="recognitionError && hasAttempted">❌</span>
              <span v-else-if="currentWord.completed">🔒</span>
              <span v-else>🎤</span>
            </button>
            
            <div class="recognition-status">
              <p v-if="!hasAttempted && !isListening && !currentWord.completed" class="instruction">
                Tryck på mikrofonen och säg ordet på engelska
              </p>
              
              <!-- Uppspelningsknapp för inspelning -->
              <div v-if="currentWord.completed && currentWord.audioUrl" class="playback-controls">
                <button @click="playRecording(currentWord.audioUrl)" class="play-recording-btn">
                  ▶️ Spela upp ditt uttal
                </button>
              </div>
              
              <p v-if="currentWord.completed" class="completed">
                <span v-if="currentWord.success">✅ Avklarat: Korrekt uttal!</span>
                <span v-else>❌ Avklarat: "<strong>{{ currentWord.userAnswer }}</strong>"</span>
              </p>
              <p v-if="isListening" class="listening">
                🎯 Lyssnar... <strong>{{ listeningTime }}s</strong>
              </p>
              <p v-if="userSpeech && !isListening && !currentWord.completed" class="user-speech">
                Du sa: "<strong>{{ userSpeech }}</strong>"
              </p>
              <p v-if="hasAttempted && !isListening && !recognitionSuccess && !currentWord.completed" class="try-again">
                Försök igen! Rätt svar är "<strong>{{ currentWord.english }}</strong>"
              </p>
              <p v-if="recognitionSuccess && !currentWord.completed" class="success">
                🎉 Perfekt! "<strong>{{ userSpeech }}</strong>"
              </p>
            </div>
          </div>

          <!-- Feedback med auto-focus funktioner -->
          <div v-if="showFeedback && !currentWord.completed" class="feedback-section">
            <div class="feedback-bubble" :class="feedbackClass">
              <div class="feedback-emoji">{{ feedbackEmoji }}</div>
              <div class="feedback-text">{{ feedbackText }}</div>
              <div class="feedback-actions">
                <button 
                  v-if="!recognitionSuccess"
                  @click="tryAgain" 
                  class="action-btn try-again-btn"
                  ref="tryAgainButton"
                  @keydown.enter="tryAgain"
                  @keydown.space="tryAgain"
                  tabindex="0">
                  🔄 Försök igen
                </button>
                <button 
                  @click="nextWord" 
                  class="action-btn next-btn"
                  ref="nextButton"
                  @keydown.enter="nextWord"
                  @keydown.space="nextWord"
                  tabindex="0">
                  {{ isLastWord ? 'Avsluta övning' : 'Nästa ord' }} →
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation controls med auto-focus -->
        <div v-if="currentWord.completed" class="navigation-controls">
          <div class="nav-buttons">
            <button 
              @click="goToPreviousWord" 
              class="nav-btn prev-btn"
              :disabled="currentWordIndex === 0"
              ref="prevButton"
              @keydown.enter="goToPreviousWord"
              @keydown.space="goToPreviousWord"
              tabindex="0"
            >
              ← Föregående ord
            </button>
            <button 
              @click="nextWord" 
              class="nav-btn next-btn"
              ref="nextNavButton"
              @keydown.enter="nextWord"
              @keydown.space="nextWord"
              tabindex="0"
            >
              {{ isLastWord ? 'Avsluta' : 'Nästa ord' }} →
            </button>
            <button 
              v-if="isLastWord" 
              @click="finishPractice" 
              class="nav-btn finish-btn"
              ref="finishButton"
              @keydown.enter="finishPractice"
              @keydown.space="finishPractice"
              tabindex="0"
            >
              🏁 Avsluta övning
            </button>
          </div>
        </div>

        <!-- Tips section med auto-scroll -->
        <div 
          class="tips-section"
          @mousemove="handleMouseMove"
          ref="tipsContainer"
          @mouseleave="stopAutoScroll"
        >
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
    return {
      currentWordIndex: 0,
      audioLoading: false,
      recognitionLoading: false,
      isListening: false,
      hasAttempted: false,
      recognitionSuccess: false,
      recognitionError: false,
      showFeedback: false,
      listeningTime: 0,
      listeningTimer: null,
      userSpeech: '',
      score: 0,
      words: [],
      loading: true,
      allWords: [], // Lagra alla ord från databasen
      recognition: null,
      mediaRecorder: null,
      audioChunks: [],
      isSpeechSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      
      // DATA FÖR AUTO-SCROLL
      autoScrollSpeed: 4,
      isAutoScrolling: false,
      scrollAnimation: null,
      scrollSpeed: 0,
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
      return this.recognitionSuccess ? 'correct' : 'incorrect'; 
    },
    feedbackEmoji() {
      return this.recognitionSuccess ? '🎉' : '🤔';
    },
    feedbackText() {
      return this.recognitionSuccess 
        ? 'Perfekt uttal! Bra jobbat!' 
        : `Ljudet var otydligt eller ordet var fel. Det förväntade ordet var: "${this.currentWord.english}"`;
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

        // Skapa ord med status från databasen (10 slumpmässiga ord)
        const randomWords = this.shuffleArray([...this.allWords]).slice(0, 10);
        
        this.words = randomWords.map(word => ({
          english: word.english,
          swedish: word.swedish,
          completed: false,
          userAnswer: '',
          success: false,
          audioUrl: null
        }));

        console.log('Laddade uttalsord från databasen:', this.words.length);

      } catch (error) {
        console.error('Error loading words from database:', error);
        this.useFallbackWords();
      } finally {
        this.loading = false;
      }
    },

    useFallbackWords() {
      const fallbackWords = [
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

      // Skapa ord med status från fallback-orden
      const randomWords = this.shuffleArray(fallbackWords).slice(0, 10);
      
      this.words = randomWords.map(word => ({
        ...word,
        completed: false,
        userAnswer: '',
        success: false,
        audioUrl: null
      }));

      console.log('Använder fallback-ord för uttalsövning');
    },

    // AUTO-SCROLL METODER
    handleMouseMove(event) {
      if (this.currentWord.completed || this.showFeedback) {
        this.stopAutoScroll();
        return;
      }
      
      const container = this.$refs.tipsContainer;
      if (!container) return;
      
      const mouseY = event.clientY;
      const scrollZoneHeight = window.innerHeight * 0.15;
      const topZone = scrollZoneHeight;
      const bottomZone = window.innerHeight - scrollZoneHeight;
      
      let newScrollSpeed = 0;
      
      if (mouseY < topZone) { 
        newScrollSpeed = -this.autoScrollSpeed;
      } else if (mouseY > bottomZone) { 
        newScrollSpeed = this.autoScrollSpeed;
      } 
      
      if (newScrollSpeed !== 0 && !this.isAutoScrolling) {
        this.startAutoScroll(newScrollSpeed);
        this.setScrollVisualFeedback(newScrollSpeed < 0 ? 'top' : 'bottom');
      } else if (newScrollSpeed === 0 && this.isAutoScrolling) {
        this.stopAutoScroll();
      } else if (this.isAutoScrolling && this.scrollSpeed !== newScrollSpeed) {
        this.stopAutoScroll();
        this.startAutoScroll(newScrollSpeed);
        this.setScrollVisualFeedback(newScrollSpeed < 0 ? 'top' : 'bottom');
      }
    },

    startAutoScroll(speed) {
      this.isAutoScrolling = true;
      this.scrollSpeed = speed;

      const scroll = () => {
        if (!this.isAutoScrolling) return;
        window.scrollBy(0, speed);
        this.scrollAnimation = requestAnimationFrame(scroll);
      };
      
      if (this.scrollAnimation) {
        cancelAnimationFrame(this.scrollAnimation);
      }
      this.scrollAnimation = requestAnimationFrame(scroll);
    },

    setScrollVisualFeedback(direction) {
      const container = this.$refs.tipsContainer;
      if (!container) return;
      container.classList.remove('scroll-top', 'scroll-bottom'); 
      if (direction === 'top') {
        container.classList.add('scroll-top');
      } else if (direction === 'bottom') {
        container.classList.add('scroll-bottom');
      } 
    },

    stopAutoScroll() {
      this.isAutoScrolling = false;
      this.scrollSpeed = 0;
      this.setScrollVisualFeedback('none');
      if (this.scrollAnimation) {
        cancelAnimationFrame(this.scrollAnimation);
        this.scrollAnimation = null;
      }
    },

    // FOCUS METODER
    focusNextButton() {
      this.$nextTick(() => {
        const nextButton = this.$refs.nextButton;
        if (nextButton) {
          nextButton.focus();
        }
      });
    },

    focusTryAgainButton() {
      this.$nextTick(() => {
        const tryAgainButton = this.$refs.tryAgainButton;
        if (tryAgainButton) {
          tryAgainButton.focus();
        }
      });
    },

    focusNavigationButton() {
      this.$nextTick(() => {
        let buttonToFocus = null;
        
        if (this.isLastWord) {
          buttonToFocus = this.$refs.finishButton;
        } else {
          buttonToFocus = this.$refs.nextNavButton;
        }
        
        if (buttonToFocus) {
          buttonToFocus.focus();
        }
      });
    },

    scrollToElement(element) {
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    },

    cancelPractice() {
      if (confirm('Vill du avbryta övningen? Ditt framsteg kommer att sparas.')) {
        this.saveProgress();
        this.$router.push('/dashboard');
      }
    },

    playRecording(audioUrl) {
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play().catch(error => {
          console.error('Kunde inte spela upp inspelningen:', error);
        });
      }
    },

    goToPreviousWord() {
      if (this.currentWordIndex > 0) {
        this.currentWordIndex--;
        this.loadWordState();
        
        this.$nextTick(() => {
          this.scrollToElement(document.querySelector('.word-section'));
        });
      }
    },

    loadWordState() {
      this.stopRecognition();
      this.stopAutoScroll();
      
      const word = this.currentWord;
      
      this.hasAttempted = !!word.userAnswer || word.completed; 
      this.recognitionSuccess = word.success;
      this.recognitionError = word.completed && !word.success;
      this.userSpeech = word.userAnswer;
      this.showFeedback = word.completed && !word.success;
      
      if (word.completed && word.success) {
        this.showFeedback = false; 
      } else if (word.completed && !word.success) {
        this.showFeedback = true; 
      } else {
        this.resetWordState();
      }

      this.recognitionLoading = false;
      this.listeningTime = 0;
    },

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
      if (this.currentWord.completed) return;
      
      if (this.isListening) {
        this.stopRecognition();
      } else {
        await this.startRecording();
      }
    },

    async startRecording() {
      if (!this.isSpeechSupported) {
        alert('Röstigenkänning stöds inte i din webbläsare. Prova Chrome eller Edge.');
        return;
      }
      
      if (this.currentWord.completed) return;
      
      try {
        await this.startAudioRecording();
        
        this.recognitionLoading = true;
        this.userSpeech = '';
        this.recognitionSuccess = false;
        this.recognitionError = false;
        this.showFeedback = false;
        
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
            if (this.listeningTime >= 5) {
              this.stopRecognition();
            }
          }, 1000);
        };
        
        this.recognition.onresult = (event) => {
          const speechResult = event.results[0][0].transcript.trim();
          const normalizedSpeechResult = speechResult.toLowerCase();
          const expectedWord = this.currentWord.english.toLowerCase();
          
          this.userSpeech = speechResult;
          this.hasAttempted = true;
          
          // KORREKT KONTROLL: Jämför det sägda ordet med det förväntade
          const isCorrect = normalizedSpeechResult === expectedWord;
          
          this.recognitionSuccess = isCorrect;
          this.recognitionError = !isCorrect;
          
          if (isCorrect) {
            this.score += 10;
          } else {
            this.score += 2; // Mindre poäng för felaktigt svar
          }
          
          this.stopAudioRecording().then(audioUrl => {
            this.words[this.currentWordIndex].completed = true;
            this.words[this.currentWordIndex].success = isCorrect; // Spara korrekt status
            this.words[this.currentWordIndex].userAnswer = speechResult;
            this.words[this.currentWordIndex].audioUrl = audioUrl;
            
            this.showFeedback = true;
            
            // Auto-focus på rätt knapp efter svar
            this.$nextTick(() => {
              setTimeout(() => {
                if (isCorrect) {
                  this.focusNextButton();
                } else {
                  this.focusTryAgainButton();
                }
                this.scrollToElement(document.querySelector('.feedback-section'));
              }, 300);
            });
          });
        };
        
        this.recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          this.recognitionSuccess = false;
          this.recognitionError = true;
          if (!this.userSpeech || event.error === 'no-speech') {
            this.userSpeech = 'Kunde inte höra tydligt...';
          }
          this.hasAttempted = true;
          
          this.stopAudioRecording().then(audioUrl => {
            this.words[this.currentWordIndex].completed = true;
            this.words[this.currentWordIndex].success = false; // Sätt success till false vid fel
            this.words[this.currentWordIndex].userAnswer = this.userSpeech;
            this.words[this.currentWordIndex].audioUrl = audioUrl;
            
            this.showFeedback = true;
            
            // Auto-focus på try again knapp vid fel
            this.$nextTick(() => {
              setTimeout(() => {
                this.focusTryAgainButton();
                this.scrollToElement(document.querySelector('.feedback-section'));
              }, 300);
            });
          });
        };
        
        this.recognition.onend = () => {
          this.stopRecognition();
          if (!this.showFeedback && this.hasAttempted) {
            this.recognitionError = true;
            this.showFeedback = true;
          }
        };
        
        this.recognition.start();
        
      } catch (error) {
        console.error('Speech recognition failed:', error);
        this.recognitionLoading = false;
        this.recognitionError = true;
        this.stopAudioRecording();
        alert('Kunde inte starta röstigenkänning. Kontrollera mikrofontillåtelser.');
      }
    },

    async startAudioRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];
        
        this.mediaRecorder.ondataavailable = (event) => {
          this.audioChunks.push(event.data);
        };
        
        this.mediaRecorder.start();
      } catch (error) {
        console.error('Kunde inte starta ljudinspelning:', error);
      }
    },

    async stopAudioRecording() {
      return new Promise((resolve) => {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            resolve(audioUrl);
            
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
          };
          this.mediaRecorder.stop();
        } else {
          resolve(null);
        }
      });
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
      if (this.currentWord.completed && !this.currentWord.success) {
        this.resetWordState();
        this.words[this.currentWordIndex].completed = false;
        this.words[this.currentWordIndex].success = false;
        this.words[this.currentWordIndex].userAnswer = '';
        this.words[this.currentWordIndex].audioUrl = null;
        this.hasAttempted = false;
        
        this.$nextTick(() => {
          this.scrollToElement(document.querySelector('.recognition-controls'));
        });
      }
    },

    nextWord() {
      this.stopAutoScroll();
      if (this.isLastWord) {
        this.finishPractice();
      } else {
        this.currentWordIndex++;
        this.loadWordState();
        
        this.$nextTick(() => {
          this.scrollToElement(document.querySelector('.word-section'));
        });
      }
    },

    resetWordState() {
      this.stopRecognition();
      this.stopAutoScroll();
      this.hasAttempted = false;
      this.recognitionSuccess = false;
      this.recognitionError = false;
      this.showFeedback = false;
      this.userSpeech = '';
      this.listeningTime = 0;
      this.recognitionLoading = false;
    },

    finishPractice() {
      this.stopAutoScroll();
      this.saveProgress();
      const correctWords = this.words.filter(w => w.success).length;
      alert(`Övning avslutad! 🎉\nDu fick ${correctWords} av ${this.words.length} ord rätt!\nTotalpoäng: ${this.score}`);
      this.$router.push('/dashboard');
    },

    saveProgress() {
      const progress = JSON.parse(localStorage.getItem('learningProgress') || '{}');
      progress.speakingPractice = (progress.speakingPractice || 0) + 1;
      const correctWords = this.words.filter(w => w.success).length;
      progress.learnedWords = Math.min(125, (progress.learnedWords || 0) + Math.floor(correctWords / 2));
      localStorage.setItem('learningProgress', JSON.stringify(progress));
    }
  },

  async mounted() {
    await this.loadWordsFromDatabase();
    
    if (this.isSpeechSupported) {
      this.recognition = this.initSpeechRecognition();
    }
    this.loadWordState();
  },

  beforeUnmount() {
    this.stopRecognition();
    this.stopAutoScroll();
    this.words.forEach(word => {
      if (word.audioUrl) {
        URL.revokeObjectURL(word.audioUrl);
      }
    });
  }
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
  max-width: 600px;
  margin: 0 auto;
}

.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 15px;
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

.back-btn:hover:not(:disabled) {
  transform: translateX(-5px);
}

.back-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.cancel-btn {
  background: linear-gradient(135deg, #FF6B6B, #FF5252);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(255,107,107,0.3);
}

.progress-info {
  text-align: center;
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
  color: white;
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
  transform: none;
  animation: none;
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

.completed {
  color: #4ECDC4;
  font-weight: bold;
  background: #f0f9f8;
  padding: 8px 15px;
  border-radius: 10px;
  border-left: 4px solid #4ECDC4;
  display: inline-block;
}

.playback-controls {
  margin: 15px 0;
}

.play-recording-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.play-recording-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(102,126,234,0.3);
}

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
  outline: none;
}

.action-btn:focus {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.try-again-btn {
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

.navigation-controls {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  margin-top: 20px;
}

.nav-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.nav-btn {
  border: none;
  padding: 12px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  outline: none;
}

.nav-btn:focus {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.prev-btn {
  background: linear-gradient(135deg, #FF9A8B, #FF6A88);
  color: white;
}

.next-btn {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  color: white;
}

.finish-btn {
  background: linear-gradient(135deg, #FFD700, #FF8E00);
  color: white;
}

.nav-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.tips-section {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  margin-top: 20px;
  position: relative;
  transition: all 0.3s ease;
}

/* Auto-scroll CSS för tips-section */
.tips-section.scroll-top {
  box-shadow: inset 0 10px 20px -10px rgba(255, 107, 107, 0.5);
}

.tips-section.scroll-bottom {
  box-shadow: inset 0 -10px 20px -10px rgba(78, 205, 196, 0.5);
}

.tips-section::before,
.tips-section::after {
  content: '';
  position: fixed;
  left: 0;
  right: 0;
  height: 20%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.tips-section::before {
  top: 0;
  background: linear-gradient(to bottom, 
    rgba(255, 107, 107, 0.2) 0%, 
    transparent 100%);
}

.tips-section::after {
  bottom: 0;
  background: linear-gradient(to top, 
    rgba(78, 205, 196, 0.2) 0%, 
    transparent 100%);
}

.tips-section.scroll-top::before {
  opacity: 1;
}

.tips-section.scroll-bottom::after {
  opacity: 1;
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

@keyframes slideUp {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@media (max-width: 768px) {
  .practice-header {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  
  .back-btn, .cancel-btn {
    flex-basis: 40%;
    text-align: center;
    justify-content: center;
  }
  
  .progress-info {
    order: -1;
    width: 100%;
    margin-bottom: 10px;
  }
  
  .word-english {
    flex-direction: column;
    gap: 10px;
  }
  
  .feedback-actions, .nav-buttons {
    flex-direction: column;
  }
  
  .tips-section {
    min-height: 200px;
  }
}
</style>