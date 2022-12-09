<script setup lang="ts">
defineProps({
    colour: Number,
    id: Number
})


</script>

<template>
    <div :class=" { lighter: colour == 0, darker: colour == 1}"></div>
</template>

<style scoped>
    div {
        width: 5vw;
        height: 5vw;

        background-color: black;
    }

    .lighter {
        background-color: white;
    }

    .darker {
        background-color:black;
    }
</style>