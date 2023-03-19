<script lang="ts">
// use normal <script> to declare options
export default {
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { boardState, getPieceWithId } from "@/scripts/board";
import { getIdOfSelectedPiece, postSelectedPiece, postDeselect, makeMove, unselectPiece } from "@/scripts/state";
import { getNotEmptyPieces, getNumNotEmptyPieces } from "@/scripts/staticValues";
import { Piece, type IPiece, type npAny, type npVoid, type stringVoid } from "@/scripts/types";
import { onMounted, reactive, ref, type Ref } from "vue";
import { stringifyQuery } from "vue-router";

const props = defineProps({
    id: Number,
    colour: Number,
});

let row: number = Math.trunc(props.id! / 8);
let column: number = props.id! % 8;

const ensureValidity: npAny = () => {
    try {
        if (props.id! > 63 || props.id! < 0 || props.colour! < 0 || props.colour! > 1) {
            throw "invalid piece definition. Either piece ID or colour is invalid onMounted";
        }

        return;
    } catch (error) {
        console.log(error);
    }
};

onMounted(ensureValidity);

//TODO: add property to define selectability
let isSelectable: Ref<boolean> = ref(false);
let isSelected: Ref<boolean> = ref(false);

//May want to consider moving this to Board.vue. Doesn't seem like the squares job to determine if itself is selectable
for (let index = 0; index < getNumNotEmptyPieces(); index++) {
    if (boardState[row][column].piece == getNotEmptyPieces()[index]) {
        isSelectable.value = true;
    }
}

const select: npVoid = () => {
    postDeselect(deselect);

    let square = new Piece(props.id!, boardState[row][column].piece, props.colour!);

    if (getIdOfSelectedPiece() == props.id) {
        return;
    }

    if (getIdOfSelectedPiece() != props.id && getIdOfSelectedPiece()) {
        makeMove(square);
        unselectPiece();
        return;
    }

    postSelectedPiece(square);
    isSelected.value = !isSelected.value;

    console.log(square);
    
};

const deselect: npVoid = () => {
    isSelected.value = false;
};
</script>

<template>
    <div
        :class="[
            {
                lighter: colour == 0,
                darker: colour == 1,
                selectable: isSelectable,
                selected: isSelected,
            },
            boardState[row][column].piece,
        ]"
        @click="select"
    ></div>
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
