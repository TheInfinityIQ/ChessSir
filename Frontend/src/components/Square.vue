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
import { onMounted, ref, type Ref } from "vue";

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

onMounted(ensureValidity);

let pieceRef = ref(getPieceType(props.id!));

let isSelectable: Ref<boolean> = ref(false);
let isSelected: Ref<boolean> = ref(false);

//May want to consider moving this to Board.vue. Doesn't seem like the squares job to determine if itself is selectable
for (let index = 0; index < getNumNotEmptyPieces(); index++) {
    if (pieceRef.value == getNotEmptyPieces()[index]) {
        isSelectable.value = true;
    }
}

const select: () => void = () => {
    //To Be Removed --- Will need to remove this once we implement logic.
    if (pieceRef.value == "e") {
        postSelectedPiece(props.colour!, props.id!, pieceRef.value!);
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
            pieceRef.value == undefined
        ) {
            console.log(
                `Inside select() in Square Component\n\nEither props.colour: ${props.colour}\tprops.id: ${props.id}\tprops.piece: ${pieceRef.value} are undefined\nExiting select()`
            );
            return;
        }
        isSelected.value = true;

        postSelectedPiece(props.colour!, props.id!, pieceRef.value!);

        postDeselect(deselect);
    }
};

const deselect = (): void => {
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
            pieceRef,
        ]"
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

/* White Pieces */
.wr {
    background-image: url("../assets/pieces/wr.png");
}

.wn {
    background-image: url("../assets/pieces/wn.png");
}

.wb {
    background-image: url("../assets/pieces/wb.png");
}

.wk {
    background-image: url("../assets/pieces/wk.png");
}

.wq {
    background-image: url("../assets/pieces/wq.png");
}

.wp {
    background-image: url("../assets/pieces/wp.png");
}

/* Black Pieces */
.br {
    background-image: url("../assets/pieces/br.png");
}

.bn {
    background-image: url("../assets/pieces/bn.png");
}

.bb {
    background-image: url("../assets/pieces/bb.png");
}

.bk {
    background-image: url("../assets/pieces/bk.png");
}

.bq {
    background-image: url("../assets/pieces/bq.png");
}

.bp {
    background-image: url("../assets/pieces/bp.png");
}
</style>
