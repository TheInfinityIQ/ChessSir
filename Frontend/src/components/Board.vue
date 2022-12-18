<script setup lang="ts">
import { getSquares } from "@/scripts/board_setup";
import { getInitBoardState } from "@/scripts/init";
import Square from "./Square.vue";
</script>

<template>
    <article>
        <li v-for="square in getSquares()">
            <Square :id="square.id" :colour="square.colour" :class="square.piece" class="square" />
        </li>
    </article>
</template>

<style scoped>
article {
    width: 40vw;
    height: 40vw;

    border: 1px solid pink;

    display: flex;
    flex-flow: row;
    flex-wrap: wrap;
    align-content: flex-start;

    padding: 0;
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
