<template>
    <div class="user-info-bubble" @click="toggleMenu">
        <div class="user-avatar">😊</div>
        <div class="user-details">
            <div class="word-count">
                <span class="count">{{ learnedWords }}</span>
                <span class="label">ord lärt!</span>
            </div>

            <!-- Hamburgarmeny-ikon -->
            <button class="menu-toggle" @click.stop="toggleMenu">
                <span class="menu-icon">☰</span>
            </button>
        </div>

        <transition name="expand">
            <div v-if="menuOpen" class="inline-menu">
                <button class="menu-item" @click.stop="$emit('show-results')"> Resultat</button>
                <button class="menu-item" @click.stop="$emit('show-settings')">Inställningar</button>
                <button class="menu-item logout" @click.stop="$emit('logout')"> Logga ut</button>
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
  border-radius: 25px; /* samma radie som menyn */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  overflow: visible; /* så menyn får sticka ut */
  z-index: 10;
}



.user-info-bubble:hover {
    transform: scale(1.02);
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

.inline-menu {
  position: absolute;
  top: 99%; /* överlappar lite för att ta bort glapp */
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 0 0 25px 25px; /* rundad bara i botten */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  z-index: 999;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 15px 0;
  border-top: none;
  margin: 0;
}

.inline-menu::before {
  content: "";
  position: absolute;
  top: -10px;
  left: 0;
  right: 0;
  height: 10px;
  background: #fff;
}

.menu-toggle {
    background: none;
    border: none;
    font-size: 1.6em;
    cursor: pointer;
    color: #FF6B6B;
    transition: transform 0.2s ease;
}

.menu-toggle:hover {
    transform: scale(1.2);
}


.menu-item {
  background: none;
  border: none;
  padding: px 15px;
  text-align: center;
  font-size: 1em;
  cursor: pointer;
  color: #333;
  transition: background 0.2s ease, transform 0.1s ease;
}

.menu-item:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(1.02);
}

.menu-item.logout {
  color: #FF6B6B;
  font-weight: bold;
}

/* Expansion animation */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 200px;
  opacity: 1;
}

/* Dropdown slide */
@keyframes slideDown {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

</style>
