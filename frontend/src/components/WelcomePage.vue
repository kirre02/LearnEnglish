<template>
  <div class="welcome-page-container">
    
    <div class="app-icon-wrapper">
      <img src="/app-logo.png" alt="Learn English Logo" class="app-logo">
    </div>

    <h1 class="welcome-text">WELCOME !</h1>

    <p class="tagline">Learn English the fun way!</p>
    
    <div class="button-container">
      
      <button @click="goToLogin" class="action-button login-btn">
        <img src="/login-icon.png" alt="Log In Icon" class="button-icon">
        Log In !
      </button>

      <button @click="goToRegister" class="action-button signup-btn">
        <img src="/signup-icon.png" alt="Sign Up Icon" class="button-icon">
        Sign Up !
      </button>
    </div>

    <!-- 
    DENNA DEL ÄR BORTTAGEN:
    <div class="demo-info">
      <p><strong>Testa inloggning:</strong></p>
      <p>E-post: coder1@example.com</p>
      <p>Lösenord: 123</p>
    </div>
    -->

  </div>
</template>

<script>
export default {
  name: 'WelcomePage',
  methods: {
    goToLogin() {
      // Navigerar till /login
      this.$router.push('/login');
    },
    goToRegister() {
      // Navigerar till /register (som nu pekar på LoginForm som placeholder)
      this.$router.push('/register');
    }
  }
}
</script>

<style scoped>
/* BAKGRUND & CENTRERING */
.welcome-page-container {
  min-height: 100vh;
  /* Ljus beige bakgrundsfärg */
  background-color: #f7f3ed; 
  font-family: 'Arial', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center; 
  justify-content: flex-start; 
  padding-top: 50px; 
  padding-bottom: 50px;
  text-align: center;
}

/* APP-IKON */
.app-logo {
  width: 180px; 
  height: auto;
  margin-bottom: 30px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-radius: 20px; 
}

/* VÄLKOMSTTEXT (WELCOME!) */
.welcome-text {
  font-size: 3.5rem;
  font-weight: 900;
  margin: 10px 0;
  line-height: 1.1;
  text-transform: uppercase;
  /* Färgglad gradient: orange, röd, lila */
  background-image: linear-gradient(to right, #ff9800, #ff5722, #9c27b0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent; 
  letter-spacing: 2px;
}

/* UNDERTEXT/TAGLINE */
.tagline {
  font-size: 1.5rem;
  font-weight: 600;
  /* Blå färg */
  color: #007BFF; 
  margin-bottom: 40px;
}

/* CONTAINER FÖR KNAPPAR */
.button-container {
  display: flex;
  gap: 30px; 
  margin-bottom: 40px;
  flex-wrap: wrap; 
  justify-content: center;
}

/* ENKEL KNAPPSTIL */
.action-button {
  display: flex; 
  align-items: center;
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white; 
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08); 
  text-transform: uppercase;
}

.action-button:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

/* IKONER INUTI KNAPPARNA */
.button-icon {
  width: 30px; 
  height: 30px;
  margin-right: 15px; 
}

/* DENNA CSS-SEKTION FÖR .demo-info ÄR BORTTAGEN HÄR! */

/* RESPONSIVITET */
@media (max-width: 600px) {
  .button-container {
    flex-direction: column; 
    gap: 15px;
  }
  
  .action-button {
    width: 250px; 
    justify-content: center;
  }
}
</style>
