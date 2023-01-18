<script setup lang="ts">
import {
    postIdOfSelectedPiece,
    updateIsPieceSelected,
    getIsPieceSelected,
    getIdOfSelectedPiece,
} from "@/scripts/state";
import {
    getNotEmptyPieces,
    getNumNotEmptyPieces,
} from "@/scripts/staticValues";
import { reactive, ref } from "vue";

let isSelectable = false;

const props = defineProps({
    colour: Number,
    id: Number,
    piece: String,
});


//May want to consider moving this to Board.vue. Doesn't seem like the squares job to determine if itself is selectable
for (let index = 0; index < getNumNotEmptyPieces(); index++) {
    if (props.piece == getNotEmptyPieces()[index]) {
        isSelectable = true;
    }
}

let isSelected = ref(false);

const select = () => {
    if (!getIsPieceSelected() || getIdOfSelectedPiece() == props.id) {
        postIdOfSelectedPiece(props.id);
        isSelected.value = !isSelected.value;
        updateIsPieceSelected();
    }
};
</script>

<template>
    <div
        :class="{
            lighter: colour == 0,
            darker: colour == 1,
            selectable: isSelectable,
            selected: isSelected,
        }"
        @click="select"
    ></div>
</template>

<style scoped>
div {
    width: 5vw;
    height: 5vw;

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
