<template>
  <div class="quiz-page-container">
    <div class="quiz-container">
      <div class="quiz-header">
        <button @click="goBack" class="back-btn">← Tillbaka</button>
        <div class="quiz-progress">
          <span class="progress-text">Fråga {{ currentQuestionIndex + 1 }} av {{ questions.length }}</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="progressBarStyle"></div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-bubble">
          <div class="loading-emoji">⏳</div>
          <h3>Hämtar frågor...</h3>
          <p>Var god vänta medan vi förbereder ditt quiz!</p>
        </div>
      </div>

      <div v-else-if="!quizFinished" class="quiz-content">
        <div class="question-bubble">
          <div class="question-header">
            <div class="question-emoji">🧠</div>
          </div>
          <h2>Vad är "{{ getSwedishWord() }}" på engelska?</h2>
          <div class="question-hint">
            💡 Tänk på ordet du lärt dig!
          </div>
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
            :disabled="answered"
          >
            <span class="option-emoji">{{ getOptionEmoji(index) }}</span>
            <span class="option-text">{{ option }}</span>
            <button
              v-if="shouldShowOptionAudio(option)"
              @click.stop="playOptionAudio(option)"
              class="option-audio-btn"
              :disabled="audioLoading"
              :aria-label="`Hör uttal av ${option}`"
            >
              <span v-if="currentLoadingOption === option">⏳</span>
              <span v-else>🔊</span>
            </button>
          </button>
        </div>
        <div v-if="answered" class="feedback-bubble" :class="feedbackClass">
          <div class="feedback-emoji">{{ feedbackEmoji }}</div>
          <div class="feedback-text">{{ feedbackText }}</div>
          <button
            v-if="!isAnswerCorrect"
            @click="playCorrectAnswerAudio"
            class="audio-hint-btn"
            :disabled="audioLoading"
          >
            <span v-if="audioLoading && currentLoadingOption === 'correct-answer'">⏳ Laddar...</span>
            <span v-else>🔊 Hör rätt svar</span>
          </button>
          
          <button 
            @click="nextQuestion" 
            class="next-btn"
            ref="nextButton"
            @keydown.enter.space="nextQuestion"
            tabindex="0">
            {{ isLastQuestion ? 'Se resultat' : 'Nästa fråga' }} →
          </button>
          
        </div>
      </div>

      <div v-else class="results-container">
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
  name: 'Quiz',
  data() { 
    return {
      score: 0,
      currentQuestionIndex: 0,
      answered: false,
      selectedAnswer: null,
      quizFinished: false,
      progress: {}, 
      questions: [],
      loading: true,

      // DATA FÖR LJUD
      audioLoading: false,
      currentLoadingOption: null,
      currentAudio: null,
      isSpeechSupported: 'speechSynthesis' in window,
      
      // DATA FÖR AUTO-SCROLL
      autoScrollSpeed: 4,
      isAutoScrolling: false,
      scrollAnimation: null,
      scrollSpeed: 0, 
    }
  },
  computed: {
    currentQuestion() {
      const question = this.questions[this.currentQuestionIndex];
      return question;
    },
    isLastQuestion() {
      return this.currentQuestionIndex === this.questions.length - 1;
    },
    progressBarStyle() {
      const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
      return { width: `${progress}%` };
    },
    feedbackClass() {
      return this.selectedAnswer === this.currentQuestion.correctAnswer ? 'correct' : 'incorrect';
    },
    feedbackEmoji() {
      return this.selectedAnswer === this.currentQuestion.correctAnswer ? '🎉' : '💡';
    },
    // FIX: feedbackText använder nu engelska som korrekt svar
    feedbackText() {
      return this.selectedAnswer === this.currentQuestion.correctAnswer
        ? 'Rätt svar! Bra jobbat!'
        : `Rätt svar är: ${this.currentQuestion.correctAnswer}`;
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
    isAnswerCorrect() {
      return this.selectedAnswer === this.currentQuestion.correctAnswer;
    },
  },
  async mounted() {
    if (this.$route.query.showResults === 'true') {
      const savedState = localStorage.getItem('lastQuizState');
      if (savedState) {
        try {
          const quizState = JSON.parse(savedState);
          this.quizFinished = true;
          this.score = quizState.score;
          this.questions = new Array(quizState.questionsLength).fill({}); 
          localStorage.removeItem('lastQuizState');
        } catch (e) {
          console.error("Kunde inte tolka sparad quiz-state:", e);
        }
      }
      this.$router.replace({ query: {} });
    }

    if (!localStorage.getItem('token')) {
      this.$router.push('/');
    }
    this.loadProgress();
    
    if (!this.isSpeechSupported) {
      console.log('Web Speech API är inte tillgängligt i denna webbläsare');
    }

    await this.loadQuestionsFromDatabase();
  },
  methods: {
    // NY METOD: Hämta det svenska ordet (prompten)
    getSwedishWord() {
      if (!this.currentQuestion) return '';
      // Prompten är nu det svenska ordet
      return this.currentQuestion.swedish || '[Ord saknas]';
    },

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
        const response = await fetch('http://localhost:9001/api/words');
        if (!response.ok) throw new Error('Kunde inte hämta ord från databasen');
        
        const allWords = await response.json();
        
        if (allWords.length === 0) {
          throw new Error('Inga ord hittades i databasen');
        }

        const randomWords = this.shuffleArray([...allWords]).slice(0, 20);
        
        // Hämta alla engelska ord för felaktiga alternativ
        const allEnglishWords = allWords.map(w => w.english);

        this.questions = randomWords.map(word => {
          
          // Hämta 3 slumpmässiga engelska ord som inte är det rätta svaret
          const wrongEnglishOptions = this.shuffleArray(
            allEnglishWords.filter(engWord => engWord !== word.english)
          ).slice(0, 3);

          // Skapa alternativ (rätt svar i engelska + 3 felaktiga i engelska)
          const options = this.shuffleArray([
            word.english, // Rätt svar är nu engelska
            ...wrongEnglishOptions
          ]);

          return {
            swedish: word.swedish, // FIX: Svenska ordet är frågan (prompt)
            correctAnswer: word.english, // FIX: Engelska ordet är rätt svar
            options: options, // Alternativen är engelska
            hint: `Öva på ordet "${word.swedish}"`,
            audioText: word.english // Ljudet spelas upp i engelska
          };
        });

        console.log('Laddade frågor från databasen:', this.questions.length);

      } catch (error) {
        console.error('Error loading questions from database:', error);
        this.useFallbackQuestions();
      } finally {
        this.loading = false;
      }
    },

    // FIX: Använder svenska som prompt och engelska som svar/alternativ
    useFallbackQuestions() {
      const fallbackQuestions = [
        {
          swedish: "Hej",  // FIX
          options: ["Hello", "Goodbye", "Thank you", "Excuse me"], // FIX
          correctAnswer: "Hello", // FIX
          hint: "Det är det första man säger när man träffar någon",
          audioText: "Hello"
        },
        {
          swedish: "Äpple",  // FIX
          options: ["Pear", "Banana", "Apple", "Orange"], // FIX
          correctAnswer: "Apple", // FIX
          hint: "En röd eller grön frukt",
          audioText: "Apple"
        },
        {
          swedish: "Adjö",
          options: ["Hello", "Goodbye", "Thank you", "Excuse me"],
          correctAnswer: "Goodbye",
          hint: "Säger man när man går",
          audioText: "Goodbye"
        },
        {
          swedish: "Tack", 
          options: ["Hello", "Goodbye", "Thank you", "Excuse me"],
          correctAnswer: "Thank you",
          hint: "Säger man när man får något",
          audioText: "Thank you"
        }
      ];
      
      this.questions = this.shuffleArray(fallbackQuestions).slice(0, 20);
      console.log('Använder fallback-frågor');
    },

    // AUTO-SCROLL METODER (oförändrade)
    handleMouseMove(event) {
      if (this.answered || this.quizFinished) {
        this.stopAutoScroll();
        return;
      }
      
      const container = this.$refs.optionsContainer;
      if (!container) return;       const mouseY = event.clientY;
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
        if (!this.isAutoScrolling) return;         window.scrollBy(0, speed);
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

    // QUIZ METODER (oförändrade)
    getOptionEmoji(index) {
      const emojis = ['🇦', '🇧', '🇨', '🇩'];
      return emojis[index];
    },

    getOptionClass(option) {
      if (!this.answered) return '';
      if (option === this.currentQuestion.correctAnswer) return 'correct';
      if (option === this.selectedAnswer) return 'incorrect';
      return '';
    },

    checkAnswer(selectedAnswer) {
      this.stopAutoScroll(); 
      this.answered = true;
      this.selectedAnswer = selectedAnswer;

      if (selectedAnswer === this.currentQuestion.correctAnswer) {
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
        this.finishQuiz();
      } else {
        this.currentQuestionIndex++;
        this.answered = false;
        this.selectedAnswer = null; 
        this.$nextTick(() => {
          const questionElement = document.querySelector('.question-bubble');
          if (questionElement) {
            questionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
    },

    finishQuiz() {
      this.quizFinished = true;
      this.updateProgress();
      this.saveQuizResult();
      this.saveQuizStateForResults();
    },

    saveQuizStateForResults() {
      const quizState = {
        score: this.score,
        questionsLength: this.questions.length
      };
      localStorage.setItem('lastQuizState', JSON.stringify(quizState));
    },

    async saveQuizResult() {
      try {
        const resultData = {
          userId: 1,
          score: this.score,
          total: this.questions.length
        };

        const response = await fetch('http://localhost:9001/api/results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resultData)
        });

        if (response.ok) {
          console.log('Quiz result saved successfully!');
        } else {
          console.error('Failed to save quiz result');
        }
      } catch (error) {
        console.error('Error saving quiz result:', error);
      }
    },

    updateProgress() {
      const progress = JSON.parse(localStorage.getItem('learningProgress') || '{}');
      progress.completedQuizzes = (progress.completedQuizzes || 0) + 1;
      progress.learnedWords = Math.min(125, (progress.learnedWords || 0) + this.score * 2);
      localStorage.setItem('learningProgress', JSON.stringify(progress));
    },

    loadProgress() {
      try {
        const progress = JSON.parse(localStorage.getItem('learningProgress') || '{}');
        this.progress = progress;
      } catch (e) {
        console.error("Kunde inte ladda framsteg:", e);
        this.progress = {};
      }
    },

    async restartQuiz() {
      this.score = 0;
      this.currentQuestionIndex = 0;
      this.answered = false;
      this.selectedAnswer = null;
      this.quizFinished = false;
      this.loading = true;
      
      await this.loadQuestionsFromDatabase();
    },

    goBack() {
      this.$router.back();
    },

    goToDashboard() {
      this.$router.push('/dashboard');
    },     goToAllResults() {
      this.$router.push({ path: '/results', query: { showResults: 'true' } });
    },

    // LJUDMETODER (oförändrade)
    async playOptionAudio(option) {
      // AudioText är nu det engelska ordet, vilket är korrekt
      this.currentLoadingOption = option;
      await this.playAudio(option);
      this.currentLoadingOption = null;
    },

    async playCorrectAnswerAudio() {
      // CorrectAnswer är nu det engelska ordet, vilket är korrekt
      this.currentLoadingOption = 'correct-answer';
      await this.playAudio(this.currentQuestion.correctAnswer);
      this.currentLoadingOption = null;
    },

    async playAudio(text) {
      if (!this.isSpeechSupported) {
        console.warn('Web Speech API stöds inte i denna webbläsare');
        this.showBrowserSupportMessage();
        return;
      }

      try {
        speechSynthesis.cancel();
        this.audioLoading = true;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 0.8;

        return new Promise((resolve) => {
          utterance.onend = () => {
            this.audioLoading = false;
            resolve();
          };

          utterance.onerror = (error) => {
            console.error('Kunde inte spela upp ljud:', error);
            this.audioLoading = false;
            this.showAudioError();
            resolve();
          };

          speechSynthesis.speak(utterance);
        });

      } catch (error) {
        console.error('Ljudfel:', error);
        this.audioLoading = false;
        this.currentLoadingOption = null;
        this.showAudioError();
      }
    },

    showBrowserSupportMessage() {
      alert('Ljudstöd är för närvarande inte tillgängligt i din webbläsare. Vi rekommenderar Chrome eller Edge för bästa upplevelse.');
    },

    showAudioError() {
      console.warn('Kunde inte spela upp ljudet. Kontrollera din ljudinställningar.');
    },

    shouldShowOptionAudio() {
      return this.isSpeechSupported;
    },
  }, 
  beforeUnmount() {
    this.stopAutoScroll();
    if (this.isSpeechSupported) {
      speechSynthesis.cancel();
    }
  }
}
</script>

<style scoped>
/* Här följer alla dina oförändrade CSS-stilar. */

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

/* Behåll ALLA dina ursprungliga CSS-stilar här */
/* De är exakt samma som i din ursprungliga quiz-komponent */
.quiz-page-container {
  min-height: 100vh;
  background-color: #f7f3ed;
  padding: 20px;
  font-family: 'Comic Sans MS', 'Marker Felt', cursive, sans-serif;
}

.quiz-container {
  max-width: 600px;
  margin: 0 auto;
}

.quiz-header {
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

.quiz-progress {
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
  background: linear-gradient(135deg, #FF9A8B, #FF6A88);
  transition: width 0.3s ease;
}

.question-bubble {
  background: linear-gradient(135deg, #FF9A8B, #FF6A88);
  color: white;
  padding: 30px;
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 30px;
  box-shadow: 0 10px 25px rgba(255,154,139,0.3);
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 0;
  width: 100%;
}

.question-emoji {
  font-size: 3em;
  margin-bottom: 15px;
}

.question-bubble h2 {
  margin: 0 0 15px 0;
  font-size: 1.5em;
}

.question-hint {
  background: rgba(255,255,255,0.2);
  padding: 10px 15px;
  border-radius: 15px;
  font-size: 0.9em;
  margin-top: 15px;
}.options-container {
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
  position: relative;
}

.option-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
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

.option-btn:disabled {
  cursor: not-allowed;
}

.option-emoji {
  font-size: 1.2em;
}

.option-audio-btn {
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9em;
  margin-left: auto;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.option-audio-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
}

.option-audio-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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

.audio-hint-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid white;
  border-radius: 20px;
  padding: 10px 20px;
  color: white;
  cursor: pointer;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  font-size: 0.9em;
  min-width: 140px;
}

.audio-hint-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.audio-hint-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}.next-btn {
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

.results-bubble {
  padding: 40px;
  border-radius: 25px;
  text-align: center;
  color: white;
  animation: bounceIn 0.8s ease-out;
}

.results-bubble.excellent {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
}

.results-bubble.good {
  background: linear-gradient(135deg, #FF9A8B, #FF6A88);
}

.results-bubble.ok {
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
}

.results-emoji {
  font-size: 4em;
  margin-bottom: 20px;
}

.results-bubble h2 {
  margin: 0 0 15px 0;
  font-size: 2em;
}

.results-score {
  font-size: 1.5em;
  margin: 0 0 15px 0;
  font-weight: bold;
}

.results-message {
  font-size: 1.1em;
  margin: 0 0 30px 0;
  opacity: 0.9;
}

.results-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  border: none;
  padding: 15px 25px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1em;
  transition: all 0.3s ease;
  color: white;
}

.play-again-btn {
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
}.results-btn {
  background: rgba(102, 126, 234, 0.8);
  backdrop-filter: blur(10px);
}

.dashboard-btn {
  background: rgba(0,0,0,0.2);
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}.options-container.scroll-top {
  box-shadow: inset 0 10px 20px -10px rgba(255, 107, 107, 0.5);
}

.options-container.scroll-bottom {
  box-shadow: inset 0 -10px 20px -10px rgba(78, 205, 196, 0.5);
}.options-container::before,
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
}@keyframes slideUp {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

@media (max-width: 768px) {
  .quiz-header {
    flex-direction: column;
    gap: 15px;
  }

  .quiz-progress {
    text-align: center;
  }

  .results-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .option-btn {
    padding: 15px;
  }

  .option-audio-btn {
    width: 30px;
    height: 30px;
  }
}
</style>