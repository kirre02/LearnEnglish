<template>
  <div id="app">
    <!-- 
      Header-sektionen med den stora färgade bubblan har tagits bort härifrån 
      för att låta WelcomePage (som laddas i router-view) bestämma all layout och bakgrund.
    -->
    
    <main>
      <!-- Här laddas den aktuella routade komponenten (t.ex. WelcomePage) -->
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
/* Återställ standardmarginaler och paddningar */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Stilar för huvudcontainern för appen */
#app {
  /* Använd den typsnittsfamilj du vill ha */
  font-family: 'Arial', sans-serif; 
  min-height: 100vh;
  /* Den lila/blå bakgrundsgradienten har tagits bort härifrån. 
     Startsidan (WelcomePage) bestämmer nu bakgrunden. */
}

/* Stilar för body, se till att den fyller hela fönstret */
body {  margin: 0;
  min-height: 100vh;
  /* Säkerställer att ingen global bakgrund ställer till problem */
  background: none; 
}

/* Du kan ta bort alla oanvända .header-klasser, @keyframes, och @media queries 
   som tidigare fanns här, eftersom de inte längre används efter att headern togs bort. */
</style>
