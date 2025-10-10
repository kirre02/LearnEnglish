<template>
  <div class="dashboard">
    <!-- Toppsektion med bubbeltegel och ballonger -->
    <div class="top-section">
      <div class="floating-balloons">
        <div class="balloon balloon1">🎈</div>
        <div class="balloon balloon2">🎈</div>
        <div class="balloon balloon3">🎈</div>
      </div>
      
      <div class="welcome-container">
        <div class="welcome-bubble">
          <div class="bubble-tail"></div>
          <h1>Hej {{ user.name }}! 🎉</h1>
          <p>Vad kul att du är här! Vad vill du göra idag?</p>
          <div class="sparkles">✨✨✨</div>
        </div>
        
        <div class="user-info-bubble">
          <div class="user-avatar">😊</div>
          <div class="user-details">
            <div class="word-count">
              <span class="count">0</span>
              <span class="label">ord lärt!</span>
            </div>
            <button @click="handleLogout" class="logout-btn">
              <span class="logout-text">Logga ut</span>
              <span class="logout-emoji">👋</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Framstegs-bubblor -->
    <div class="progress-bubbles">
      <div class="progress-bubble progress-main">
        <div class="bubble-emoji">🚀</div>
        <div class="bubble-content">
          <h3>Ditt äventyr börjar!</h3>
          <p>0 av 125 ord upptäckta</p>
          <div class="progress-ring">
            <div class="ring-fill"></div>
            <span class="ring-text">0%</span>
          </div>
        </div>
      </div>
      
      <div class="progress-bubble fun-bubble">
        <div class="bubble-emoji">🌈</div>
        <div class="bubble-content">
          <h3>Kul att veta!</h3>
          <p>Engelska talas i över 60 länder!</p>
        </div>
      </div>
    </div>

    <!-- Huvudsektion - Vad vill du utforska idag? -->
    <div class="explore-section">
      <div class="section-header">
        <h2>Vad vill du utforska idag? 🗺️</h2>
        <div class="header-decoration">🎨🌟🎯</div>
      </div>
      
      <div class="explore-cards">
        <div class="explore-card card-1" @click="navigateToSection('basic-words')">
          <div class="card-emoji">📚</div>
          <div class="card-wave"></div>
          <h3>Grundläggande</h3>
          <p>Hej, tack, ja & nej</p>
          <div class="card-sparkle">✨</div>
        </div>

        <div class="explore-card card-2" @click="navigateToSection('colors')">
          <div class="card-emoji">🎨</div>
          <div class="card-wave"></div>
          <h3>Färger</h3>
          <p>Regnbågens alla färger</p>
          <div class="card-sparkle">✨</div>
        </div>

        <div class="explore-card card-3" @click="navigateToSection('animals')">
          <div class="card-emoji">🐶</div>
          <div class="card-wave"></div>
          <h3>Djur</h3>
          <p>Djur från hela världen</p>
          <div class="card-sparkle">✨</div>
        </div>

        <div class="explore-card card-4" @click="navigateToSection('numbers')">
          <div class="card-emoji">🔢</div>
          <div class="card-wave"></div>
          <h3>Siffror</h3>
          <p>1, 2, 3... låt oss räkna!</p>
          <div class="card-sparkle">✨</div>
        </div>

        <div class="explore-card card-5" @click="navigateToSection('food')">
          <div class="card-emoji">🍎</div>
          <div class="card-wave"></div>
          <h3>Mat</h3>
          <p>Gott och nyttigt</p>
          <div class="card-sparkle">✨</div>
        </div>

        <div class="explore-card card-6" @click="navigateToSection('family')">
          <div class="card-emoji">👨‍👩‍👧‍👦</div>
          <div class="card-wave"></div>
          <h3>Familj</h3>
          <p>Mamma, pappa & alla andra</p>
          <div class="card-sparkle">✨</div>
        </div>
      </div>
    </div>

    <!-- Snabbknappar -->
    <div class="quick-actions">
      <div class="actions-header">
        <h3>Snabbstart ⚡</h3>
        <div class="action-sparkles">🌟⚡🌟</div>
      </div>
      <div class="action-buttons">
        <button class="action-btn listen-btn" @click="startQuickPractice('listen')">
          <span class="btn-emoji">🎧</span>
          <span>Lyssna</span>
        </button>
        <button class="action-btn match-btn" @click="startQuickPractice('match')">
          <span class="btn-emoji">🔄</span>
          <span>Matcha</span>
        </button>
        <button class="action-btn speak-btn" @click="startQuickPractice('speak')">
          <span class="btn-emoji">🎤</span>
          <span>Upprepa</span>
        </button>
        <button class="action-btn mix-btn" @click="startQuickPractice('mix')">
          <span class="btn-emoji">🎲</span>
          <span>Blandat</span>
        </button>
      </div>
    </div>

    <!-- Uppmuntrande avslutning -->
    <div class="encouragement-footer">
      <div class="encouragement-message">
        <div class="message-emoji">💫</div>
        <div class="message-text">
          <h4>Du är fantastisk! 🌟</h4>
          <p>Kom tillbaka när du känner för det - varje ord är ett steg närmare!</p>
        </div>
        <div class="message-emoji">💫</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user') || '{}')
    }
  },
  mounted() {
    if (!localStorage.getItem('token')) {
      this.$router.push('/');
    }
  },
  methods: {
    handleLogout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/');
    },
    navigateToSection(section) {
      alert(`Öppnar ${section} - kommer snart!`);
    },
    startQuickPractice(type) {
      const types = {
        'listen': 'Lyssna',
        'match': 'Matcha', 
        'speak': 'Upprepa',
        'mix': 'Blandat'
      };
      alert(`${types[type]} övning kommer snart!`);
    }
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  font-family: 'Comic Sans MS', 'Marker Felt', cursive, sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* Flytande ballonger */
.floating-balloons {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1;
}

