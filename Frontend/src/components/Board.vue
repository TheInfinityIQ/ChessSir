<script setup lang="ts">
import { setupBoard } from '@/scripts/board';
import { computed, onMounted } from 'vue';
import Square from './Square.vue';
import { useGameStore } from '../scripts/state';
const store = useGameStore();

onMounted(setupBoard);
</script>

<template>
	<article :class="{ flipBoard: store.isBoardFlipped }" class="board">
		<div v-for="row in store.game.board" class="parentList">
			<div v-for="square in row" class="square-container">
				<Square :id="square.id" :squareColour="square.colour" :flipped="store.isBoardFlipped" />
			</div>
		</div>
	</article>
</template>

<style scoped>
.flipBoard {
	transform: scale(-1, -1);
}

.board {
	width: 90%;
	margin-bottom: 20px;

	max-width: 1000px;
	aspect-ratio: 1 / 1;
	border: 1px solid black;
}

.parentList {
	width: 100%;
	height: 12.5%;

	display: flex;
}

.square-container {
	width: 12.5%;
	height: 100%;
}

/* White Pieces */
</style>
