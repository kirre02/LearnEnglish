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
      <div v-else class="practice-content">
        <div class="question-section">
          <button @click="playQuestionAudio" class="audio-btn-large" :disabled="audioLoading">
            <span v-if="audioLoading">⏳</span>
            <span v-else>🔊</span>
          </button>
          <p class="instruction">Klicka på högtalaren för att lyssna på ordet</p>
          <p class="sub-instruction" v-if="!hasPlayedAudio">⏺️ Tryck på högtalaren för att börja</p>
        </div>

        <div class="options-container">
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

        <div v-if="answered" class="feedback-section">
          <div class="feedback-bubble" :class="feedbackClass">
            <div class="feedback-emoji">{{ feedbackEmoji }}</div>
            <div class="feedback-text">{{ feedbackText }}</div>
            <button @click="nextQuestion" class="next-btn">
              {{ isLastQuestion ? 'Avsluta övning' : 'Nästa fråga' }} →
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
      allWords: [] // Lagra alla ord från databasen
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

    checkAnswer(selectedOption) {
      this.answered = true;
      this.selectedAnswer = selectedOption;
      
      if (selectedOption.correct) {
        this.score++;
      }
    },

    nextQuestion() {
      if (this.isLastQuestion) {
        this.finishPractice();
      } else {
        this.currentQuestionIndex++;
        this.answered = false;
        this.selectedAnswer = null;
        this.hasPlayedAudio = false;
      }
    },

    finishPractice() {
      this.savePracticeProgress();
      alert(`Övning avslutad! 🎉\nDu fick ${this.score} av ${this.questions.length} rätt!`);
      this.$router.push('/dashboard');
    },

    savePracticeProgress() {
      const progress = JSON.parse(localStorage.getItem('learningProgress') || '{}');
      progress.listeningPractice = (progress.listeningPractice || 0) + 1;
      progress.learnedWords = Math.min(125, (progress.learnedWords || 0) + this.score);
      localStorage.setItem('learningProgress', JSON.stringify(progress));
    },

    goBack() {
      this.$router.back();
    }
  }}
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
}

.next-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
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
}
</style>