<template>
  <div class="vardagsord-page-container" @keydown="handleKeydown" tabindex="0">
    <div class="vardagsord-container">

      <div class="vardagsord-header" v-if="!isResultsMode">
        <button @click="goBack" class="back-btn">← Tillbaka</button>
        <div class="quiz-progress">
          <span class="progress-text">Fråga {{ currentQuestionIndex + 1 }} av {{ questions.length }}</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="progressBarStyle"></div>
          </div>
        </div>
        <button @click="confirmCancelQuiz" class="cancel-quiz-btn">
          🏠 Avbryt quiz
        </button>
      </div>

      <div v-if="!isResultsMode">

        <div v-if="loading" class="loading-container">
          <div class="loading-bubble">
            <div class="loading-emoji">⏳</div>
            <h3>Hämtar frågor...</h3>
            <p>Var god vänta medan vi förbereder ditt quiz!</p>
          </div>
        </div>

        <div v-else-if="!quizFinished && currentQuestion" class="vardagsord-content">
          <div class="question-bubble">
            <div class="question-header">
              <div class="question-emoji">🏠</div>
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
              :class="['option-btn', getOptionClass(option), { 'focused': focusedOptionIndex === index }]"
              :disabled="answered"
              ref="optionButtons"
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

          <div v-if="answered" class="feedback-bubble" :class="feedbackClass" ref="feedbackSection">
            <div class="feedback-emoji">{{ feedbackEmoji }}</div>
            <div class="feedback-text">{{ feedbackText }}</div>
            <div class="feedback-actions" ref="feedbackActions">
              <button
                v-if="!isAnswerCorrect"
                @click="playCorrectAnswerAudio"
                class="audio-hint-btn"
                :disabled="audioLoading"
                :class="{ 'focused': focusedAction === 'audio', 'pulse': shouldPulseAudioButton }"
                ref="audioButton"
              >
                <span v-if="audioLoading && currentLoadingOption === 'correct-answer'">⏳ Laddar...</span>
                <span v-else>🔊 Hör rätt svar</span>
              </button>
              <button
                @click="nextQuestion"
                class="next-btn"
                :class="{ 'pulse': shouldPulseNextButton, 'focused': focusedAction === 'next' }"
                ref="nextButton"
              >
                {{ isLastQuestion ? 'Se resultat' : 'Nästa fråga' }} →
              </button>
            </div>
          </div>
        </div>

        <div v-else-if="quizFinished" class="results-container">
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
        
        <div v-else class="loading-container">
          <h3>Laddar...</h3>
        </div>
      </div>

      <div v-else-if="isResultsMode" class="results-page">
        <h2 class="results-title">🏠 Dina quizresultat - Vardagsord</h2>
        <h3 style="color:#555; margin-bottom:20px;">
          Här ser du alla dina tidigare quizresultat 📊
        </h3>

        <table v-if="results.length" class="results-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Poäng</th>
              <th>Totalt</th>
              <th>Procent</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, index) in results" :key="index">
              <td>{{ new Date(r.created_at).toLocaleDateString('sv-SE') }}</td>
              <td>{{ r.correct_answers }}</td>
              <td>{{ r.correct_answers + r.wrong_answers }}</td>
              <td>{{ Math.round((r.correct_answers / (r.correct_answers + r.wrong_answers)) * 100) }}%</td>
            </tr>
          </tbody>
        </table>

        <p v-else class="no-results">Inga quizresultat ännu. Gör ett quiz först 🏠</p>

        <button @click="goBackFromResults" class="action-btn back-from-results-btn">⬅️ Tillbaka</button>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'Vardagsord',
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
      { question: "Vad betyder 'hus' på engelska?", options: shuffleArray(["house", "car", "tree", "street"]), correctAnswer: "house", hint: "Där man bor", audioText: "house" },
      { question: "Vad betyder 'bil' på engelska?", options: shuffleArray(["car", "bicycle", "bus", "train"]), correctAnswer: "car", hint: "Kör man på vägen", audioText: "car" },
      { question: "Vad betyder 'dörr' på engelska?", options: shuffleArray(["door", "window", "wall", "roof"]), correctAnswer: "door", hint: "Man går igenom den för att komma in", audioText: "door" },
      { question: "Vad betyder 'fönster' på engelska?", options: shuffleArray(["window", "door", "wall", "floor"]), correctAnswer: "window", hint: "Man tittar ut genom den", audioText: "window" },
      { question: "Vad betyder 'bord' på engelska?", options: shuffleArray(["table", "chair", "book", "pen"]), correctAnswer: "table", hint: "Man äter vid den", audioText: "table" }
    ];

    return {
      score: 0,
      currentQuestionIndex: 0,
      answered: false,
      selectedAnswer: null,
      quizFinished: false,
      progress: {},
      questions: [],
      results: [],
      loading: true,
      initialQuestions: initialQuestions,
      shuffleArray: shuffleArray,

      // Data för ljud
      audioLoading: false,
      currentLoadingOption: null,
      currentAudio: null,
      isSpeechSupported: 'speechSynthesis' in window,

      // Data för användarvänlighet
      focusedOptionIndex: 0,
      focusedAction: 'next',
      shouldPulseNextButton: false,
      pulseAudioButton: false,

      isResultsMode: false
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
      if (percentage >= 80) return 'Du är en riktig vardagsordsexpert!';
      if (percentage >= 60) return 'Du kan mycket om vardagsord!';
      return 'Fortsätt öva, så blir du bättre på vardagsord!';
    },
    isAnswerCorrect() {
      return this.selectedAnswer === this.currentQuestion.correctAnswer;
    },
    shouldPulseNextButton() {
      return this.answered && this.isAnswerCorrect;
    },
    shouldPulseAudioButton() {
      return this.pulseAudioButton;
    }
  },
  async mounted() {
    this.$el.focus();
    
    this.isResultsMode = this.$route.path.includes('/vardagsord/results') || this.$route.query.showResults === 'true';
    
    try {
      if (this.isResultsMode) {
        console.log("📊 Laddar quizresultat för vardagsord...");
        await this.loadPastResults();
      } else {
        console.log("🏠 Laddar vardagsordsfrågor...");
        
        if (this.$route.query.continue === 'true') {
          this.loadSavedQuiz();
        } else {
          await this.fetchQuizQuestions();
          this.loadCurrentQuizState();
        }
      }
    } catch (err) {
      console.error("Init error:", err);
    } finally {
      this.loading = false;
    }
    
    if (!localStorage.getItem('token')) {
      this.$router.push('/');
    }
    this.loadProgress();

    if (!this.isSpeechSupported) {
      console.log('Web Speech API är inte tillgängligt i denna webbläsare');
    }
  },
  
  methods: {
    goToAllResults() {
      this.isResultsMode = true;
      this.loadPastResults();
    },

    goBackFromResults() {
      this.isResultsMode = false;
      this.$router.push('/practice');
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
      this.focusedOptionIndex = 0;
      this.focusedAction = 'next';
      this.pulseAudioButton = false;
      this.isResultsMode = false;

      localStorage.removeItem('currentQuizState');
      localStorage.removeItem('savedQuizState');

      this.$nextTick(() => {
        this.$el.focus();
      });
    },

    async loadPastResults() {
  this.loading = true;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id || 1;
    
    console.log("🔍 Hämtar resultat för user_id:", userId);
    
    const response = await fetch(`http://localhost:9001/api/quiz/quiz-results/${userId}`);
    
    if (!response.ok) {
      console.error("❌ API fel:", response.status);
      throw new Error('Kunde inte hämta quizresultat');
    }

    const allData = await response.json();
    console.log("📊 ALLA Data från API:", allData);
    
    // Visa ALLA quiz_type värden som finns
    const quizTypes = [...new Set(allData.map(r => r.quiz_type))];
    console.log("🎯 Quiz types som finns:", quizTypes);
    
    // Filtrera för djur
    const djurResults = allData.filter(r => {
      const type = r.quiz_type ? r.quiz_type.toLowerCase() : '';
      return type === 'djur';
    });
    
    console.log("🐾 Djur-resultat hittades:", djurResults.length);
    
    // ⚠️ TEMPORÄRT: Om inga djur-resultat, visa ALLA för debugging
    if (djurResults.length === 0 && allData.length > 0) {
      console.log("⚠️ INGA DJUR-RESULTAT! Visar ALLA resultat temporärt:");
      this.results = allData.slice(0, 10).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      this.results = djurResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    console.log("✅ Resultat som visas:", this.results.length);
  } catch (err) {
    console.error("❌ Fel vid hämtning av quizresultat:", err);
    this.results = [];
  } finally {
    this.loading = false;
  }
},
    handleKeydown(event) {
      if (this.quizFinished || this.isResultsMode) return; 

      if (!this.answered) {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          this.focusedOptionIndex = (this.focusedOptionIndex - 1 + this.currentQuestion.options.length) % this.currentQuestion.options.length;
          this.scrollToFocusedOption();
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          this.focusedOptionIndex = (this.focusedOptionIndex + 1) % this.currentQuestion.options.length;
          this.scrollToFocusedOption();
        } else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.checkAnswer(this.currentQuestion.options[this.focusedOptionIndex]);
        }
      } else {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          if (!this.isAnswerCorrect) {
            this.focusedAction = 'audio';
            this.focusCurrentAction();
          }
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          if (!this.isAnswerCorrect) {
            this.focusedAction = 'next';
            this.focusCurrentAction();
          }
        } else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (this.focusedAction === 'next') {
            this.nextQuestion();
          } else if (this.focusedAction === 'audio') {
            this.playCorrectAnswerAudio();
          }
        } else if (event.key === 'Escape') {
          event.preventDefault();
          if (this.isAnswerCorrect) {
            this.nextQuestion();
          }
        }
      }
    },

    scrollToFocusedOption() {
      this.$nextTick(() => {
        if (this.$refs.optionButtons && this.$refs.optionButtons[this.focusedOptionIndex]) {
          this.$refs.optionButtons[this.focusedOptionIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      });
    },

    focusCurrentAction() {
      this.$nextTick(() => {
        if (this.focusedAction === 'next' && this.$refs.nextButton) {
          this.$refs.nextButton.focus();
        } else if (this.focusedAction === 'audio' && this.$refs.audioButton) {
          this.$refs.audioButton.focus();
        }
      });
    },

    confirmCancelQuiz() {
      if (confirm('Vill du avbryta quizet? Ditt framsteg kommer att sparas så du kan fortsätta senare.')) {
        this.cancelQuiz();
      }
    },

    cancelQuiz() {
      const quizState = {
        score: this.score,
        currentQuestionIndex: this.currentQuestionIndex,
        answered: this.answered,
        selectedAnswer: this.selectedAnswer,
        questions: this.questions,
        quizFinished: false,
        timestamp: new Date().getTime()
      };
      localStorage.setItem('savedQuizState', JSON.stringify(quizState));
      localStorage.removeItem('currentQuizState');
      
      this.$router.push('/dashboard');
    },

    loadSavedQuiz() {
      const savedState = localStorage.getItem('savedQuizState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          this.score = state.score || 0;
          this.currentQuestionIndex = state.currentQuestionIndex || 0;
          this.answered = state.answered || false;
          this.selectedAnswer = state.selectedAnswer || null;
          this.questions = state.questions || this.questions;
          this.quizFinished = state.quizFinished || false;
          
          console.log('Fortsätter sparad quiz från fråga:', this.currentQuestionIndex + 1);
          localStorage.removeItem('savedQuizState');
        } catch (e) {
          console.error('Kunde inte ladda sparad quiz:', e);
          this.loadCurrentQuizState();
        }
      } else {
        this.loadCurrentQuizState();
      }
    },

    saveCurrentQuizState() {
      const quizState = {
        score: this.score,
        currentQuestionIndex: this.currentQuestionIndex,
        answered: this.answered,
        selectedAnswer: this.selectedAnswer,
        questions: this.questions,
        quizFinished: this.quizFinished
      };
      localStorage.setItem('currentQuizState', JSON.stringify(quizState));
    },

    loadCurrentQuizState() {
      const savedState = localStorage.getItem('currentQuizState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          this.score = state.score || 0;
          this.currentQuestionIndex = state.currentQuestionIndex || 0;
          this.answered = state.answered || false;
          this.selectedAnswer = state.selectedAnswer || null;
          this.questions = state.questions || this.questions;
          this.quizFinished = state.quizFinished || false;
        } catch (e) {
          console.error('Kunde inte ladda quiz state:', e);
        }
      }
    },

    async fetchQuizQuestions() {
      this.loading = true;
      try {
        const response = await fetch('http://localhost:9001/api/words/category/vardagsord');
        
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
                hint: word.hint || `Ord från vardagsord-kategorin`,
                audioText: word.english
              };
            });

            this.questions = this.shuffleArray(dbQuestions);
            this.initialQuestions = dbQuestions;
          } else {
            this.useFallbackQuestions();
          }
        } else {
          console.error('Kunde inte hämta ord från databasen');
          this.useFallbackQuestions();
        }
      } catch (error) {
        console.error('Fel vid hämtning av ord:', error);
        this.useFallbackQuestions();
      } finally {
        this.loading = false;
      }
    },

    useFallbackQuestions() {
      this.questions = this.shuffleArray([...this.initialQuestions]);
      console.log('Använder fallback-frågor för vardagsord');
    },

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
      if (this.answered) return;

      this.answered = true;
      this.selectedAnswer = selectedAnswer;

      if (selectedAnswer === this.currentQuestion.correctAnswer) {
        this.score++;
        this.pulseAudioButton = false;
      } else {
        this.pulseAudioButton = true;
      }

      this.saveCurrentQuizState();

      this.$nextTick(() => {
        if (this.$refs.feedbackSection) {
          this.$refs.feedbackSection.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }

        if (this.isAnswerCorrect) {
          this.focusedAction = 'next';
          this.$nextTick(() => {
            if (this.$refs.nextButton) {
              this.$refs.nextButton.focus();
            }
          });
        } else {
          this.focusedAction = 'audio';
          this.$nextTick(() => {
            if (this.$refs.audioButton) {
              this.$refs.audioButton.focus();
            }
          });
        }
      });
    },

    nextQuestion() {
      if (this.isLastQuestion) {
        this.finishQuiz();
      } else {
        this.currentQuestionIndex++;
        this.answered = false;
        this.selectedAnswer = null;
        this.focusedOptionIndex = 0;
        this.focusedAction = 'next';
        this.pulseAudioButton = false;
        this.saveCurrentQuizState();

        this.$nextTick(() => {
          this.$el.focus();
          this.focusedOptionIndex = 0;
          this.scrollToFocusedOption();
        });
      }
    },

    goBack() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
        this.answered = false;
        this.selectedAnswer = null;
        this.focusedOptionIndex = 0;
        this.saveCurrentQuizState();
        
        this.$nextTick(() => {
          this.$el.focus();
          this.scrollToFocusedOption();
        });
      } else {
        this.$router.push('/dashboard');
      }
    },
    
    finishQuiz() {
      this.quizFinished = true;
      this.updateProgress();
      this.saveQuizResult();
      this.saveQuizStateForResults();
      localStorage.removeItem('currentQuizState');
      localStorage.removeItem('savedQuizState');
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
    const user = JSON.parse(localStorage.getItem('user'));
    const totalQuestions = this.questions.length;
    const percentage = Math.round((this.score / totalQuestions) * 100);

    const resultData = {
      userId: user?.id || 1,
      correctAnswers: this.score,
      wrongAnswers: totalQuestions - this.score,
      totalQuestions: totalQuestions,
      percentage: percentage,
      quiz_type: "djur"
    };

    console.log("💾 Skickar DJUR quizresultat:", resultData);
    console.log("📝 Antal frågor:", totalQuestions);
    console.log("🎯 Poäng:", this.score);
    console.log("📊 Procent:", percentage + "%");

    const response = await fetch("http://localhost:9001/api/quiz/quiz-results", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(resultData),
    });

    console.log("📨 Response status:", response.status);

    if (response.ok) {
      const savedResult = await response.json();
      console.log("✅ DJUR Quizresultat sparat i databasen:", savedResult);
      
      // Ladda om resultaten direkt
      setTimeout(() => {
        this.loadPastResults();
      }, 1000);
    } else {
      const errorText = await response.text();
      console.error("❌ Misslyckades att spara DJUR quizresultat:", response.status, errorText);
    }
  } catch (error) {
    console.error("💥 Fel vid sparande av DJUR quizresultat:", error);
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
    
    goToDashboard() {
      this.$router.push('/dashboard');
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

      this.$nextTick(() => {
        this.focusedAction = 'next';
        if (this.$refs.nextButton) {
          this.$refs.nextButton.focus();
        }
      });
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
    }
  },
  
  watch: {
    '$route'(to) {
      if (to.path.includes('/vardagsord/results')) {
        console.log("📡 Route changed → reload vardagsord results");
        this.isResultsMode = true;
        this.loadPastResults();
      } else if (this.isResultsMode) {
        this.isResultsMode = false;
      }
    }
  },

  beforeUnmount() {
    if (this.isSpeechSupported) {
      speechSynthesis.cancel();
    }
    if (!this.quizFinished && !localStorage.getItem('savedQuizState') && !this.isResultsMode) { 
      this.saveCurrentQuizState();
    }
  }
}
</script>
<style scoped>
/* Vardagsord-specifik styling med samma layout som Djur */
.vardagsord-page-container {
	min-height: 100vh;
	background-color: #f7f3ed;
	padding: 20px;
	font-family: 'Comic Sans MS', 'Marker Felt', cursive, sans-serif;
	outline: none;
}

