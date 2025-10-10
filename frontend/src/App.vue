<template>
  <div id="app">
    <!-- Gemensam header som visas på login-sidan -->
    <header class="app-header" v-if="$route.path === '/'">
      <div class="header-content">
        <div class="header-bubble">
          <h1>Learn English App 🌟</h1>
          <p>Lär dig engelska på ett roligt och enkelt sätt!</p>
          <div class="header-sparkles">✨🎉✨</div>
        </div>
      </div>
    </header>
    
    <main :class="{ 'with-header': $route.path === '/' }">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Comic Sans MS', 'Marker Felt', cursive, sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Header för login-sidan */
.app-header {
  padding: 40px 20px 20px 20px;
  text-align: center;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.header-bubble {
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: white;
  padding: 40px 30px;
  border-radius: 35px;
  position: relative;
  box-shadow: 0 15px 35px rgba(255,107,107,0.3);
  animation: bounceIn 1s ease-out;
  max-width: 600px;
  margin: 0 auto;
}

.header-bubble h1 {
  margin: 0 0 15px 0;
  font-size: 2.8em;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.header-bubble p {
  margin: 0;
  font-size: 1.3em;
  opacity: 0.9;
}

.header-sparkles {
  position: absolute;
  top: 20px;
  right: 25px;
  font-size: 1.8em;
  animation: sparkle 2s ease-in-out infinite;
}

main.with-header {
  padding-top: 20px;
}

body {
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

/* Gemensamma animationer */
@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes sparkle {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

/* Responsiv design */
@media (max-width: 768px) {
  .header-bubble {
    padding: 30px 20px;
    margin: 0 20px;
  }
  
  .header-bubble h1 {
    font-size: 2.2em;
  }
  
  .header-bubble p {
    font-size: 1.1em;
  }
  
  .header-sparkles {
    font-size: 1.4em;
    top: 15px;
    right: 20px;
  }
}
</style>
