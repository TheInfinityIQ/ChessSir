<script setup lang="ts">
import { logBoard, setupBoard, getPieces, getBoard } from "@/scripts/board";
import { printPiece } from "@/scripts/state";
import { type IPiece, type npVoid } from "@/scripts/types";
import { nextTick, onMounted, reactive } from "vue";
import Square from "./Square.vue";


let state = reactive({
    board: getBoard(),
    piece: getPieces(),
})

const setupGame = async () => {
    
    await nextTick();
    
    state.board = getBoard(),
    state.piece = getPieces()
};


onMounted(setupGame);
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