.balloon {
  font-size: 24px;
  position: absolute;
  animation: float 3s ease-in-out infinite;
}

.balloon1 { top: 0; right: 0; animation-delay: 0s; }
.balloon2 { top: 30px; right: 40px; animation-delay: 1s; }
.balloon3 { top: -10px; right: 80px; animation-delay: 2s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

/* Välkomstsektion */
.top-section {
  position: relative;
  margin-bottom: 30px;
}

.welcome-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.welcome-bubble {
  flex: 2;
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: white;
  padding: 30px;
  border-radius: 35px;
  position: relative;
  box-shadow: 0 15px 35px rgba(255,107,107,0.3);
  animation: bounceIn 1s ease-out;
}

.bubble-tail {
  position: absolute;
  bottom: -15px;
  left: 50px;
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 20px solid #FF8E53;
}

.welcome-bubble h1 {
  margin: 0 0 10px 0;
  font-size: 2.5em;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.welcome-bubble p {
  margin: 0;
  font-size: 1.2em;
  opacity: 0.9;
}

.sparkles {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 1.5em;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.user-info-bubble {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 25px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.user-avatar {
  font-size: 3em;
  text-align: center;
  margin-bottom: 10px;
}

.user-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.word-count {
  text-align: center;
}

.count {
  display: block;
  font-size: 1.8em;
  font-weight: bold;
  color: #FF6B6B;
}

.label {
  font-size: 0.9em;
  color: #666;
}

/* Uppdaterad logout-knapp */
.logout-btn {
  background: linear-gradient(135deg, #FF6B6B, #FF5252);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255,107,107,0.3);
  font-size: 0.9em;
}

.logout-btn:hover {
  transform: scale(1.05);
  background: linear-gradient(135deg, #FF5252, #FF0000);
  box-shadow: 0 6px 20px rgba(255,107,107,0.5);
}

.logout-text {
  font-size: 0.9em;
}

.logout-emoji {
  font-size: 1.1em;
}

/* Framstegs-bubblor */
.progress-bubbles {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 40px;
}

.progress-bubble {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  animation: slideUp 0.8s ease-out;
}

.progress-main {
  border: 3px solid #4ECDC4;
}

.fun-bubble {
  border: 3px solid #FFD700;
}

.bubble-emoji {
  font-size: 3em;
}

.bubble-content h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.3em;
}

.bubble-content p {
  margin: 0 0 15px 0;
  color: #666;
}

.progress-ring {
  position: relative;
  width: 60px;
  height: 60px;
  background: #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-fill {
  position: absolute;
  width: 100%;
  height: 100%;
  background: conic-gradient(#4ECDC4 0%, #e0e0e0 0%);
  border-radius: 50%;
  mask: radial-gradient(transparent 55%, black 56%);
}

.ring-text {
  font-size: 0.8em;
  font-weight: bold;
  color: #333;
}

/* Utforska-sektion */
.explore-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 35px;
  margin-bottom: 30px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.section-header {
  text-align: center;
  margin-bottom: 30px;
}

.section-header h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 2em;
  background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-decoration {
  font-size: 1.5em;
  opacity: 0.8;
}

.explore-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.explore-card {
  position: relative;
  padding: 30px 20px;
  border-radius: 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  color: white;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  animation: cardAppear 0.6s ease-out;
}

.explore-card:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 15px 35px rgba(0,0,0,0.25);
}

.card-1 { background: linear-gradient(135deg, #FF6B6B, #FF8E53); }
.card-2 { background: linear-gradient(135deg, #4ECDC4, #44A08D); }
.card-3 { background: linear-gradient(135deg, #FFD700, #FF8E00); }
.card-4 { background: linear-gradient(135deg, #667eea, #764ba2); }
.card-5 { background: linear-gradient(135deg, #FD746C, #FF9068); }
.card-6 { background: linear-gradient(135deg, #A8FF78, #78FFD6); }

.card-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: rgba(255,255,255,0.2);
  border-radius: 50% 50% 0 0;
}

.card-emoji {
  font-size: 3em;
  margin-bottom: 15px;
  display: block;
}

.explore-card h3 {
  margin: 0 0 8px 0;
  font-size: 1.3em;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}

.explore-card p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9em;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}

.card-sparkle {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 1.2em;
  animation: twinkle 1.5s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* Snabbåtgärder */
.quick-actions {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 30px;
  margin-bottom: 25px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.actions-header {
  text-align: center;
  margin-bottom: 20px;
}

.actions-header h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.5em;
}

.action-sparkles {
  font-size: 1.2em;
  opacity: 0.8;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.action-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 20px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(102,126,234,0.3);
}

.action-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(102,126,234,0.5);
}

.listen-btn { background: linear-gradient(135deg, #FF6B6B, #FF8E53); }
.match-btn { background: linear-gradient(135deg, #4ECDC4, #44A08D); }
.speak-btn { background: linear-gradient(135deg, #FFD700, #FF8E00); }
.mix-btn { background: linear-gradient(135deg, #A8FF78, #78FFD6); }

.btn-emoji {
  font-size: 1.5em;
}

/* Uppmuntrande footer */
.encouragement-footer {
  text-align: center;
}

.encouragement-message {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 30px;
  border-radius: 25px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  animation: pulse 2s ease-in-out infinite;
}

.message-emoji {
  font-size: 1.5em;
}

.message-text h4 {
  margin: 0;
  color: #333;
  font-size: 1.1em;
}

.message-text p {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 0.9em;
}

/* Animationer */
@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes slideUp {
  0% { transform: translateY(30px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes cardAppear {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

/* Responsiv design */
@media (max-width: 768px) {
  .welcome-container {
    flex-direction: column;
  }
  
  .progress-bubbles {
    grid-template-columns: 1fr;
  }
  
  .explore-cards {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .encouragement-message {
    flex-direction: column;
    text-align: center;
  }
  
  .floating-balloons {
    display: none;
  }
  
  .user-details {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
