<template>
  <div class="login-page-container">
    <!-- Login Form -->
    <div class="login-form-container">
      <div class="login-form">
        <h2 class="form-title">Logga in</h2>
        <p class="form-subtitle">Fortsätt din språkresa</p>
        
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <input 
              type="email" 
              v-model="email" 
              required 
              placeholder="E-postadress"
              :class="{ 'error': emailError }"
            />
            <span v-if="emailError" class="error-text">{{ emailError }}</span>
          </div>
          
          <div class="form-group password-group">
            <div class="password-input-container">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                required 
                placeholder="Lösenord"
                :class="{ 'error': passwordError }"
              />
              <button 
                type="button" 
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <span v-if="passwordError" class="error-text">{{ passwordError }}</span>
          </div>
          
          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="rememberMe" />
              <span class="checkmark"></span>
              Kom ihåg mig
            </label>
            
            <a href="#" class="forgot-password-link">Glömt lösenord?</a>
          </div>
          
          <button type="submit" class="login-btn" :disabled="loading">
            {{ loading ? 'Loggar in...' : 'Logga in' }}
          </button>
          
          <div class="signup-prompt">
            <p>Har du inget konto? <a href="#" class="signup-link">Bli medlem här!</a></p>
          </div>
          
          <div class="demo-info">
            <p><strong>Testa inloggning:</strong></p>
            <p>E-post: coder1@example.com</p>
            <p>Lösenord: 123</p>
          </div>
        </form>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginForm',
  data() {
    return {
      email: '',
      password: '',
      emailError: '',
      passwordError: '',
      errorMessage: '',
      successMessage: '',
      loading: false,
      showPassword: false,
      rememberMe: false
    }
  },
  mounted() {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  },
  methods: {
    validateForm() {
      let isValid = true
      
      this.emailError = ''
      this.passwordError = ''
      
      if (!this.email) {
        this.emailError = 'E-post är obligatoriskt'
        isValid = false
      } else if (!this.isValidEmail(this.email)) {
        this.emailError = 'Ange en giltig e-postadress'
        isValid = false
      }
      
      if (!this.password) {
        this.passwordError = 'Lösenord är obligatoriskt'
        isValid = false
      } else if (this.password.length < 3) {
        this.passwordError = 'Lösenordet måste vara minst 3 tecken'
        isValid = false
      }
      
      return isValid
    },
    
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },
    
    async handleLogin() {
      // Validera först
      if (!this.validateForm()) {
        this.errorMessage = 'Var vänlig rätta till felen ovan'
        return
      }
      
      this.loading = true
      this.errorMessage = ''
      this.successMessage = ''
      
      try {
        console.log('Skickar login request till:', 'http://localhost:9001/api/users/login');
        
        const response = await fetch('http://localhost:9001/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          // Försök få mer specifikt felmeddelande från servern
          const errorData = await response.json().catch(() => ({ message: 'Inloggning misslyckades' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Login successful, data:', data);
        
        // Hantera "Kom ihåg mig"
        if (this.rememberMe) {
          localStorage.setItem('rememberedEmail', this.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        // Spara token och användarinfo - ANVÄND RÄTT NYCKEL
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('Token sparad i localStorage:', localStorage.getItem('token'));
        console.log('User sparad i localStorage:', localStorage.getItem('user'));
        
        this.successMessage = `Inloggning lyckades! Välkommen ${data.user.name}`;
        
        // ⭐⭐ GARANTERAD OMDIRIGERING TILL DASHBOARD ⭐⭐
        // Lägg till lite delay för att användaren ska se framgångsmeddelandet
        setTimeout(() => {
          console.log('Omdirigerar till dashboard...');
          this.$router.push('/dashboard');
        }, 1000);
        
      } catch (error) {
        console.error('Login fetch error:', error);
        this.errorMessage = error.message.includes('HTTP error') 
          ? `Kunde inte ansluta till servern: ${error.message}. Kontrollera att backend körs på http://localhost:9001.`
          : error.message;
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
/* === HELA SIDAN - BEIGE BAKGRUND & CENTRERING === */
.login-page-container {
  min-height: 100vh;
  background-color: #F7F3ED;
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
  display: flex; 
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
}

/* === LOGIN FORM CONTAINER === */
.login-form-container {
  padding: 0;
  width: 100%; 
  display: flex;
  justify-content: center;
}

.login-form {
  background: #FFFFFF;
  border-radius: 15px;
  padding: 40px 35px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  max-width: 420px;
  width: 100%;
  border: 2px solid #FF8E53; /* Uppdaterad kantfärg till orange */
  margin: auto; 
}

.form-title {
  color: #FF8E53; /* Uppdaterad färg till orange */
  font-size: 2rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 8px;
}

.form-subtitle {
  color: #2D3748;
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.1rem;
  font-weight: 500;
}

/* === FORMULÄR ELEMENT === */
.form-group {
  margin-bottom: 25px;
}

input[type="email"],
input[type="password"],
input[type="text"] {
  width: 100%;
  padding: 16px 18px;
  border: 2px solid #E2E8F0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #FFFFFF;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #FF8E53; /* Uppdaterad fokusfärg till orange */
  box-shadow: 0 0 0 3px rgba(255, 142, 83, 0.1);
}

input.error {
  border-color: #FF6B6B;
  background: #FFF5F5;
}

.error-text {
  color: #FF6B6B;
  font-size: 13px;
  font-weight: 600;
  display: block;
  margin-top: 6px;
}

/* === LÖSENORD INPUT === */
.password-group {
  position: relative;
}

.password-input-container {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
  color: #FF8E53; /* Uppdaterad färg till orange */
}

.toggle-password:hover {
  background-color: rgba(255, 142, 83, 0.1);
}

/* === FORM ALTERNATIV === */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.remember-me {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #2D3748;
  font-weight: 500;
}

.remember-me input {
  margin-right: 8px;
}

.forgot-password-link {
  color: #FF8E53; /* Uppdaterad färg till orange */
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: color 0.2s;
}

.forgot-password-link:hover {
  color: #FF6B6B;
  text-decoration: underline;
}

/* === LOGIN KNAPP - UPPDATERAD FÖR ATT MATCHA STARTSIDAN === */
.login-btn {
  width: 100%;
  padding: 16px;
  /* Gradient som matchar startsidans "WELCOME!" färger */
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 800;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.3);
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #FF8E53, #FF6B6B);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.login-btn:disabled {
  background: #CBD5E0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* === SIGNUP PROMPT === */
.signup-prompt {
  text-align: center;
  margin: 20px 0;
  padding: 15px;
  background: #FFF5F5; /* Uppdaterad bakgrundsfärg */
  border-radius: 10px;
  border-left: 4px solid #FF8E53; /* Uppdaterad kantfärg till orange */
}

.signup-prompt p {
  margin: 0;
  color: #2D3748;
  font-size: 14px;
}

.signup-link {
  color: #FF8E53; /* Uppdaterad färg till orange */
  font-weight: 700;
  text-decoration: none;
}

.signup-link:hover {
  color: #FF6B6B;
  text-decoration: underline;
}

/* === DEMO INFO === */
.demo-info {
  margin-top: 25px;
  padding: 18px;
  background: #FFFBEB;
  border-radius: 10px;
  border-left: 4px solid #FF8E53;
  text-align: left;
}

.demo-info p {
  margin: 6px 0;
  font-size: 13px;
  color: #2D3748;
}

.demo-info strong {
  color: #FF8E53;
  font-size: 14px;
}

/* === MEDDELANDEN === */
.error-message {
  color: #FFFFFF;
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  border-radius: 10px;
  text-align: center;
  font-weight: 600;
}

.success-message {
  color: #FFFFFF;
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
  border-radius: 10px;
  text-align: center;
  font-weight: 600;
}

/* === RESPONSIV DESIGN === */
@media (max-width: 480px) {
  .login-page-container {
    padding: 10px; 
  }
  
  .login-form {
    padding: 30px 20px;
    margin: 0;
  }
  
  .form-options {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
}</style>