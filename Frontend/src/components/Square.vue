<script setup lang="ts">
defineProps({
    colour: Number,
    id: Number,
    piece: String
});
</script>

<template>
    <div :class="{ lighter: colour == 0, darker: colour == 1, piece } "></div>
</template>

<style scoped>
div {
    width: 5vw;
    height: 5vw;

    background-position: center;
    background-size: cover;
}

.lighter {
    background-color: white;
}

.darker {
    background-color: black;
}
</style>
