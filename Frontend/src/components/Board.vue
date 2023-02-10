<script setup lang="ts">
import { logBoard, setupBoard, getPieces, getBoard } from "@/scripts/board";
import type { IPiece } from "@/scripts/types";
import { onMounted, reactive } from "vue";
import Square from "./Square.vue";

// const board = reactive()

const printBoard: () => void = () => {
    logBoard();
};

const setupGame: () => void = () => {
    setupBoard();
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
