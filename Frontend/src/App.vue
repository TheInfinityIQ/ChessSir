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
    width: 40vw;
    height: 40vw;

    border: 1px solid pink;

    display: flex;
}

.board {
    width: 100%;
    height: 100%;
}
</style>
