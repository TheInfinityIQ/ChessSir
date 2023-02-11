<script setup lang="ts">
import { logBoard, setupBoard, getPieces, getBoard } from "@/scripts/board";
import { printPiece } from "@/scripts/state";
import type { IPiece, npVoid } from "@/scripts/types";
import { onMounted, reactive } from "vue";
import Square from "./Square.vue";

// const board = reactive()

const printBoard: npVoid = () => {
    logBoard();
};

const setupGame: npVoid = () => {
    setupBoard();
};

const updatePiece: npVoid = () => {
    printPiece();
};

onMounted(setupGame);

let state = reactive({
    board: getBoard(),
    pieces: getPieces()
});

</script>

<template>
    <article>
        <li v-for="row in state.board" class="parentList">
            <li v-for="square in row" class="square-container">
                <Square
                    :id="square.id"
                    :colour="square.colour"
                />
            </li>
        </li>
        <button @click="printBoard">print board</button>
        <button @click="setupGame">setup board</button>
        <button @click="updatePiece">print Piece</button>
    </article>
</template>

<style scoped>
.parentList {
    width: 100%;
    height: 12.5%;

    display: flex;
}

.square-container {
    width: 12.5%;
    height: 100%;
}
</style>
