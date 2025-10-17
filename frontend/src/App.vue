<template>
  <div id="app">
    <header class="app-header" v-if="$route.path === '/'">
      <div class="header-content">
        <h1>Learn English App 🌟</h1>
        <p>Fortsätt din språkresa på ett roligt sätt!</p>
      </div>
    </header>

    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
/* Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body,
html,
#app {
  min-height: 100vh;
  background-color: #faf7f2; /* mjukt beige likt login/register */
  font-family: "Poppins", "Segoe UI", sans-serif;
  color: #333;
}

/* Layout */
main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 40px 20px;
}

/* Header (valfri) */
.app-header {
  text-align: center;
  padding: 30px 20px;
  background: #fffaf5;
  border-bottom: 2px solid #ffd5b6;
  box-shadow: 0 2px 10px rgba(255, 153, 102, 0.1);
}

.app-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #ff7a33; /* varm orange ton */
}

.app-header p {
  font-size: 1.1rem;
  color: #666;
}

/* Gemensamma färger och ton */
:root {
  --accent-color: #ff7a33;
  --accent-gradient: linear-gradient(135deg, #ff9553, #ff7a33);
  --bg-light: #fffaf5;
  --text-dark: #333;
}

/* Gemensamma UI-stilar */
button {
  background: var(--accent-gradient);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

a {
  color: var(--accent-color);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
