<template>
  <div class="user-info-bubble">
    <!-- Avataren är kvar men är nu en ren visuell komponent (ej klickbar för profil här, 
         eftersom du vill ha Profil-knappen någon annanstans). Jag tar dock bort @click 
         för att vara konsekvent med att Profil-länken flyttas. -->
    <div class="user-avatar">😊</div> 

    <div class="user-details">
      <!-- Ordräknaren är borttagen -->

      <!-- NY: Direkta Logga Ut-knappen för Desktop/bred skärm -->
      <div class="desktop-actions">
        <!-- Endast Logga ut-knappen är kvar -->
        <button class="menu-item-desktop logout" @click.stop="$emit('logout')">
          Logga ut 👋
        </button>
      </div>

      <!-- Hamburgermeny-knapp (Endast synlig på Mobil) -->
      <button class="menu-toggle" @click.stop="toggleMenu" aria-label="Meny">
        <span class="hamburger" :class="{ active: menuOpen }"></span>
      </button>
    </div>

    <!-- FLYTANDE MOBIL-MENY: Visar nu ENDAST Logga ut -->
    <transition name="fade-slide">
      <div v-if="menuOpen" class="floating-menu">
        <!-- Profil-knappen är borttagen från menyn -->
        <button class="menu-item logout" @click.stop="$emit('logout')">Logga ut</button>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "UserInfoBubble",
  props: {
    // learnedWords är inte längre nödvändig i mallen, men kan behållas som prop
    // om den används någon annanstans i appen. Vi tar bort 'required: true'
    // eftersom den inte används i template längre.
    learnedWords: {
      type: Number,
      default: 0,
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
/* BASSTILAR FÖR KOMPONENTEN OCH MOBILVY */
.user-info-bubble {
  position: relative;
  background: #fff;
  border-radius: 20px; /* Mindre rundning */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); /* Lättare skugga */
  overflow: visible;
  z-index: 10;
  transition: all 0.25s ease;
  padding: 5px; /* Mindre padding */
}

.user-avatar {
  font-size: 1.8em; /* Mindre smilegubb */
  text-align: center;
  margin-top: 0;
  padding: 5px 0;
}

.user-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0;
  padding: 0 5px 5px; /* Mindre padding */
}

/* word-count tas bort men vi behåller en tom plats för Desktop-actions */

/* Hamburgermeny-stilar (Synlig på mobil) */
.menu-toggle {
  /* ... oförändrad ... */
  display: block; 
  padding: 2px;
}
/* ... (hamburger, floating-menu stilar oförändrade förutom nedan) ... */

/* JUSTERINGAR FÖR MENY */
.floating-menu {
  top: calc(100% + 5px); /* Flytta menyn närmare */
  right: 0;
  left: auto; /* Se till att den klistras mot högerkanten */
  padding: 8px 0;
  width: 120px; /* Mindre menybredd */
  flex-direction: column;
}

.menu-item {
    padding: 8px 15px;
}
.divider-vertical {
    display: none; /* Behövs ej när det bara är en knapp */
}


/* ------------------------------------- */
/* NYA STILAR FÖR DESKTOP KNAPPAR */
/* ------------------------------------- */

.desktop-actions {
    display: none; /* Dölj som standard (mobil) */
    align-items: center;
    gap: 0;
}

/* Vi minskar storleken på desktop-knappen för att passa den mindre bubblan */
.menu-item-desktop {
    background: none;
    border: none;
    font-size: 0.8em; /* Mindre font */
    cursor: pointer;
    padding: 6px 12px; /* Mindre padding */
    border-radius: 10px; /* Mindre rundning */
    font-weight: bold;
}

.menu-item-desktop.logout {
    color: white;
    background: #ff6b6b;
    box-shadow: 0 3px 10px rgba(255,107,107,0.3);
}

.menu-item-desktop.logout:hover {
    background: #e05e5e;
}


/* ------------------------------------- */
/* MEDIA QUERY - DESKTOP/BRED SKÄRM (min-width: 769px) */
/* ------------------------------------- */
@media (min-width: 769px) {
    /* Ändra bubblan till en horisontell rad */
    .user-info-bubble {
        min-width: auto; 
        width: auto;
        padding: 5px 10px;
        display: flex; 
        flex-direction: row; 
        gap: 8px; /* Avstånd mellan smilegubben och knappen */
        justify-content: flex-start; /* Placera allt till vänster i bubblan */
    }

    .user-avatar {
        order: 1; 
        margin: 0;
        font-size: 1.8em; /* Mindre */
    }

    .user-details {
        flex-grow: 0; /* Ta inte upp extra utrymme */
        flex-direction: row; 
        justify-content: flex-start; 
        padding: 0;
        margin: 0;
    }
    
    /* Dölj Hamburgermenyn och flytande menyn på desktop */
    .menu-toggle {
        display: none;
    }
    
    .floating-menu {
        display: none !important;
    }

    /* Visa de direkta knapparna */
    .desktop-actions {
        display: flex; 
        order: 2; /* Placera efter avataren */
    }
}
/* ------------------------------------- */

/* ------------------------------------- */
/* MEDIA QUERY - MOBIL/SMAL SKÄRM (max-width: 768px) */
/* ------------------------------------- */
@media (max-width: 768px) {
    /* Bubblan är nu vertikal på mobil och endast avatar + toggle visas */
    .user-info-bubble {
        padding: 5px 10px;
    }
    .user-details {
        padding: 0 0 5px;
    }
    /* Göm desktop-knappen på mobil */
    .desktop-actions {
        display: none;
    }
    
    /* Placera hamburgaren till höger om avatar på mobil */
    .user-details {
        /* Se till att space-between fungerar */
        width: 100%; 
        justify-content: space-between;
    }
    
    /* Centrera avataren ovanför detaljerna */
    .user-avatar {
        display: none; /* Vi gömmer avataren här för att lägga den bredvid menyn */
    }
    
    /* På mobil, gör bubblan liten och horisontell */
     .user-info-bubble {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 5px 10px;
        width: auto;
    }
    
    .user-avatar {
        display: block;
        margin: 0;
        padding: 0;
    }

    .user-details {
        /* Dölj de inre detaljerna som är tomma nu */
        display: none; 
    }
    
    /* Tvinga hamburgaren att vara bredvid avataren */
    .menu-toggle {
        order: 2; 
    }
    
    /* Tvinga avataren att vara bredvid hamburgaren */
    .user-avatar {
        order: 1;
    }
  }</style>