<script setup lang="ts">
import { squares } from "@/scripts/board_setup";
import Square from "./Square.vue";
</script>

<template>
    <section>
        <li v-for="square in squares">
            <Square :id="square.id" :colour="square.colour"/>
        </li>
    </section>
</template>

<style scoped>
/* Make responsive */
section {
    width: 800px;
    height: 800px;
}

.rank {
    height: 12.5%;

    display: block;
}
.dark {
    background-color: grey;
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
