<template>
  <div class="djur-page-container" @keydown="handleKeydown" tabindex="0" ref="pageContainer">
    <div class="djur-container">
      <div class="djur-header">
        <button @click="goBack" class="back-btn" ref="backButton">← Tillbaka</button>
        <div class="quiz-progress">
          <span class="progress-text">Fråga {{ currentQuestionIndex + 1 }} av {{ questions.length }}</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="progressBarStyle"></div>
          </div>
        </div>
      </div>

      <div v-if="!quizFinished" class="djur-content">
        <div class="question-bubble">
          <div class="question-header">
            <div class="question-emoji">🐾</div>
          </div>
          <h2>{{ currentQuestion.question }}</h2>
          <div class="question-hint" v-if="currentQuestion.hint">
            💡 {{ currentQuestion.hint }}
          </div>
        </div>

        <div class="options-container">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            @click="checkAnswer(option)"
            :class="['option-btn', getOptionClass(option)]"
            :disabled="answered"
            :ref="el => { if (el) optionButtons[index] = el }"
            :tabindex="answered ? -1 : 0"
          >
            <span class="option-emoji">{{ getOptionEmoji(index) }}</span>
            <span class="option-text">{{ option }}</span>
            <button
              v-if="shouldShowOptionAudio(option)"
              @click.stop="playOptionAudio(option)"
              class="option-audio-btn"
              :disabled="audioLoading"
              :aria-label="`Hör uttal av ${option}`"
              :ref="el => { if (el) optionAudioButtons[index] = el }"
              tabindex="-1"
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
            ref="audioHintButton"
            tabindex="0"
          >
            <span v-if="audioLoading && currentLoadingOption === 'correct-answer'">⏳ Laddar...</span>
            <span v-else>🔊 Hör rätt svar</span>
          </button>
          <button @click="nextQuestion" class="next-btn" ref="nextButton" tabindex="0">
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
            <button @click="restartQuiz" class="action-btn play-again-btn" tabindex="0">
              🎮 Spela igen
            </button>
            <button @click="goToAllResults" class="action-btn results-btn" tabindex="0">
              📊 Se alla resultat
            </button>
            <button @click="goToDashboard" class="action-btn dashboard-btn" tabindex="0">
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
  name: 'Djur',
  data() {
    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const initialQuestions = [
      // Standardfrågor (används som fallback)
      { question: "Vad betyder 'hund' på engelska?", options: shuffleArray(["dog", "cat", "bird", "fish"]), correctAnswer: "dog", hint: "Ett populärt husdjur som skäller", audioText: "dog" },
      { question: "Vad betyder 'katt' på engelska?", options: shuffleArray(["cat", "dog", "rabbit", "hamster"]), correctAnswer: "cat", hint: "Ett litet rovdjur som jagar möss", audioText: "cat" },
      { question: "Vad betyder 'fågel' på engelska?", options: shuffleArray(["bird", "fish", "butterfly", "bee"]), correctAnswer: "bird", hint: "Har vingar och kan flyga", audioText: "bird" },
      { question: "Vad betyder 'häst' på engelska?", options: shuffleArray(["horse", "cow", "pig", "sheep"]), correctAnswer: "horse", hint: "Ett stort djur som man kan rida på", audioText: "horse" },
      { question: "Vad betyder 'lejon' på engelska?", options: shuffleArray(["lion", "tiger", "elephant", "giraffe"]), correctAnswer: "lion", hint: "Kungen av djungeln", audioText: "lion" }
    ];

    const preparedQuestions = initialQuestions.map(question => {
      return { ...question, options: shuffleArray([...question.options]) };
    });

    return {
      score: 0,
      currentQuestionIndex: 0,
      answered: false,
      selectedAnswer: null,
      quizFinished: false,
      progress: {},
      questions: shuffleArray(preparedQuestions),
      initialQuestions: initialQuestions,
      shuffleArray: shuffleArray,

      // Data för ljud
      audioLoading: false,
      currentLoadingOption: null,
      currentAudio: null,
      isSpeechSupported: 'speechSynthesis' in window,
      
      // Data för tangentbordsnavigation
      focusedElementIndex: 0,
      currentFocusArea: 'options', // 'options', 'feedback', 'results'
      optionButtons: [],
      optionAudioButtons: [],
      navigationElements: []
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
      const percentage = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
      return { width: `${percentage}%` };
    },
    isAnswerCorrect() {
      return this.selectedAnswer === this.currentQuestion.correctAnswer;
    },
    feedbackClass() {
      return this.isAnswerCorrect ? 'correct' : 'incorrect';
    },
    feedbackEmoji() {
      return this.isAnswerCorrect ? '🎉' : '💡';
    },
    feedbackText() {
      return this.isAnswerCorrect
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
      if (percentage >= 80) return 'Du kan alla djurord galant!';
      if (percentage >= 60) return 'Du kan många djurord!';
      return 'Fortsätt öva på djurorden, du lär dig snabbt!';
    },
    
    // Beräkna navigeringselement
    feedbackElements() {
      const elements = [];
      if (!this.isAnswerCorrect && this.answered) {
        elements.push('audioHint');
      }
      elements.push('nextButton');
      return elements;
    }
  },
  watch: {
    currentQuestionIndex() {
      this.$nextTick(() => {
        this.initializeNavigation();
      });
    },
    answered(newVal) {
      this.$nextTick(() => {
        if (newVal) {
          this.switchToFeedbackNavigation();
        } else {
          this.switchToOptionsNavigation();
        }
      });
    },
    quizFinished(newVal) {
      this.$nextTick(() => {
        if (newVal) {
          this.currentFocusArea = 'results';
          this.focusOnFirstResultButton();
        }
      });
    }
  },
  mounted() {
    if (this.$route.query.showResults === 'true') {
      const savedState = localStorage.getItem('lastQuizState');
      if (savedState) {
        try {
          const quizState = JSON.parse(savedState);
          this.quizFinished = true;
          this.score = quizState.score;
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

    this.fetchQuizQuestions().then(() => {
      // Fokusera på containern för tangentbordsnavigation
      this.$nextTick(() => {
        if (this.$refs.pageContainer) {
          this.$refs.pageContainer.focus();
        }
        // Kalla på scroll och navigation först när datan är redo
        this.scrollToQuestion(); // <-- NYT: Scrolla upp till första frågan
        this.initializeNavigation();
      });
    });
  },    
  methods: {
    // NYA: Metoder för tangentbordsnavigation och fokus
    initializeNavigation() {
      this.focusedElementIndex = 0;
      this.currentFocusArea = 'options';
      this.optionButtons = [];
      this.optionAudioButtons = [];
      
      this.$nextTick(() => {
        if (this.answered) {
          this.focusOnFeedback();
        } else {
          this.focusOnFirstOption();
        }
      });
    },

    focusOnFirstOption() {
      if (this.optionButtons.length > 0 && this.optionButtons[0]) {
        this.optionButtons[0].focus();
        this.focusedElementIndex = 0;
      }
    },

    focusOnFeedback() {
      const elements = this.getFeedbackElements();
      if (elements.length > 0) {
        elements[0].focus();
        this.focusedElementIndex = 0;
        this.startBlinkingEffect(elements[0]);
      }
      this.currentFocusArea = 'feedback';
    },

    focusOnFirstResultButton() {
      this.currentFocusArea = 'results';
      this.focusedElementIndex = 0;
      this.$nextTick(() => {
        const resultsButtons = this.$el.querySelectorAll('.action-btn');
        if (resultsButtons.length > 0) {
          resultsButtons[0].focus();
        }
      });
    },
    
    getFeedbackElements() {
      const elements = [];
      // Kontrollera om hint-knappen ska visas
      if (!this.isAnswerCorrect && this.$refs.audioHintButton) {
        elements.push(this.$refs.audioHintButton);
      }
      // Lägg alltid till Nästa-knappen
      if (this.$refs.nextButton) {
        elements.push(this.$refs.nextButton);
      }
      return elements;
    },

    startBlinkingEffect(element) {
      if (!element) return;
      if (element.classList.contains('blinking')) return;

      element.classList.add('blinking');
      setTimeout(() => {
        element.classList.remove('blinking');
      }, 2000); // Blinka i 2 sekunder
    },

    // UPPDATERAD: Hanterar nu ArrowUp/Down för vertikal, och ArrowLeft/Right för horisontell navigering
    handleKeydown(event) {
      // Hantera Enter/Space för aktivering (oavsett var fokus är)
      if (event.key === 'Enter' || event.key === ' ') {
        if (document.activeElement && 
            (document.activeElement.tagName === 'BUTTON' || document.activeElement.tagName === 'A')) {
          event.preventDefault();
          document.activeElement.click();
        } else if (this.currentFocusArea === 'options' && !this.answered) {
            // Om fokus är på container, aktivera det fokuserade alternativet
            this.activateFocusedElement();
            event.preventDefault();
        }
        return;
      }
      
      if (this.quizFinished) return;

      // Hantera vertikal navigering (Endast för 'options')
      if (this.currentFocusArea === 'options') {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          this.navigateOptions(1);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          this.navigateOptions(-1);
        }
      } 
      // Hantera horisontell navigering (Endast för 'feedback')
      else if (this.currentFocusArea === 'feedback') {
        // Horisontell navigation mellan knappar
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          this.navigateFeedback(1);
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          this.navigateFeedback(-1);
        }
        // Tillåt ArrowUp/Down att fungera som Left/Right om det bara finns 2 element (standard UX för snabbhet)
        else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const direction = (event.key === 'ArrowDown') ? 1 : -1;
            this.navigateFeedback(direction);
        }
      }
    },

    // ÅTGÄRDAD: Flyttar nu ETT steg åt gången vertikalt, med wrap-around
    navigateOptions(direction) {
      if (this.answered) return;
      
      const buttons = this.optionButtons.filter(b => b); 
      if (buttons.length === 0) return;

      const currentIndex = buttons.findIndex(b => b === document.activeElement);
      // Använd currentIndex om vi är fokuserade, annars utgå från focusedElementIndex
      let currentFocus = currentIndex !== -1 ? currentIndex : this.focusedElementIndex;
      
      let newIndex = currentFocus + direction;
      
      // Wrap-around logik
      if (newIndex >= buttons.length) {
        newIndex = 0; // Gå från sista till första
      } else if (newIndex < 0) {
        newIndex = buttons.length - 1; // Gå från första till sista
      }
      
      if (buttons[newIndex]) {
        buttons[newIndex].focus();
        this.focusedElementIndex = newIndex;
      }
    },

    // UPPDATERAD: Navigerar nu horisontellt i feedback-bubblan, ett steg åt gången
    navigateFeedback(direction) {
      if (!this.answered) return;
      
      const elements = this.getFeedbackElements();
      if (elements.length === 0) return;
      
      const currentIndex = elements.findIndex(el => el === document.activeElement);
      let currentFocus = currentIndex !== -1 ? currentIndex : this.focusedElementIndex;
      
      let newIndex = currentFocus + direction;

      // Wrap-around logik
      if (newIndex >= elements.length) {
        newIndex = 0; 
      } else if (newIndex < 0) {
        newIndex = elements.length - 1; 
      }
      
      const element = elements[newIndex];
      if (element) {
        element.focus();
        this.focusedElementIndex = newIndex;
      }
    },

    activateFocusedElement() {
      if (this.answered) {
        return; 
      } else {
        const buttons = this.optionButtons.filter(b => b);
        let elementToClick = buttons[this.focusedElementIndex];
        
        if (elementToClick) {
          const optionTextElement = elementToClick.querySelector('.option-text');
          if (optionTextElement) {
            const option = optionTextElement.innerText.trim();
            this.checkAnswer(option);
          }
        }
      }
    },

    switchToFeedbackNavigation() {
      this.currentFocusArea = 'feedback';
      
      this.$nextTick(() => {
        this.focusOnFeedback();
      });
    },

    switchToOptionsNavigation() {
      this.currentFocusArea = 'options';
      this.focusedElementIndex = 0;
      
      this.$nextTick(() => {
        this.focusOnFirstOption();
      });
    },

    // --- Befintliga metoder ---
    async fetchQuizQuestions() {
      try {
        const response = await fetch('http://localhost:9001/api/words/category/djur');
        
        if (response.ok) {
          const words = await response.json();
          
          if (words.length > 0) {
            const dbWords = words.slice(0, 5);
            
            const dbQuestions = dbWords.map(word => {
              const otherWords = words.filter(w => w.id !== word.id);
              const incorrectOptions = this.shuffleArray(otherWords)
                .slice(0, 3)
                .map(w => w.english);
              
              const allOptions = this.shuffleArray([
                word.english,
                ...incorrectOptions
              ]);

              return {
                question: `Vad betyder '${word.swedish}' på engelska?`,
                options: allOptions,
                correctAnswer: word.english,
                hint: word.hint || `Ord från djurkategorin`,
                audioText: word.english
              };
            });

            this.questions = this.shuffleArray(dbQuestions);
            this.initialQuestions = dbQuestions;
          }
        } else {
          console.error('Kunde inte hämta ord från databasen');
        }
      } catch (error) {
        console.error('Fel vid hämtning av ord:', error);
      }
    },

    getOptionEmoji(index) {
      const emojis = ['🇦', '🇧', '🇨', '🇩'];
      return emojis[index];
    },
    getOptionClass(option) {
      if (!this.answered) return '';
      
      if (option === this.selectedAnswer) {
        return option === this.currentQuestion.correctAnswer ? 'correct' : 'incorrect';
      }
      
      if (option === this.currentQuestion.correctAnswer && this.answered) {
        return 'correct';
      }
      
      return '';
    },
    
    checkAnswer(selectedAnswer) {
      if (this.answered) return; 

      this.answered = true;
      this.selectedAnswer = selectedAnswer;

      if (selectedAnswer === this.currentQuestion.correctAnswer) {
        this.score++;
      }
      
      this.$nextTick(() => {
        this.switchToFeedbackNavigation();
      });
    },
    
   nextQuestion() {
            if (this.isLastQuestion) {
                this.finishQuiz();
            } else {
                this.currentQuestionIndex++;
                this.answered = false;
                this.selectedAnswer = null;

                // NY LOGIK: Scrolla upp och sätt fokus på första alternativet.
                this.$nextTick(() => {
                    this.scrollToQuestion();
                    // initializeNavigation kommer anropas via 'watch' på currentQuestionIndex,
                    // men vi kan kalla den direkt för snabbare fokus-sättning.
                    this.initializeNavigation(); 
                });
            }
        },
        scrollToQuestion() {
            // Försök hitta containern för frågan, eller bara scrolla till toppen av Djur-containern.
            const questionContainer = this.$el.querySelector('.djur-content'); 
            
            if (questionContainer) {
                // Använder 'smooth' för en mjukare övergång
                questionContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (this.$refs.pageContainer) {
                 // Fallback: Scrolla till toppen av hela quiz-sidan
                 this.$refs.pageContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          total: this.questions.length,
          category: 'djur'
        };

        const response = await fetch('http://localhost:9001/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
    restartQuiz() {
      this.fetchQuizQuestions().then(() => {
        this.score = 0;
        this.currentQuestionIndex = 0;
        this.answered = false;
        this.selectedAnswer = null;
        this.quizFinished = false;
        this.$nextTick(() => {
          this.initializeNavigation();
        });
      });
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        this.$router.push('/dashboard');
      }
    },
    goToDashboard() {
      this.$router.push('/dashboard');
    },
    goToAllResults() {
      this.$router.push({ path: '/results', query: { showResults: 'true' } });
    },

    // Ljudmetoder
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
  }
}
</script>

<style scoped>
/* Befintlig CSS */
.djur-page-container {
  min-height: 100vh;
  background-color: #f7f3ed;
  padding: 20px;
  font-family: 'Comic Sans MS', 'Marker Felt', cursive, sans-serif;
}
.djur-container { max-width: 600px; margin: 0 auto; }
.djur-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.back-btn { background: linear-gradient(135deg, #4ECDC4, #44A08D); color: white; border: none; padding: 10px 15px; border-radius: 20px; cursor: pointer; font-weight: bold; transition: all 0.3s ease; }
.back-btn:hover { transform: translateX(-5px); }
.quiz-progress { text-align: right; }
.progress-text { display: block; margin-bottom: 5px; color: #666; font-size: 0.9em; }
.progress-bar { width: 150px; height: 8px; background: #e0e0e0; border-radius: 10px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(135deg, #4ECDC4, #44A08D); transition: width 0.3s ease; }
.question-bubble { background: linear-gradient(135deg, #4ECDC4, #44A08D); color: white; padding: 30px; border-radius: 25px; display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 30px; box-shadow: 0 10px 25px rgba(78, 205, 196, 0.3); }
.question-header { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 0; width: 100%; }
.question-emoji { font-size: 3em; margin-bottom: 15px; }
.question-bubble h2 { margin: 0 0 15px 0; font-size: 1.5em; }
.question-hint { background: rgba(255,255,255,0.2); padding: 10px 15px; border-radius: 15px; font-size: 0.9em; margin-top: 15px; }
.options-container { display: grid; gap: 15px; margin-bottom: 30px; }
.option-btn { background: white; border: 3px solid #E2E8F0; padding: 20px; border-radius: 15px; cursor: pointer; display: flex; align-items: center; gap: 15px; transition: all 0.3s ease; font-size: 1.1em; font-weight: bold; position: relative; }
.option-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-color: #4ECDC4; }
.option-btn.correct { border-color: #4ECDC4; background: #4ECDC4; color: white; transform: scale(1.02); }
.option-btn.incorrect { border-color: #FF6B6B; background: #FF6B6B; color: white; transform: scale(1.02); }
.option-btn:disabled { cursor: not-allowed; opacity: 0.8; }
.option-emoji { font-size: 1.2em; }
.option-audio-btn { background: rgba(0, 0, 0, 0.1); border: none; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.9em; margin-left: auto; transition: all 0.3s ease; flex-shrink: 0; }
.option-audio-btn:hover:not(:disabled) { background: rgba(0, 0, 0, 0.2); transform: scale(1.1); }
.option-audio-btn:disabled { cursor: not-allowed; opacity: 0.6; }
.feedback-bubble { padding: 25px; border-radius: 20px; text-align: center; animation: slideUp 0.5s ease-out; }
.feedback-bubble.correct { background: linear-gradient(135deg, #4ECDC4, #44A08D); color: white; }
.feedback-bubble.incorrect { background: linear-gradient(135deg, #FF9A8B, #FF6A88); color: white; }
.feedback-emoji { font-size: 3em; margin-bottom: 15px; }
.feedback-text { font-size: 1.2em; margin-bottom: 20px; }
.audio-hint-btn { background: rgba(255, 255, 255, 0.2); border: 1px solid white; border-radius: 20px; padding: 10px 20px; color: white; cursor: pointer; margin-bottom: 15px; transition: all 0.3s ease; font-size: 0.9em; min-width: 140px; }
.audio-hint-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.3); transform: scale(1.05); }
.audio-hint-btn:disabled { cursor: not-allowed; opacity: 0.6; }
.next-btn { background: white; color: #333; border: none; padding: 12px 25px; border-radius: 20px; cursor: pointer; font-weight: bold; font-size: 1em; transition: all 0.3s ease; }
.next-btn:hover { transform: scale(1.05); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
.results-container { text-align: center; }
.results-bubble { padding: 40px; border-radius: 25px; text-align: center; color: white; animation: bounceIn 0.8s ease-out; }
.results-bubble.excellent { background: linear-gradient(135deg, #4ECDC4, #44A08D); }
.results-bubble.good { background: linear-gradient(135deg, #FF9A8B, #FF6A88); }
.results-bubble.ok { background: linear-gradient(135deg, #FF6B6B, #FF8E53); }
.results-emoji { font-size: 4em; margin-bottom: 20px; }
.results-bubble h2 { margin: 0 0 15px 0; font-size: 2em; }
.results-score { font-size: 1.5em; margin: 0 0 15px 0; font-weight: bold; }
.results-message { font-size: 1.1em; margin: 0 0 30px 0; opacity: 0.9; }
.results-actions { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }
.action-btn { border: none; padding: 15px 25px; border-radius: 20px; cursor: pointer; font-weight: bold; font-size: 1em; transition: all 0.3s ease; color: white; }
.play-again-btn { background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); }
.results-btn { background: rgba(102, 126, 234, 0.8); backdrop-filter: blur(10px); }
.dashboard-btn { background: rgba(0,0,0,0.2); backdrop-filter: blur(10px); }
.action-btn:hover { transform: scale(1.05); box-shadow: 0 5px 15px rgba(0,0,0,0.3); }

/* Blink-effekt för fokuserade element */
.blinking {
  animation: blink 0.6s ease-in-out 3;
  transform: scale(1.05);
  box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.5);
}

@keyframes blink {
  0%, 100% { 
    transform: scale(1.05);
    box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.5);
  }
  50% { 
    transform: scale(1.08);
    box-shadow: 0 0 0 5px rgba(78, 205, 196, 0.8);
  }
}

/* Förbättra fokus-stilar */
.option-btn:focus,
.audio-hint-btn:focus,
.next-btn:focus,
.action-btn:focus,
.back-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.5);
  transform: scale(1.02);
}

/* Se till att page container kan ta fokus */
.djur-page-container:focus {
  outline: none;
}

/* Övriga animationer och media queries */
@keyframes slideUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
@keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { transform: scale(1); opacity: 1; } }

@media (max-width: 768px) {
  .djur-header { flex-direction: column; gap: 15px; }
  .quiz-progress { text-align: center; }
  .results-actions { flex-direction: column; }
  .action-btn { width: 100%; }
  .option-btn { padding: 15px; }
  .option-audio-btn { width: 30px; height: 30px; }
}
</style>