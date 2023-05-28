<script setup lang="ts">
import Board from './components/Board.vue';
import PromotionModal from './components/PromotionModal.vue';
import { flipBoard, setupBoard, toggleFlipBoard } from './scripts/board';
import { useGameStore } from './scripts/state';
const store = useGameStore();

function setupGame() {
	setupBoard();
}
</script>

<template>
	<main>
		<nav class="row-1">
			<button @click="setupGame">setup board</button>
			<button @click="flipBoard()">flip Board</button>
			<button @click="store.isPromotionActive = !store.isPromotionActive">toggle modal</button>
			<button @click="toggleFlipBoard()">no flip {{ !store.testToggleFlipBoard }}</button>
		</nav>
		<section class="grid-container-body row-2">
			<article class="column-1">
				<h1 class="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-400 text-6xl">Hello World!</h1>
			</article>
			<article class="board-container column-2">
				<PromotionModal />
				<Board />
			</article>
			<article class="column-3"></article>
		</section>
		<footer class="row-3">
			<p>test</p>
		</footer>
	</main>
</template>

<style scoped>
main {
	display: grid;
	grid-template-rows: 1fr 12fr 1fr;

	border: 1px solid black;
	border-width: 0 10px;

	width: 100vw;
	height: 100vh;
}

nav {
	border: 1px solid black;

	display: flex;
	justify-content: center;
	gap: 2vw;
}

button {
	width: 1fr;

	margin: 15px 0;
}

.grid-container-body {
	display: grid;
	grid-template-columns: 2fr 6fr 2fr;
}

.row {
	width: 100%;
	height: 100%;
}

.row-1,
.row-2,
.row-3 {
	border: 1px solid black;
}

.column {
	width: 100%;
	height: 100%;
}

.column-1,
.column-2,
.column-3 {
	border: 1px solid black;
}

.board-container {
	height: 100%;

	border: 1px solid black;

	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;

	padding: 0;
}

footer {
	height: 4%;
	width: 100vw;

	border: 1px solid black;
}
</style>
