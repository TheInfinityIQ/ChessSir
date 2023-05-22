<script lang="ts">
export default {
	inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { getIsBoardFlipped } from '@/scripts/board';
import { ChessPiece, PieceProps, rowAndColValue } from '@/scripts/staticValues';
import { Piece, TempPiece } from '@/scripts/types';
import { computed, onMounted, type ComputedRef, type Ref, nextTick } from 'vue';
import { useGameStore } from '../scripts/state';
import { makeMove } from '../scripts/moveValidation';
import { piecesToSquare } from '../scripts/moveUtilities';
const store = useGameStore();

const props = defineProps<{
	id: number;
	squareColour: number;
}>();

const row = Math.floor(props.id / rowAndColValue);
const column = props.id % rowAndColValue;

const pieceOnSquare: ComputedRef<string> = computed(() => store.game.board[row][column].piece);
const isSelectable: ComputedRef<boolean> = computed(() => store.game.board[row][column].piece !== ChessPiece.EMPTY);
const isSelected: ComputedRef<boolean> = computed(() => store.specialContainer.selectedPiece.id === props.id);
const isBoardFlipped: Ref<boolean> = getIsBoardFlipped();

// Ensure that the input values for the piece are valid
const ensureValidity = () => {
	if (props.id > 63 || props.id < 0 || props.squareColour < 0 || props.squareColour > 1) {
		console.error('Invalid piece definition. Either piece ID or colour is invalid onMounted');
	}
};

onMounted(ensureValidity);

function select() {
	const pieceToMove = new Piece(props.id, store.game.board[row][column].piece, props.squareColour);

	if (pieceToMove.piece === ChessPiece.EMPTY && !store.isPieceSelected()) {
		return;
	}

	// If the user is trying to deselect the current piece
	if (store.specialContainer.selectedPiece.id === props.id) {
		if (store.testing) console.log('selecting same piece');
		store.unselectPiece();
		return;
	}

	// If a piece was already selected and the user is trying to select a new piece of the same color
	if (pieceOnSquare.value[PieceProps.COLOUR] === store.specialContainer.selectedPiece.piece[PieceProps.COLOUR]) {
		if (store.testing) console.log('selecting piece of same colour');
		store.unselectPiece();
		return;
	}

	// Otherwise, if no piece is currently selected, select the clicked piece
	if (JSON.stringify(store.specialContainer.selectedPiece) === JSON.stringify(new TempPiece())) {
		if (store.testing) console.log('selecting a piece');
		store.specialContainer.selectedPiece = pieceToMove;
		return;
	}

	makeMove(pieceToMove);
	store.unselectPiece();
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
				flipPiece: isBoardFlipped,
				[store.game.board[row][column].piece]: true,
			},
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
