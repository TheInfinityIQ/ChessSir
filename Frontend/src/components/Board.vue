<script setup lang="ts">
import { getSquares } from "@/scripts/board_setup";
import Square from "./Square.vue";
</script>

<template>
    <article>
        <li v-for="square in getSquares()">
            <Square :id="square.id" :colour="square.colour" />
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

.wk {
    background-image: url("../assets/wk.png");
}

.wn {
    background-image: url("../assets/wn.png");
}

.wb {
    background-image: url("../assets/wb.png");
}

.wp {
    background-image: url("../assets/wp.png");
}

.wq {
    background-image: url("../assets/wq.png");
}

.wr {
    background-image: url("../assets/wr.png");
}
</style>
