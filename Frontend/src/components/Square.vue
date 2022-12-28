<script setup lang="ts">
import { getNotEmptyPieces, getNumNotEmptyPieces } from "@/scripts/staticValues";

let isSelectable = false;

const props = defineProps({
    colour: Number,
    id: Number,
    piece: String,
    selected: Boolean
});

//May want to consider moving this to Board.vue. Doesn't seem like the squares job to determine if itself is selectable
for (let index = 0; index < getNumNotEmptyPieces(); index++) {
    if (props.piece == getNotEmptyPieces()[index]) {
        isSelectable = true;
    }
}


</script>

<template>
    <div :class="{ lighter: colour == 0, darker: colour == 1, piece, selectable: isSelectable }"></div>
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
</style>
