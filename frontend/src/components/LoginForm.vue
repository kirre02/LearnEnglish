<template>
  <div class="login-form">
    <h2>Logga in</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">E-post:</label>
        <input 
          type="email" 
          id="email" 
          v-model="email" 
          required 
          placeholder="Ange din e-post"
          :class="{ 'error': emailError }"
        />
        <span v-if="emailError" class="error-text">{{ emailError }}</span>
      </div>
      
      <div class="form-group password-group">
        <label for="password">Lösenord:</label>
        <div class="password-input-container">
          <input 
            :type="showPassword ? 'text' : 'password'" 
            id="password" 
            v-model="password" 
            required 
            placeholder="Ange ditt lösenord"
            :class="{ 'error': passwordError }"
          />
          <button 
            type="button" 
            class="toggle-password"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Dölj lösenord' : 'Visa lösenord'"
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
    // Hämta sparade uppgifter om "Kom ihåg mig" var ikryssad
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  },
  methods: {
    validateForm() {
      let isValid = true
      
      // Reset errors
      this.emailError = ''
      this.passwordError = ''
      
      // Validera e-post
      if (!this.email) {
        this.emailError = 'E-post är obligatoriskt'
        isValid = false
      } else if (!this.isValidEmail(this.email)) {
        this.emailError = 'Ange en giltig e-postadress (t.ex: namn@example.com)'
        isValid = false
      }
      
      // Validera lösenord
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Login successful, data:', data);
    
    // Hantera "Kom ihåg mig"
    if (this.rememberMe) {
      localStorage.setItem('rememberedEmail', this.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    
    // Spara token och användarinfo
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    this.successMessage = `Inloggning lyckades! Välkommen ${data.user.name}`;
    
    // ⭐⭐ NYA KODEN - Omdirigera direkt till dashboard ⭐⭐
    this.$router.push('/dashboard');
    
  } catch (error) {
    console.error('Login fetch error:', error);
    this.errorMessage = `Kunde inte ansluta till servern: ${error.message}. Kontrollera att backend körs och CORS är konfigurerat.`;
  } finally {
    this.loading = false;
  }
}
  }
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

input[type="email"],
input[type="password"],
input[type="text"] {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 14px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
}

input.error {
  border-color: #ff4444;
}

.password-group {
  position: relative;
}

.password-input-container {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 5px;
}

.error-text {
  color: #ff4444;
  font-size: 12px;
  display: block;
  margin-top: 5px;
}

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
  color: #666;
}

.remember-me input {
  margin-right: 8px;
}

.forgot-password-link {
  color: #4CAF50;
  text-decoration: none;
  font-size: 14px;
}

.forgot-password-link:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.login-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
}

.demo-info {
  margin-top: 25px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #4CAF50;
  text-align: left;
}

.demo-info p {
  margin: 5px 0;
  font-size: 13px;
  color: #666;
}

.demo-info strong {
  color: #333;
}

.error-message {
  color: #ff4444;
  margin-top: 15px;
  padding: 12px;
  background-color: #ffe6e6;
  border-radius: 8px;
  border-left: 4px solid #ff4444;
}

.success-message {
  color: #00C851;
  margin-top: 15px;
  padding: 12px;
  background-color: #e6ffe6;
  border-radius: 8px;
  border-left: 4px solid #00C851;
}

/* Responsiv design */
@media (max-width: 480px) {
  .login-form {
    margin: 20px;
    padding: 20px;
  }
  
  .form-options {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>
