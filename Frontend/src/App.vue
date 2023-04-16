<script setup lang="ts">
import { onMounted } from "vue";
import Board from "./components/Board.vue";
import { boardState, logBoard, setupBoard } from "./scripts/board";
import { getSelectedPiece, printPiece } from "./scripts/state";
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

const printSelectedPiece: npVoid = () => {
    console.log(getSelectedPiece());
};

// onMounted(setupGame);
</script>

<template>
    <main>
        <nav class="row-1">
            <button @click="printBoard">print board</button>
            <button @click="setupGame">setup board</button>
            <button @click="updatePiece">print Piece</button>
            <button @click="printBoardState">print boardState</button>
            <button @click="printSelectedPiece">print SelectedPiece</button>
        </nav>
        <section class="grid-container-body row-2">
            <article class="column-1"></article>
            <article class="board-container column-2">
                <Board class="board" />
            </article>
            <article class="column-3"></article>
        </section>
        <footer class="row-3">
            <p>test</p>
        </footer>
    </main>
</template>

<style scoped>
main {
    display: grid;
    grid-template-rows: 1fr 12fr 1fr;

    border: 1px solid black;
    border-width: 0 10px;

    width: 100vw;
    height: 100vh;
}

nav {
    border: 1px solid black;

    display: flex;
    justify-content: center;
    gap: 2vw;
}

button {
    min-width: 150px;
    max-height: 100px;

    margin: 15px 0;
}

.grid-container-body {
    display: grid;
    grid-template-columns: 2fr 6fr 2fr;
}

.row {
    width: 100%;
    height: 100%;
}

.row-1,
.row-2,
.row-3 {
    border: 1px solid black;
}

.column {
    width: 100%;
    height: 100%;
}

.column-1,
.column-2,
.column-3 {
    border: 1px solid black;
}

.board-container {
    height: 100%;

    border: 1px solid black;

    display: flex;
    justify-content: space-around;
    align-items: center;
}

.board {
    width: 80%;
    max-width: 1000px;
    aspect-ratio: 1 / 1;
    border: 1px solid black;
}

footer {
    height: 4%;
    width: 100vw;

    border: 1px solid black;
}
</style>
