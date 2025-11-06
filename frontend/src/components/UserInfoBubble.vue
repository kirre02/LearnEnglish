<template>
  <div class="user-info-bubble">
    <div class="user-avatar">😊</div>

    <div class="user-details">
      <div class="word-count">
        <span class="count">{{ learnedWords }}</span>
        <span class="label">ord lärt!</span>
      </div>

      <!-- Hamburgarknapp -->
      <button class="menu-toggle" @click.stop="toggleMenu" aria-label="Meny">
        <span class="hamburger" :class="{ active: menuOpen }"></span>
      </button>
    </div>

    <!-- Flytande meny med samma bredd som bubblan -->
    <transition name="fade-slide">
      <div v-if="menuOpen" class="floating-menu">
        <button class="menu-item" @click.stop="$emit('show-profile')">Profil</button>
        <div class="divider-vertical"></div>
        <button class="menu-item logout" @click.stop="$emit('logout')">Logga ut</button>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "UserInfoBubble",
  props: {
    learnedWords: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      menuOpen: false,
    };
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
  },
};
</script>

<style scoped>
.user-info-bubble {
  position: relative;
  background: #fff;
  border-radius: 25px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  overflow: visible;
  z-index: 10;
  transition: all 0.25s ease;
}

.user-avatar {
  font-size: 2.2em;
  text-align: center;
  margin-top: 10px;
}

.user-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding: 0 12px 10px;
}

.word-count {
  text-align: center;
}

.count {
  display: block;
  font-size: 1.7em;
  font-weight: bold;
  color: #ff6b6b;
}

.label {
  font-size: 0.9em;
  color: #666;
}

.menu-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  position: relative;
  z-index: 1000;
}

.hamburger {
  display: block;
  width: 22px;
  height: 2px;
  background-color: #ff6b6b;
  position: relative;
  border-radius: 2px;
  transition: all 0.3s ease-in-out;
}

.hamburger::before,
.hamburger::after {
  content: "";
  position: absolute;
  left: 0;
  width: 22px;
  height: 2px;
  background-color: #ff6b6b;
  border-radius: 2px;
  transition: all 0.3s ease-in-out;
}

.hamburger::before {
  top: -6px;
}

.hamburger::after {
  top: 6px;
}

.hamburger.active {
  background-color: transparent;
}

.hamburger.active::before {
  transform: rotate(45deg);
  top: 0;
}

.hamburger.active::after {
  transform: rotate(-45deg);
  top: 0;
}

.floating-menu {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 12px 0;
  z-index: 999;
  animation: dropIn 0.25s ease forwards;
}

.menu-item {
  background: none;
  border: none;
  font-size: 1em;
  cursor: pointer;
  color: #333;
  transition: transform 0.1s ease;
  flex: 1;
}

.menu-item:hover {
  opacity: 0.7;
}

.menu-item.logout {
  color: #ff6b6b;
  font-weight: bold;
}

.divider-vertical {
  width: 1px;
  height: 25px;
  background-color: rgba(0, 0, 0, 0.1);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-5px);
}

.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@keyframes dropIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
