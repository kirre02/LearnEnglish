<template>
  <div class="profile-page">
    <div class="profile-card-wrapper">
      <!-- Flytande knapp -->
      <button class="back-dashboard" @click="$router.push('/dashboard')">
        ← Till Dashboard
      </button>

      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-placeholder">👤</div>
          <div class="user-info">
            <h3>{{ currentUser.name || 'Okänd användare' }}</h3>
            <p>{{ currentUser.email || 'Ingen e-post angiven' }}</p>
          </div>
        </div>

        <hr class="divider top-divider" />

        <h2 class="title">Redigera profil</h2>
        <p class="subtitle">Uppdatera dina uppgifter nedan</p>

        <form @submit.prevent="saveProfile" class="profile-form">
          <div class="form-group">
            <label for="name">Namn</label>
            <input v-model="form.name" id="name" type="text" required />
          </div>

          <div class="form-group">
            <label for="email">E-post</label>
            <input v-model="form.email" id="email" type="email" required />
          </div>

          <hr class="divider" />

          <div class="form-group">
            <label for="password">Nytt lösenord</label>
            <input
                v-model="form.password"
                id="password"
                type="password"
                placeholder="Lämna tomt om du inte vill ändra"
            />
          </div>

          <div class="form-group">
            <label for="confirm">Bekräfta lösenord</label>
            <input
                v-model="form.confirmPassword"
                id="confirm"
                type="password"
                placeholder="Lämna tomt om du inte vill ändra"
            />
          </div>

          <button type="submit" class="save-btn">Spara ändringar</button>
        </form>

        <transition name="fade">
          <div v-if="message" :class="['message', messageType]">
            {{ message }}
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProfileView",
  data() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return {
      currentUser: {
        name: user.name || "",
        email: user.email || "",
      },
      form: {
        name: user.name || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
      },
      message: "",
      messageType: "",
    };
  },
  methods: {
    async saveProfile() {
      if (this.form.password && this.form.password !== this.form.confirmPassword) {
        this.showMessage("Lösenorden matchar inte.", "error");
        return;
      }

      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user.id;

        const bodyData = {};
        if (this.form.name && this.form.name !== user.name) bodyData.name = this.form.name;
        if (this.form.email && this.form.email !== user.email) bodyData.email = this.form.email;
        if (this.form.password) bodyData.password = this.form.password;

        if (Object.keys(bodyData).length === 0) {
          this.showMessage("Inga ändringar att spara.", "error");
          return;
        }

        const response = await fetch(`http://localhost:9001/api/users/update/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        });

        if (!response.ok) throw new Error("Kunde inte uppdatera användaren.");

        const data = await response.json();

        localStorage.setItem("user", JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
        }));

        this.currentUser = data.user;

        this.showMessage("Ändringar sparade!", "success");
        this.form.password = "";
        this.form.confirmPassword = "";

        this.$router.push('/dashboard');
      } catch (err) {
        console.error(err);
        this.showMessage("Kunde inte spara ändringar.", "error");
      }
    },

    showMessage(text, type) {
      this.message = text;
      this.messageType = type;
      setTimeout(() => (this.message = ""), 3000);
    },
  },
};
</script>

<style scoped>
.profile-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background: #f7f9fb;
  padding: 40px 20px;
  position: relative;
}

.profile-card-wrapper {
  position: relative;
  width: 100%;
  max-width: 480px;
}

/* Flytande knapp flyttad mer åt vänster och färg matchar save-btn */
.back-dashboard {
  position: absolute;
  top: -30px;
  left: -140px; /* Flyttad ännu mer åt vänster */
  padding: 10px 16px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53); /* Samma som save-knappen */
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  z-index: 10;
}

.back-dashboard:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.35);
}

.profile-card {
  background: #fff;
  border-radius: 30px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  padding: 40px 50px;
  width: 100%;
  transition: transform 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-3px);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.avatar-placeholder {
  width: 60px;
  height: 60px;
  background: #ff6b6b;
  color: white;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.user-info h3 {
  margin: 0;
  font-size: 1.3em;
  color: #333;
  font-weight: 700;
}

.user-info p {
  margin: 0;
  color: #777;
  font-size: 0.95em;
}

.top-divider {
  margin-top: 15px;
  margin-bottom: 25px;
}

.title {
  text-align: center;
  font-size: 1.8em;
  color: #333;
  margin-bottom: 8px;
  font-weight: 700;
}

.subtitle {
  text-align: center;
  font-size: 1em;
  color: #777;
  margin-bottom: 25px;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  color: #444;
  font-weight: 600;
  margin-bottom: 6px;
}

input {
  padding: 12px 14px;
  border-radius: 15px;
  border: 2px solid #eee;
  font-size: 1em;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

input:focus {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
  outline: none;
}

.divider {
  margin: 15px 0;
  border: none;
  border-top: 1px solid #eee;
}

.save-btn {
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 12px 16px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1em;
  transition: all 0.25s ease;
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.25);
}

.save-btn:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.35);
}

.message {
  text-align: center;
  margin-top: 20px;
  font-weight: bold;
  border-radius: 12px;
  padding: 10px 15px;
}

.message.success {
  background: rgba(78, 205, 196, 0.2);
  color: #009688;
}

.message.error {
  background: rgba(255, 107, 107, 0.2);
  color: #d9534f;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsiv design */
@media (max-width: 500px) {
  .back-dashboard {
    top: -25px;
    left: -80px;
    padding: 8px 12px;
    font-size: 0.9em;
  }
  .profile-card {
    padding: 30px 25px;
  }
}
</style>
