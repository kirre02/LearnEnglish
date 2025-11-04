<template>
  <div class="practice-page listen-practice">
    <div class="practice-container">
      <!-- Header -->
      <div class="practice-header">
        <button @click="goBack" class="back-btn">← Tillbaka</button>
        <div class="progress-info">
          <span class="progress-text">Fråga {{ currentQuestionIndex + 1 }} av {{ questions.length }}</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="progressBarStyle"></div>
          </div>
        </div>
      </div>

      <!-- Laddningsskärm -->
      <div v-if="loading" class="loading-container">
        <div class="loading-bubble">
          <div class="loading-emoji">⏳</div>
          <h3>Hämtar övningsord...</h3>
          <p>Var god vänta medan vi förbereder din lyssnarövning!</p>
        </div>
      </div>

      <!-- Practice Content -->
      <div v-else class="practice-content" v-if="!practiceFinished">
        <div class="question-section">
          <button @click="playQuestionAudio" class="audio-btn-large" :disabled="audioLoading">
            <span v-if="audioLoading">⏳</span>
            <span v-else>🔊</span>
          </button>
          <p class="instruction">Klicka på högtalaren för att lyssna på ordet</p>
          <p class="sub-instruction" v-if="!hasPlayedAudio">⏺️ Tryck på högtalaren för att börja</p>
        </div>

        <div 
          class="options-container"
          @mousemove="handleMouseMove"
          ref="optionsContainer"
          @mouseleave="stopAutoScroll"
        >
          <button 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            @click="checkAnswer(option)"
            :class="['option-btn', getOptionClass(option)]"
            :disabled="!hasPlayedAudio || answered"
          >
            <span class="option-emoji">{{ getOptionEmoji(index) }}</span>
            <span class="option-text">{{ option.text }}</span>
          </button>
        </div>

        <div v-if="answered && !practiceFinished" class="feedback-section">
          <div class="feedback-bubble" :class="feedbackClass">
            <div class="feedback-emoji">{{ feedbackEmoji }}</div>
            <div class="feedback-text">{{ feedbackText }}</div>
            <button 
              @click="nextQuestion" 
              class="next-btn"
              ref="nextButton"
              @keydown.enter.space="nextQuestion"
              tabindex="0">
              {{ isLastQuestion ? 'Avsluta övning' : 'Nästa fråga' }} →
            </button>
          </div>
        </div>
      </div>

      <div v-if="practiceFinished" class="results-container">
        <div class="results-bubble" :class="resultsClass">
          <div class="results-emoji">{{ resultsEmoji }}</div>
          <h2>{{ resultsTitle }}</h2>
          <p class="results-score">{{ score }} av {{ questions.length }} rätt!</p>
          <p class="results-message">{{ resultsMessage }}</p>

          <div class="results-actions">
            <button @click="restartQuiz" class="action-btn play-again-btn">
              🎮 Spela igen
            </button>
            <button @click="goToAllResults" class="action-btn results-btn">
              📊 Se alla resultat
            </button>
            <button @click="goToDashboard" class="action-btn dashboard-btn">
              🏠 Till dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ListenPractice',
  data() {
    return {
      currentQuestionIndex: 0,
      answered: false,
      selectedAnswer: null,
      audioLoading: false,
      hasPlayedAudio: false,
      score: 0,
      questions: [],
      loading: true,
      allWords: [], // Lagra alla ord från databasen
      practiceFinished: false,

      
      // DATA FÖR AUTO-SCROLL
      autoScrollSpeed: 4,
      isAutoScrolling: false,
      scrollAnimation: null,
      scrollSpeed: 0,
    }
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex];
    },
    isLastQuestion() {
      return this.currentQuestionIndex === this.questions.length - 1;
    },
    progressBarStyle() {
      const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
      return { width: `${progress}%` };
    },
    feedbackClass() {
      return this.isCorrect ? 'correct' : 'incorrect';
    },
    feedbackEmoji() {
      return this.isCorrect ? '🎉' : '💡';
    },
    feedbackText() {
      return this.isCorrect 
        ? 'Rätt svar! Bra jobbat!' 
        : `Rätt svar är: ${this.currentQuestion.options.find(opt => opt.correct).text}`;
    },
    resultsClass() {
      const percentage = (this.score / this.questions.length) * 100;
      if (percentage >= 80) return 'excellent';
      if (percentage >= 60) return 'good';
      return 'ok';
    },
    resultsEmoji() {
      const percentage = (this.score / this.questions.length) * 100;
      if (percentage >= 80) return '🏆';
      if (percentage >= 60) return '⭐';
      return '👍';
    },
    resultsTitle() {
      const percentage = (this.score / this.questions.length) * 100;
      if (percentage >= 80) return 'Fantastiskt!';
      if (percentage >= 60) return 'Bra jobbat!';
      return 'Bra försök!';
    },
    resultsMessage() {
      const percentage = (this.score / this.questions.length) * 100;
      if (percentage >= 80) return 'Du är en riktig engelskexpert!';
      if (percentage >= 60) return 'Du kan mycket engelska!';
      return 'Fortsätt öva, du blir bättre!';
    },
    isCorrect() {
      return this.selectedAnswer?.correct === true;
    }
  },
  async mounted() {
    await this.loadQuestionsFromDatabase();
  },
  methods: {
    // Funktion för att blanda array (Fisher-Yates shuffle)
    shuffleArray(array) {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    },

    async loadQuestionsFromDatabase() {
      this.loading = true;
      try {
        // Hämta alla ord från databasen
        const response = await fetch('http://localhost:9001/api/words');
        if (!response.ok) throw new Error('Kunde inte hämta ord från databasen');
        
        this.allWords = await response.json();
        
        if (this.allWords.length === 0) {
          throw new Error('Inga ord hittades i databasen');
        }

        // Välj 10 slumpmässiga ord (mindre än quiz för lyssnarövning)
        const randomWords = this.shuffleArray([...this.allWords]).slice(0, 10);

        // Skapa lyssnarfrågor från databasorden
        this.questions = randomWords.map(word => {
          // Hämta felaktiga alternativ från wrong_options eller skapa egna
          const wrongOptions = JSON.parse(word.wrong_options || '[]');
          
          // Om det inte finns nog med felaktiga alternativ, skapa några från andra ord
          let additionalWrongOptions = [];
          if (wrongOptions.length < 3) {
            const otherWords = this.shuffleArray(
              this.allWords.filter(w => w.swedish !== word.swedish)
            ).slice(0, 3 - wrongOptions.length);
            additionalWrongOptions = otherWords.map(w => w.swedish);
          }

          // Skapa alla felaktiga alternativ
          const allWrongOptions = [
            ...wrongOptions.slice(0, 3),
            ...additionalWrongOptions
          ].slice(0, 3); // Ta max 3 felaktiga

          // Skapa alternativ (rätt svar + 3 felaktiga)
          const options = this.shuffleArray([
            { text: word.swedish, correct: true }, // Rätt svar på svenska
            ...allWrongOptions.map(opt => ({ text: opt, correct: false }))
          ]);

          return {
            audioText: word.english, // Engelska ordet som spelas upp
            options: options, // Svenska alternativ
            hint: `Lyssna på "${word.english}"`
          };
        });

        console.log('Laddade lyssnarfrågor från databasen:', this.questions.length);

      } catch (error) {
        console.error('Error loading listening questions from database:', error);
        this.useFallbackQuestions();
      } finally {
        this.loading = false;
      }
    },

    useFallbackQuestions() {
      const fallbackQuestions = [
        {
          audioText: "Hello",
          options: [
            { text: "Hej", correct: true },
            { text: "Tack", correct: false },
            { text: "Adjö", correct: false },
            { text: "Ursäkta", correct: false }
          ]
        },
        {
          audioText: "Apple",
          options: [
            { text: "Äpple", correct: true },
            { text: "Banan", correct: false },
            { text: "Apelsin", correct: false },
            { text: "Päron", correct: false }
          ]
        },
        {
          audioText: "Thank you",
          options: [
            { text: "Tack", correct: true },
            { text: "Hej", correct: false },
            { text: "Förlåt", correct: false },
            { text: "Varsågod", correct: false }
          ]
        },
        {
          audioText: "Water",
          options: [
            { text: "Vatten", correct: true },
            { text: "Mjölk", correct: false },
            { text: "Juice", correct: false },
            { text: "Kaffe", correct: false }
          ]
        },
        {
          audioText: "Goodbye",
          options: [
            { text: "Hejdå", correct: true },
            { text: "God morgon", correct: false },
            { text: "God natt", correct: false },
            { text: "Välkommen", correct: false }
          ]
        }
      ];
      
      this.questions = this.shuffleArray(fallbackQuestions);
      console.log('Använder fallback-frågor för lyssning');
    },

    getOptionEmoji(index) {
      const emojis = ['🇦', '🇧', '🇨', '🇩'];
      return emojis[index];
    },

    getOptionClass(option) {
      if (!this.answered) return '';
      if (option.correct) return 'correct';
      if (option === this.selectedAnswer) return 'incorrect';
      return '';
    },

    async playQuestionAudio() {
      await this.playAudio(this.currentQuestion.audioText);
      this.hasPlayedAudio = true;
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
          alert('Ljudstöd är inte tillgängligt i din webbläsare');
        }
      } catch (error) {
        console.error('Ljudfel:', error);
        this.audioLoading = false;
      }
    },

    // AUTO-SCROLL METODER
    handleMouseMove(event) {
      if (this.answered) {
        this.stopAutoScroll();
        return;
      }
      
      const container = this.$refs.optionsContainer;
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
      const container = this.$refs.optionsContainer;
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

    checkAnswer(selectedOption) {
      this.stopAutoScroll(); 
      this.answered = true;
      this.selectedAnswer = selectedOption;
      
      if (selectedOption.correct) {
        this.score++;
      }
      
      this.$nextTick(() => {
        setTimeout(() => {
          this.scrollToNextButton();
          this.focusNextButton();
        }, 300);
      });
    },

    scrollToNextButton() {
      const nextButton = this.$refs.nextButton;
      if (nextButton) {
        nextButton.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    },

    focusNextButton() {
      this.$nextTick(() => {
        const nextButton = this.$refs.nextButton;
        if (nextButton) {
          nextButton.focus();
        }
      });
    },

    nextQuestion() {
      this.stopAutoScroll();
      if (this.isLastQuestion) {
        this.finishPractice();
      } else {
        this.currentQuestionIndex++;
        this.answered = false;
        this.selectedAnswer = null;
        this.hasPlayedAudio = false;
        
        this.$nextTick(() => {
          const questionElement = document.querySelector('.question-section');
          if (questionElement) {
            questionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
    },

  // finishPractice() {
    // this.savePracticeProgress();
      //alert(`Övning avslutad! 🎉\nDu fick ${this.score} av ${this.questions.length} rätt!`);
      //this.$router.push('/dashboard');
    //},
     finishPractice() {
    this.practiceFinished = true;
    this.savePracticeProgress();

    try {
      const resultData = {
        userId: 1,
        score: this.score,
        total: this.questions.length
      };
      fetch('http://localhost:9001/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData)
      }).then(res => {
        if (res.ok) console.log("Result saved to DB ✅");
      });
    } catch (err) {
      console.error("Error saving result:", err);
    }
  },

    saveQuizStateForResults() {
      const quizState = {
        score: this.score,
        questionsLength: this.questions.length
      };
      localStorage.setItem('lastQuizState', JSON.stringify(quizState));
    },

    savePracticeProgress() {
      const progress = JSON.parse(localStorage.getItem('learningProgress') || '{}');
      progress.listeningPractice = (progress.listeningPractice || 0) + 1;
      progress.learnedWords = Math.min(125, (progress.learnedWords || 0) + this.score);
      localStorage.setItem('learningProgress', JSON.stringify(progress));
    },
    goToAllResults() {
    this.$router.push('/quiz-results');
  },
   goToDashboard() {
    this.$router.push('/dashboard');},

    goBack() {
      this.$router.back();
    }
  }
  ,
  beforeUnmount() {
    this.stopAutoScroll();
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

/* Behåll alla dina ursprungliga CSS-stilar här */
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
  margin-bottom: 40px;
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

.practice-content {
  text-align: center;
}

.question-section {
  margin-bottom: 40px;
}

.audio-btn-large {
  background: linear-gradient(135deg, #FF9A8B, #FF6A88);
  border: none;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  font-size: 2.5em;
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(255,154,139,0.3);
}

.audio-btn-large:hover:not(:disabled) {
  transform: scale(1.1);
}

.audio-btn-large:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.instruction {
  font-size: 1.3em;
  color: #333;
  font-weight: bold;
  margin-bottom: 5px;
}

.sub-instruction {
  font-size: 0.9em;
  color: #666;
  font-style: italic;
}

.options-container {
  display: grid;
  gap: 15px;
  margin-bottom: 30px;
  position: relative;
  min-height: 400px;
  transition: all 0.3s ease;
}

.option-btn {
  background: white;
  border: 3px solid #E2E8F0;
  padding: 20px;
  border-radius: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
  font-size: 1.1em;
  font-weight: bold;
}

.option-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.option-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.option-btn.correct {
  border-color: #4ECDC4;
  background: #4ECDC4;
  color: white;
}

.option-btn.incorrect {
  border-color: #FF6B6B;
  background: #FF6B6B;
  color: white;
}

.option-emoji {
  font-size: 1.2em;
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
  background: linear-gradient(135deg, #FF9A8B, #FF6A88);
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

.next-btn {
  background: white;
  color: #333;
  border: none;
  padding: 12px 25px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1em;
  transition: all 0.3s ease;
  outline: none;
}

.next-btn:focus {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.next-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

/* Auto-scroll CSS */
.options-container.scroll-top {
  box-shadow: inset 0 10px 20px -10px rgba(255, 107, 107, 0.5);
}

.options-container.scroll-bottom {
  box-shadow: inset 0 -10px 20px -10px rgba(78, 205, 196, 0.5);
}

.options-container::before,
.options-container::after {
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

.options-container::before {
  top: 0;
  background: linear-gradient(to bottom, 
    rgba(255, 107, 107, 0.2) 0%, 
    transparent 100%);
}

.options-container::after {
  bottom: 0;
  background: linear-gradient(to top, 
    rgba(78, 205, 196, 0.2) 0%, 
    transparent 100%);
}

.options-container.scroll-top::before {
  opacity: 1;
}

.options-container.scroll-bottom::after {
  opacity: 1;
}

@keyframes slideUp {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@media (max-width: 768px) {
  .practice-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .progress-info {
    text-align: center;
  }
  
  .options-container {
    min-height: 300px;
  }

}

 /* === RESULT SECTION (renkli ve dinamik) === */
.results-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  margin-top: 20px;
}

.results-bubble {
  color: white;
  padding: 50px 40px;
  border-radius: 30px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  animation: fadeInUp 0.7s ease-out;
}

/* 🔥 Renk temaları */
/* 🔥 Renk temaları */
.results-bubble.excellent {
  background: linear-gradient(135deg, #42E695, #3BB2B8);
}

.results-bubble.good {
  background: linear-gradient(135deg, #FAD961, #F76B1C);
}

.results-bubble.ok {
  background: linear-gradient(135deg, #FF9A9E, #FAD0C4);
}


.results-emoji {
  font-size: 3.5em;
  margin-bottom: 15px;
}

.results-bubble h2 {
  font-size: 2em;
  margin-bottom: 10px;
  font-weight: bold;
}

.results-score {
  font-weight: bold;
  font-size: 1.3em;
  margin-bottom: 10px;
}

.results-message {
  font-size: 1.1em;
  opacity: 0.95;
  margin-bottom: 30px;
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.action-btn {
  border: none;
  padding: 12px 25px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  color: white;
  transition: all 0.3s ease;
  font-size: 1em;
}

.play-again-btn {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.results-btn {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dashboard-btn {
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}


.action-btn:hover {
  opacity: 0.85;
  transform: scale(1.05);
}

@keyframes fadeInUp {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}


</style>