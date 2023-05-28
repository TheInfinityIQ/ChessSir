<script setup lang="ts">

</script>

<template>
    <aside>
        <h1>LAST PLAYER TO MAKE MOVE WON/LOST</h1>
        <div>
            <p>+CALCULATED POINTS - EXISTING RATING</p>
        </div>
        <div>
            opening: {RESULT FROM DB QUERY}[DROP DOWN MENU TO LOOK AT ALL TRANSPOSITIONS AND VARIATIONS] {ICON}
            total moves: {store.game.board}
        </div>
        <button>
            New Game
        </button>
    </aside>
</template>

<style scoped>
</style>
