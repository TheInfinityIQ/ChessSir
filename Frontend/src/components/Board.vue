<script setup lang="ts">
import { setupBoard, boardState } from '@/scripts/board';
import { computed, onMounted } from 'vue';
import Square from './Square.vue';
import { getIsBoardFlipped } from '../scripts/board';

onMounted(setupBoard);
const isBoardFlipped = computed(() => getIsBoardFlipped())
</script>

<template>
	<article :class="{ flipBoard: isBoardFlipped.value }" class="board">
		<div v-for="row in boardState" class="parentList">
			<div v-for="square in row" class="square-container">
				<Square :id="square.id" :colour="square.colour" :flipped="isBoardFlipped.value" />
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
.wr {
	background-image: url('../assets/pieces/wr.png');
}

.wn {
	background-image: url('../assets/pieces/wn.png');
}

.wb {
	background-image: url('../assets/pieces/wb.png');
}

.wk {
	background-image: url('../assets/pieces/wk.png');
}

.wq {
	background-image: url('../assets/pieces/wq.png');
}

.wp {
	background-image: url('../assets/pieces/wp.png');
}

/* Black Pieces */
.br {
	background-image: url('../assets/pieces/br.png');
}

.bn {
	background-image: url('../assets/pieces/bn.png');
}

.bb {
	background-image: url('../assets/pieces/bb.png');
}

.bk {
	background-image: url('../assets/pieces/bk.png');
}

.bq {
	background-image: url('../assets/pieces/bq.png');
}

.bp {
	background-image: url('../assets/pieces/bp.png');
}
</style>
