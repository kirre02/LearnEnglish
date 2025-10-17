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
  background-color: #faf7f2;
  font-family: "Poppins", "Segoe UI", sans-serif;
}

/* Formulär */
.register-form {
  background: #fffaf5;
  border: 1px solid #ffd5b6;
  border-radius: 16px;
  padding: 40px 35px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 8px 20px rgba(255, 153, 102, 0.15);
  transition: all 0.3s ease;
}

.register-form:hover {
  box-shadow: 0 10px 25px rgba(255, 153, 102, 0.25);
}

/* Rubrik */
.register-form h2 {
  text-align: center;
  font-size: 1.9rem;
  color: #ff7a33;
  margin-bottom: 25px;
  font-weight: 700;
}

/* Input-fält */
.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: 600;
  color: #444;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

input[type="email"],
input[type="password"],
input[type="text"] {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #ffe2c6;
  border-radius: 10px;
  font-size: 15px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background: #fffdfb;
}

input:focus {
  border-color: #ff7a33;
  box-shadow: 0 0 0 3px rgba(255, 122, 51, 0.15);
  outline: none;
}

input.error {
  border-color: #ff5555;
}

/* Lösenordsikoner */
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
  padding: 5px;
  color: #ff7a33;
  transition: transform 0.2s ease;
}

.toggle-password:hover {
  transform: translateY(-50%) scale(1.2);
}

/* Felmeddelanden */
.error-text {
  color: #ff5555;
  font-size: 13px;
  margin-top: 4px;
  display: block;
}

/* Registreringsknapp */
.register-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #ff9553, #ff7a33);
  color: white;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.25s ease;
  box-shadow: 0 4px 10px rgba(255, 122, 51, 0.25);
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(255, 122, 51, 0.3);
}

.register-btn:disabled {
  background: #ffcfb1;
  cursor: not-allowed;
}

/* Feedback */
.error-message,
.success-message {
  margin-top: 15px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
}

.error-message {
  background-color: #ffe7e1;
  border-left: 4px solid #ff5555;
  color: #d64545;
}

.success-message {
  background-color: #e6fff0;
  border-left: 4px solid #2ecc71;
  color: #27ae60;
}

/* Länk till login */
.switch-link {
  text-align: center;
  margin-top: 25px;
  font-size: 14px;
  color: #555;
}

.switch-link a {
  color: #ff7a33;
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
}

.switch-link a:hover {
  text-decoration: underline;
}

/* Responsivitet */
@media (max-width: 480px) {
  .register-form {
    padding: 25px 20px;
    margin: 20px;
  }
  .register-form h2 {
    font-size: 1.6rem;
  }
}
</style>
