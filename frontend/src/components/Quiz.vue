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
      </div>      <div v-if="!quizFinished" class="quiz-content">
        <div class="question-bubble">
          <div class="question-header">
            <div class="question-emoji">🧠</div>
          </div>
          <h2>{{ currentQuestion.question }}</h2>
          <div class="question-hint" v-if="currentQuestion.hint">
            💡 {{ currentQuestion.hint }}
          </div>
        </div>        <div class="options-container">
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
        </div>        <div v-if="answered" class="feedback-bubble" :class="feedbackClass">
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
          <button @click="nextQuestion" class="next-btn">
            {{ isLastQuestion ? 'Se resultat' : 'Nästa fråga' }} →
          </button>
        </div>
      </div>      <div v-else class="results-container">
        <div class="results-bubble" :class="resultsClass">
          <div class="results-emoji">{{ resultsEmoji }}</div>
          <h2>{{ resultsTitle }}</h2>
          <p class="results-score">{{ score }} av {{ questions.length }} rätt!</p>
          <p class="results-message">{{ resultsMessage }}</p>
          
          <div class="results-actions">
            <button @click="restartQuiz" class="action-btn play-again-btn">
              🎮 Spela igen
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
    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // UTÖKAD LISTA MED 20 FRÅGOR
    const initialQuestions = [
      {
        question: "Vad betyder 'Hej' på engelska?",
        options: ["Hello", "Goodbye", "Thank you", "Excuse me"],
        correctAnswer: "Hello",
        hint: "Det är det första man säger när man träffar någon",
        audioText: "Hello"
      },
      {
        question: "Vad är 'Äpple' på engelska?",
        options: ["Pear", "Banana", "Apple", "Orange"],
        correctAnswer: "Apple",
        hint: "En röd eller grön frukt",
        audioText: "Apple"
      },
      {
        question: "Vad betyder 'Tack' på engelska?",
        options: ["Sorry", "Thank you", "You're welcome", "Bye"],
        correctAnswer: "Thank you",
        hint: "Säger man när någon ger dig något",
        audioText: "Thank you"
      },
      {
        question: "Hur säger man 'Vatten' på engelska?",
        options: ["Milk", "Juice", "Water", "Coffee"],
        correctAnswer: "Water",
        hint: "Vätska man dricker när man är törstig",
        audioText: "Water"
      },
      {
        question: "Vad betyder 'Hejdå' på engelska?",
        options: ["Good morning", "Good night", "Goodbye", "Welcome"],
        correctAnswer: "Goodbye",
        hint: "Säger man när man lämnar",
        audioText: "Goodbye"
      },
      {
        question: "Vad är 'Bok' på engelska?",
        options: ["Book", "Paper", "Pen", "Library"],
        correctAnswer: "Book",
        hint: "Något man läser",
        audioText: "Book"
      },
      {
        question: "Vad betyder 'Ja' på engelska?",
        options: ["No", "Yes", "Maybe", "Please"],
        correctAnswer: "Yes",
        hint: "Motsatsen till nej",
        audioText: "Yes"
      },
      {
        question: "Hur säger man 'Hus' på engelska?",
        options: ["Car", "House", "Garden", "Street"],
        correctAnswer: "House",
        hint: "Där man bor",
        audioText: "House"
      },
      {
        question: "Vad är 'Katt' på engelska?",
        options: ["Dog", "Cat", "Bird", "Fish"],
        correctAnswer: "Cat",
        hint: "Ett husdjur som jamar",
        audioText: "Cat"
      },
      {
        question: "Vad betyder 'Nej' på engelska?",
        options: ["Yes", "No", "Okay", "Sure"],
        correctAnswer: "No",
        hint: "Motsatsen till ja",
        audioText: "No"
      },
      {
        question: "Hur säger man 'Skola' på engelska?",
        options: ["Work", "School", "Home", "Playground"],
        correctAnswer: "School",
        hint: "Där barn lär sig",
        audioText: "School"
      },
      {
        question: "Vad är 'Bil' på engelska?",
        options: ["Bike", "Bus", "Car", "Train"],
        correctAnswer: "Car",
        hint: "Ett fordon med fyra hjul",
        audioText: "Car"
      },
      {
        question: "Vad betyder 'Förlåt' på engelska?",
        options: ["Excuse me", "Sorry", "Thank you", "Please"],
        correctAnswer: "Sorry",
        hint: "Säger man när man gjort något fel",
        audioText: "Sorry"
      },
      {
        question: "Hur säger man 'Familj' på engelska?",
        options: ["Friends", "Family", "Parents", "Children"],
        correctAnswer: "Family",
        hint: "Mamma, pappa, barn",
        audioText: "Family"
      },
      {
        question: "Vad är 'Mat' på engelska?",
        options: ["Drink", "Food", "Water", "Bread"],
        correctAnswer: "Food",
        hint: "Något man äter",
        audioText: "Food"
      },
      {
        question: "Vad betyder 'Snälla' på engelska?",
        options: ["Please", "Thank you", "Sorry", "Hello"],
        correctAnswer: "Please",
        hint: "Säger man när man ber om något",
        audioText: "Please"
      },
      {
        question: "Hur säger man 'Tid' på engelska?",
        options: ["Clock", "Time", "Watch", "Hour"],
        correctAnswer: "Time",
        hint: "Vad klockan är",
        audioText: "Time"
      },
      {
        question: "Vad är 'Dag' på engelska?",
        options: ["Night", "Day", "Week", "Month"],
        correctAnswer: "Day",
        hint: "24 timmar",
        audioText: "Day"
      },
      {
        question: "Vad betyder 'Stor' på engelska?",
        options: ["Small", "Big", "Tall", "Short"],
        correctAnswer: "Big",
        hint: "Motsatsen till liten",
        audioText: "Big"
      },
      {
        question: "Hur säger man 'Barn' på engelska?",
        options: ["Adult", "Child", "Baby", "Kid"],
        correctAnswer: "Child",
        hint: "En ung person",
        audioText: "Child"
      },
      {
        question: "Vad är 'Vacker' på engelska?",
        options: ["Ugly", "Beautiful", "Nice", "Pretty"],
        correctAnswer: "Beautiful",
        hint: "Något som är fint att titta på",
        audioText: "Beautiful"
      },
      {
        question: "Vad betyder 'Pengar' på engelska?",
        options: ["Coin", "Money", "Cash", "Gold"],
        correctAnswer: "Money",
        hint: "Används för att betala",
        audioText: "Money"
      },
      {
        question: "Hur säger man 'Arbete' på engelska?",
        options: ["Job", "Work", "Office", "Business"],
        correctAnswer: "Work",
        hint: "Det man gör för att tjäna pengar",
        audioText: "Work"
      },
      {
        question: "Vad är 'Resa' på engelska?",
        options: ["Travel", "Trip", "Journey", "Vacation"],
        correctAnswer: "Travel",
        hint: "Att åka till ett annat land",
        audioText: "Travel"
      },
      {
        question: "Vad betyder 'Lycklig' på engelska?",
        options: ["Sad", "Happy", "Angry", "Tired"],
        correctAnswer: "Happy",
        hint: "När man känner sig glad",
        audioText: "Happy"
      }
    ];

    const preparedQuestions = initialQuestions.map(question => {
      return {
        ...question,
        options: shuffleArray([...question.options])
      };
    });

    return {
      score: 0,
      currentQuestionIndex: 0,
      answered: false,
      selectedAnswer: null,
      quizFinished: false,
      questions: shuffleArray(preparedQuestions),
      initialQuestions: initialQuestions,
      shuffleArray: shuffleArray,
      
      // DATA FÖR LJUD
      audioLoading: false,
      currentLoadingOption: null,
      currentAudio: null,
      isSpeechSupported: 'speechSynthesis' in window
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
      return this.selectedAnswer === this.currentQuestion.correctAnswer ? 'correct' : 'incorrect';
    },
    feedbackEmoji() {
      return this.selectedAnswer === this.currentQuestion.correctAnswer ? '🎉' : '💡';
    },
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
  methods: {
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
      this.answered = true;
      this.selectedAnswer = selectedAnswer;
      
      if (selectedAnswer === this.currentQuestion.correctAnswer) {
        this.score++;
      }
    },
    nextQuestion() {
      if (this.isLastQuestion) {
        this.finishQuiz();
      } else {
        this.currentQuestionIndex++;
        this.answered = false;
        this.selectedAnswer = null;
      }
    },
    finishQuiz() {
      this.quizFinished = true;
      this.updateProgress();
    },
    updateProgress() {
      const progress = JSON.parse(localStorage.getItem('learningProgress') || '{}');
      progress.completedQuizzes = (progress.completedQuizzes || 0) + 1;
      progress.learnedWords = Math.min(125, (progress.learnedWords || 0) + this.score * 2);
      localStorage.setItem('learningProgress', JSON.stringify(progress));
    },
    restartQuiz() {
      const preparedQuestions = this.initialQuestions.map(question => {
        return {
          ...question,
          options: this.shuffleArray([...question.options])
        };
      });
      
      this.questions = this.shuffleArray(preparedQuestions);
      this.score = 0;
      this.currentQuestionIndex = 0;
      this.answered = false;
      this.selectedAnswer = null;
      this.quizFinished = false;
    },
    goBack() {
      this.$router.back();
    },
    goToDashboard() {
      this.$router.push('/dashboard');
    },

    // LJUDMETODER
    async playOptionAudio(option) {
      this.currentLoadingOption = option;
      await this.playAudio(option);
      this.currentLoadingOption = null;
    },
    
    async playCorrectAnswerAudio() {
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
    if (this.isSpeechSupported) {
      speechSynthesis.cancel();
    }
  },
  
  mounted() {
    if (!this.isSpeechSupported) {
      console.log('Web Speech API är inte tillgängligt i denna webbläsare');
    }
  }
}
</script>

<style scoped>
/* Samma CSS som tidigare - inga ändringar behövs */
.quiz-page-container {
  min-height: 100vh;
  background-color: #f7f3ed;
  padding: 20px;
  font-family: 'Comic Sans MS', 'Marker Felt', cursive, sans-serif;
}

.quiz-container {
  max-width: 600px;
  margin: 0 auto;
}.quiz-header {
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
}.question-bubble {
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
}

.next-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}.results-bubble {
  padding: 40px;
  border-radius: 25px;
  text-align: center;
  color: white;
  animation: bounceIn 0.8s ease-out;
}

.results-bubble.excellent {
  background: linear-gradient(135deg, #FF9A8B, #FF6A88);
}

.results-bubble.good {
  background: linear-gradient(135deg, #FF9A8B, #FF6A88);
}

.results-bubble.ok {
  background: linear-gradient(135deg, #FF9A8B, #FF6A88);
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
}

.dashboard-btn {
  background: rgba(0,0,0,0.2);
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}@keyframes slideUp {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}@media (max-width: 768px) {
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