<script setup lang="ts">
import { onMounted } from "vue";
import Board from "./components/Board.vue";
import { boardState, logBoard, setupBoard } from "./scripts/board";
import { getTestSquares } from "./scripts/board_setup";
import { printPiece } from "./scripts/state";
import type { IPiece, npVoid } from "./scripts/types";

const printBoard: npVoid = () => {
    logBoard();
};

const setupGame: npVoid = () => {
    setupBoard();
};

const updatePiece: npVoid = () => {
    printPiece();
};

const printBoardState: npVoid = () => {
    console.log(boardState);
};

// onMounted(setupGame);
</script>

<template>
    <main>
        <nav>
            <button @click="printBoard">print board</button>
            <button @click="setupGame">setup board</button>
            <button @click="updatePiece">print Piece</button>
            <button @click="printBoardState">print boardState</button>
        </nav>
        <section class="body">
            <article class="column-1"></article>
            <article class="board-container">
                <Board class="board" />
            </article>
            <article class="column-3"></article>
        </section>
        <footer></footer>
    </main>
</template>

<style scoped>
main {
    height: 100vh;
    width: 100vw;
}

nav {
    width: 100vw;
    height: 4%;
    border: 1px solid black;

    display: flex;
    gap: 3vw;
    justify-content: center;
}

.body {
    height: 92%;

    display: grid;
    grid-template-columns: 15vw 70vw 15vw;
}

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

footer {
    height: 4%;
    width: 100vw;

    border: 1px solid black;
}
</style>