.vardagsord-container {
	max-width: 600px;
	margin: 0 auto;
}

/* Header */
.vardagsord-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30px;
	gap: 15px;
}

.back-btn {
	background: linear-gradient(135deg, #667EEA, #764BA2);
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

.cancel-quiz-btn {
	background: linear-gradient(135deg, #FF6B6B, #FF5252);
	color: white;
	border: none;
	padding: 10px 15px;
	border-radius: 20px;
	cursor: pointer;
	font-weight: bold;
	transition: all 0.3s ease;
	font-size: 0.9em;
	white-space: nowrap;
}

.cancel-quiz-btn:hover {
	transform: scale(1.05);
	background: linear-gradient(135deg, #FF5252, #FF0000);
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
	background: linear-gradient(135deg, #667EEA, #764BA2);
	transition: width 0.3s ease;
}

/* Loading */
.loading-container {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 400px;
}

.loading-bubble {
	background: linear-gradient(135deg, #667EEA, #764BA2);
	color: white;
	padding: 40px;
	border-radius: 25px;
	text-align: center;
	box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.loading-emoji {
	font-size: 3em;
	margin-bottom: 15px;
}

.loading-bubble h3 {
	margin: 0 0 10px 0;
	font-size: 1.5em;
}

.loading-bubble p {
	margin: 0;
	opacity: 0.9;
}

/* Question Bubble */
.question-bubble {
	background: linear-gradient(135deg, #667EEA, #764BA2);
	color: white;
	padding: 30px;
	border-radius: 25px;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	margin-bottom: 30px;
	box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
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
}

/* Options */
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
	position: relative;
}

.option-btn:hover:not(:disabled),
.option-btn.focused {
	transform: translateY(-3px);
	box-shadow: 0 5px 15px rgba(0,0,0,0.1);
	border-color: #667EEA; /* Tema färg */
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

/* Feedback */
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
	background: linear-gradient(135deg, #667EEA, #764BA2); /* Tema färg */
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
	align-items: center;
	flex-wrap: wrap;
}

.audio-hint-btn {
	background: rgba(255, 255, 255, 0.2);
	border: 1px solid white;
	border-radius: 20px;
	padding: 10px 20px;
	color: white;
	cursor: pointer;
	transition: all 0.3s ease;
	font-size: 0.9em;
	min-width: 140px;
}

.audio-hint-btn:hover:not(:disabled),
.audio-hint-btn.focused {
	background: rgba(255, 255, 255, 0.3);
	transform: scale(1.05);
	border-width: 2px;
}

.audio-hint-btn.pulse {
	animation: pulse 1s infinite;
}

.audio-hint-btn:disabled {
	cursor: not-allowed;
	opacity: 0.6;
}

.next-btn {
	background: white;
	color: #667EEA; /* Ändrad färg för Next-knappen för att matcha quiz-temat */
	border: none;
	border-radius: 20px;
	padding: 12px 25px;
	cursor: pointer;
	font-weight: bold;
	transition: all 0.3s ease;
	font-size: 1em;
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
	min-width: 140px;
}

.next-btn:hover,
.next-btn.focused {
	transform: scale(1.05);
	box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.next-btn.pulse {
	animation: pulse 1s infinite;
}

/*
================================
✅ NY STANDARDISERAD RESULTAT CSS
(Ersätter gammal/lokal resultat-styling)
================================
*/
/* === RESULT SECTION (QUIZ FINISHED) === */
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
	box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
	max-width: 500px;
	width: 90%;
	animation: fadeInUp 0.7s ease-out; 
}

.results-bubble.excellent {
	background: linear-gradient(135deg, #6FE7DD, #349D9E); /* Grön/Mint */
}

.results-bubble.good {
	background: linear-gradient(135deg, #FFB88C, #FF6B6B); /* Orange/Röd */
}

.results-bubble.ok {
	background: linear-gradient(135deg, #FFD1B3, #FF9A8B); /* Rosa/Peach */
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
	border-radius: 25px;
	cursor: pointer;
	font-weight: bold;
	color: white;
	transition: all 0.3s ease;
	font-size: 1em;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	min-width: 150px;
}

.action-btn:hover {
	transform: scale(1.05);
	box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.play-again-btn {
	background: linear-gradient(135deg, #667EEA, #764BA2); /* Vardagsord tema-färg */
	color: white;
	border: none;
	box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4);
}

.results-btn {
	background: linear-gradient(135deg, #B9F5D2, #6F86D6);
	color: white;
}

.dashboard-btn {
	background: linear-gradient(135deg, #FFB88C, #FF6B6B);
	color: white;
}


/* === RESULTS MODE (HISTORY) === */
.results-page {
	padding: 30px; 
	background-color: #ffffff;
	border-radius: 15px; 
	box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1); 
}

.results-page .results-title {
	color: #667EEA; /* Vardagsord tema-färg */
	text-align: center;
	margin-bottom: 15px;
	font-size: 2.2em;
}

.results-table {
	width: 100%;
	border-collapse: separate; 
	border-spacing: 0;
	margin-top: 25px;
	overflow: hidden; 
	border-radius: 10px; 
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.results-table th, .results-table td {
	border-top: 1px solid #e9e9e9;
	padding: 15px 12px;
	text-align: left;
}

.results-table thead th {
	background-color: #667EEA; /* Vardagsord tema-färg */
	color: white;
	font-weight: bold;
	border-bottom: 2px solid #764BA2;
}
/* Rundade hörn för thead */
.results-table thead tr:first-child th:first-child { border-top-left-radius: 10px; }
.results-table thead tr:first-child th:last-child { border-top-right-radius: 10px; }


.results-table tbody tr:nth-child(even) {
	background-color: #fcfcfc;
}

.results-table tbody tr:hover {
	background-color: #f1f3ff; /* Lätt blå/lila hover för Vardagsord-temat */
	transition: background-color 0.2s;
}

.no-results {
	text-align: center;
	color: #999;
	font-style: italic;
	padding: 40px;
	border: 2px dashed #e0e0e0;
	border-radius: 15px;
	margin-top: 25px;
}

.back-from-results-btn {
	margin-top: 30px;
	background: linear-gradient(135deg, #667EEA, #764BA2); /* Vardagsord tema-färg (tillbaka-knapp) */
	color: white;
	padding: 12px 25px;
	border-radius: 25px;
	font-weight: bold;
	cursor: pointer;
	border: none;
	transition: all 0.3s ease;
}

.back-from-results-btn:hover {
	transform: scale(1.05);
	box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}


/* Keyframes (Kvarstår oförändrade) */
@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes pulse {
	0% {
		box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4);
	}
	70% {
		box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
	}
}

.audio-hint-btn.pulse {
	animation: pulse 1s infinite;
}

.next-btn.pulse {
	animation: pulse 1s infinite;
}

@media (max-width: 768px) {
	.vardagsord-header {
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