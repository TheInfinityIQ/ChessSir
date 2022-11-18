<script setup lang="ts">
import Square from "./Square.vue";
</script>

<template>
    <section>
        <div class="rank">
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
        </div>

        <div class="rank">
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
        </div>

        <div class="rank">
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
        </div>

        <div class="rank">
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
        </div>

        <div class="rank">
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
        </div>

        <div class="rank">
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
        </div>

        <div class="rank">
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
        </div>

        <div class="rank">
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
            <Square class="dark" />
            <Square class="light" />
        </div>
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

.pink {
    background-color: pink;
}
</style>
