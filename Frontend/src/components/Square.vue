<script lang="ts">
export default {
    inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { boardState, getSquareWithId } from "@/scripts/board";
import { getIdOfSelectedPiece, postSelectedPiece, postDeselect, makeMove, unselectPiece, isPieceSelected } from "@/scripts/state";
import { getNotEmptyPieces, getNumNotEmptyPieces } from "@/scripts/staticValues";
import { Piece, type IPiece, type npAny, type npVoid, type stringVoid } from "@/scripts/types";
import { computed, onMounted, reactive, ref, type Ref } from "vue";
import { stringifyQuery } from "vue-router";

const props = defineProps<{
    id: number;
    colour: number;
}>();

// Calculate row and column from the given ID
const row = Math.floor(props.id / 8);
const column = props.id % 8;

// Ensure that the input values for the piece are valid 
const ensureValidity = () => {
    if (props.id > 63 || props.id < 0 || props.colour < 0 || props.colour > 1) {
        console.error("Invalid piece definition. Either piece ID or colour is invalid onMounted");
    }
};

onMounted(ensureValidity);

// Check if the piece on this square is selectable
const isSelectable = computed(() => boardState[row][column].piece !== "e");
const isSelected = ref(false);

const select = () => {
    const square = new Piece(props.id, boardState[row][column].piece, props.colour);
    
    if (getIdOfSelectedPiece() === props.id) {
        isSelected.value = !isSelected.value;
        return;
    }

    postDeselect(deselect);
    
    if (square.piece === 'e' && !isPieceSelected()) {
        return;
    }

    if (getIdOfSelectedPiece() !== props.id && getIdOfSelectedPiece() || getIdOfSelectedPiece() === 0) {
        makeMove(square);
        unselectPiece();
        return;
    }

    isSelected.value = !isSelected.value;
    postSelectedPiece(square);
};

const deselect = () => {
    isSelected.value = false;
};
</script>

<template>
    <div :class="[
        {
            lighter: colour == 0,
            darker: colour == 1,
            selectable: isSelectable,
            selected: isSelected,
        },
        boardState[row][column].piece,
    ]" @click="select"></div>
</template>

<style scoped>
div {
    width: 100%;
    height: 100%;
    background-position: center;
    background-size: cover;
}

.selectable {
    cursor: grab;
}

.lighter {
    background-color: white;
}

.darker {
    background-color: black;
}

.selected {
    background-color: rgba(78, 95, 165, 0.7);
}
</style>
