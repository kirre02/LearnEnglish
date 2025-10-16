<template>
  <div class="register-form">
    <h2>Skapa konto</h2>
    <form @submit.prevent="handleRegister">
      <!-- Namn -->
      <div class="form-group">
        <label for="name">Namn:</label>
        <input 
          type="text" 
          id="name" 
          v-model="name" 
          required 
          placeholder="Ange ditt namn"
          :class="{ 'error': nameError }"
        />
        <span v-if="nameError" class="error-text">{{ nameError }}</span>
      </div>

      <!-- E-post -->
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

      <!-- Lösenord -->
      <div class="form-group password-group">
        <label for="password">Lösenord:</label>
        <div class="password-input-container">
          <input 
            :type="showPassword ? 'text' : 'password'" 
            id="password" 
            v-model="password" 
            required 
            placeholder="Välj ett lösenord"
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

      <!-- Bekräfta lösenord -->
      <div class="form-group password-group">
        <label for="confirmPassword">Bekräfta lösenord:</label>
        <div class="password-input-container">
          <input 
            :type="showConfirmPassword ? 'text' : 'password'" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            required 
            placeholder="Bekräfta lösenord"
            :class="{ 'error': confirmPasswordError }"
          />
          <button 
            type="button" 
            class="toggle-password"
            @click="showConfirmPassword = !showConfirmPassword"
            :aria-label="showConfirmPassword ? 'Dölj lösenord' : 'Visa lösenord'"
          >
            {{ showConfirmPassword ? '🙈' : '👁️' }}
          </button>
        </div>
        <span v-if="confirmPasswordError" class="error-text">{{ confirmPasswordError }}</span>
      </div>

      <!-- Skicka -->
      <button type="submit" class="register-btn" :disabled="loading">
        {{ loading ? 'Registrerar...' : 'Registrera' }}
      </button>
    </form>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <div class="switch-link">
      <p>Har du redan ett konto? <router-link to="/register">Logga in här</router-link></p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterForm',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      nameError: '',
      emailError: '',
      passwordError: '',
      confirmPasswordError: '',
      errorMessage: '',
      successMessage: '',
      loading: false,
      showPassword: false,
      showConfirmPassword: false
    }
  },
  methods: {
    validateForm() {
      let isValid = true
      this.nameError = ''
      this.emailError = ''
      this.passwordError = ''
      this.confirmPasswordError = ''

      // Namn
      if (!this.name.trim()) {
        this.nameError = 'Namn är obligatoriskt'
        isValid = false
      }

      // E-post
      if (!this.email) {
        this.emailError = 'E-post är obligatoriskt'
        isValid = false
      } else if (!this.isValidEmail(this.email)) {
        this.emailError = 'Ange en giltig e-postadress (t.ex: namn@example.com)'
        isValid = false
      }

      // Lösenord
      if (!this.password) {
        this.passwordError = 'Lösenord är obligatoriskt'
        isValid = false
      } else if (this.password.length < 3) {
        this.passwordError = 'Lösenordet måste vara minst 3 tecken'
        isValid = false
      }

      // Bekräftelse
      if (this.confirmPassword !== this.password) {
        this.confirmPasswordError = 'Lösenorden matchar inte'
        isValid = false
      }

      return isValid
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },

    async handleRegister() {
      if (!this.validateForm()) {
        this.errorMessage = 'Var vänlig rätta till felen ovan'
        return
      }

      this.loading = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const response = await fetch('http://localhost:9001/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: this.name,
            email: this.email,
            password: this.password
          })
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.message || `Fel vid registrering (${response.status})`)
        }

        const data = await response.json()
        this.successMessage = `Konto skapat! Välkommen ${data.user?.name || this.name}.`
        
        // Spara token / användare om backend returnerar det
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        // Omdirigera till dashboard
        this.$router.push('/dashboard')

      } catch (error) {
        this.errorMessage = `Registreringen misslyckades: ${error.message}`
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>

.page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.register-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.register-form h2 {
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

.register-btn {
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

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.register-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
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

.switch-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

.switch-link a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 600;
}

.switch-link a:hover {
  text-decoration: underline;
}

/* Responsiv design */
@media (max-width: 480px) {
  .register-form {
    margin: 20px;
    padding: 20px;
  }
}
</style>
