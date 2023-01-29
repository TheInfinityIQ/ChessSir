<script setup lang="ts">
import { getPieceType } from "@/scripts/board";
import {
    getIdOfSelectedPiece,
    postSelectedPiece,
    postDeselect,
} from "@/scripts/state";
import {
    getNotEmptyPieces,
    getNumNotEmptyPieces,
} from "@/scripts/staticValues";
import { onMounted, reactive, ref, type Ref } from "vue";

const props = defineProps({
    colour: Number,
    id: Number,
});

const ensureValidity: () => any = () => {
    try {
        if (
            props.id! > 63 ||
            props.id! < 0 ||
            props.colour! < 0 ||
            props.colour! > 1
        ) {
            throw "invalid piece definition. Either piece ID or colour is invalid onMounted";
        }

        return;
    } catch (error) {
        console.log(error);
    }
};

onMounted(ensureValidity());

let piece = getPieceType(props.id!);

const emit = defineEmits(["updatePiece"]);

let isSelectable: Ref<boolean> = ref(false);
let isSelected: Ref<boolean> = ref(false);

//May want to consider moving this to Board.vue. Doesn't seem like the squares job to determine if itself is selectable
for (let index = 0; index < getNumNotEmptyPieces(); index++) {
    if (piece == getNotEmptyPieces()[index]) {
        isSelectable.value = true;
    }
}

const select: () => void = () => {
    emit("updatePiece", props);

    
    //To Be Removed --- Will need to remove this once we implement logic.
    if (piece == "e") {
        postSelectedPiece(props.colour!, props.id!, piece!);
        postDeselect(deselect);
        return;
    }

    if (getIdOfSelectedPiece() == props.id) {
        isSelected.value = !isSelected.value;
        return;
    }

    if (getIdOfSelectedPiece() != props.id) {
        //Check so that it's safe to assert that values are non-null
        if (
            props.colour == undefined ||
            props.id == undefined ||
            piece == undefined
        ) {
            console.log(
                `Inside select() in Square Component\n\nEither props.colour: ${props.colour}\tprops.id: ${props.id}\tprops.piece: ${props.piece} are undefined\nExiting select()`
            );
            return;
        }
        isSelected.value = true;

        postSelectedPiece(props.colour!, props.id!, piece!);

        postDeselect(deselect);
    }
};

const deselect = (): void => {
    isSelected.value = false;
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
