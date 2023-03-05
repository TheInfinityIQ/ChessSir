<script setup lang="ts">
import { getPieceType, getTestPieceType } from "@/scripts/board";
import { getIdOfSelectedPiece, postSelectedPiece, postDeselect, printPiece, printPreviousPiece, getPreviousPiece, postPieceRef } from "@/scripts/state";
import { getNotEmptyPieces, getNumNotEmptyPieces } from "@/scripts/staticValues";
import type { npAny, npVoid, stringVoid } from "@/scripts/types";
import { onMounted, ref, type Ref } from "vue";
import { stringifyQuery } from "vue-router";

const props = defineProps({
    colour: Number,
    id: Number,
    piece: String
});

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

let isSelectable: Ref<boolean> = ref(false);
let isSelected: Ref<boolean> = ref(false);

//May want to consider moving this to Board.vue. Doesn't seem like the squares job to determine if itself is selectable
for (let index = 0; index < getNumNotEmptyPieces(); index++) {
    if (props.piece == getNotEmptyPieces()[index]) {
        isSelectable.value = true;
    }
}

const select: npVoid = () => {
    isSelected.value = !isSelected.value;

    if (getIdOfSelectedPiece() == props.id) {
        return;
    }

    postDeselect(deselect);
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
            piece,
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
