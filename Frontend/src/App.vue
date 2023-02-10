<script setup lang="ts">
import Board from "./components/Board.vue";
</script>

<template>
    <article class="board-container">
        <Board class="board" />
    </article>
</template>

<style scoped>
.board-container {
    /* Doesn't adjust in expected way */
    width: 500px;
    height: 500px;

    border: 1px solid pink;

    display: flex;
    flex-flow: row;
    flex-wrap: wrap;
    flex-direction: row;
    align-content: flex-start;

    padding: 0;
}

.board {
    width: 100%;
    height: 100%;
}
</style>
