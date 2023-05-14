<script lang="ts">
export default {
	inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { boardState } from '@/scripts/board';
import { getIdOfSelectedPiece, postSelectedPiece, postDeselect, unselectPiece, isPieceSelected, getIsKingInCheck } from '@/scripts/state';
import { Piece } from '@/scripts/types';
import { computed, onMounted, ref } from 'vue';
import { getIsBoardFlipped } from '../scripts/board';
import { makeMove } from '@/scripts/moveValidation';

const props = defineProps<{
	id: number;
	squareColour: number;
}>();

// Calculate row and column from the given ID
const row = Math.floor(props.id / 8);
const column = Math.floor(props.id % 8);

const isBoardFlipped = computed(() => getIsBoardFlipped());
const isKingInCheck = computed(() => getIsKingInCheck(props.id, boardState[row][column].piece));

// Ensure that the input values for the piece are valid
const ensureValidity = () => {
	if (props.id > 63 || props.id < 0 || props.squareColour < 0 || props.squareColour > 1) {
		console.error('Invalid piece definition. Either piece ID or colour is invalid onMounted');
	}
};

onMounted(ensureValidity);

// Check if the piece on this square is selectable
const isSelectable = computed(() => boardState[row][column].piece !== 'e');
const isSelected = ref(false);

function select() {
	const square = new Piece(props.id, boardState[row][column].piece, props.squareColour);

	if (getIdOfSelectedPiece() === props.id) {
		isSelected.value = !isSelected.value;
		return;
	}

	postDeselect(deselect);

	if (square.piece === 'e' && !isPieceSelected()) {
		return;
	}

	if ((getIdOfSelectedPiece() !== props.id && getIdOfSelectedPiece()) || getIdOfSelectedPiece() === 0) {
		makeMove(square);
		unselectPiece();
		return;
	}

	isSelected.value = !isSelected.value;
	postSelectedPiece(square);
}

function deselect() {
	isSelected.value = false;
}
</script>

<template>
	<div
		:class="[
			{
				lighter: squareColour == 0,
				darker: squareColour == 1,
				selectable: isSelectable,
				selected: isSelected,
			},
			boardState[row][column].piece,
			{ flipPiece: isBoardFlipped.value },
			{ inCheck: isKingInCheck },
		]"
		@click="select"
	></div>
</template>

<style scoped>
div {
	width: 100%;
	height: 100%;
	background-position: center;
	background-size: cover;
}

.inCheck {
	background-color: red;
}

.flipPiece {
	transform: scale(-1, -1);
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
</style>
