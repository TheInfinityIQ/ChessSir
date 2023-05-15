<script lang="ts">
export default {
	inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { findPieceWithId, getIsBoardFlipped } from '@/scripts/board';
import { makeMove } from '@/scripts/moveValidation';
import { PieceProps, ChessPiece, rowAndColValue } from '@/scripts/staticValues';
import { Piece } from '@/scripts/types';
import { type ComputedRef, computed, onMounted, ref, type Ref, reactive } from 'vue';
import { useGameStore } from '../scripts/state'
const store = useGameStore();

const props = defineProps<{
	id: number;
	squareColour: number;
}>();

let isKingInCheck: ComputedRef<boolean> = computed(() => false);
const pieceOnSquare = findPieceWithId(props.id);

// Calculate row and column from the given ID
const row = Math.floor(props.id / rowAndColValue);
const column = props.id % rowAndColValue;

const kingId = computed(() => {
	let kId = -1;
	for (let i = 0; i < store.game.board.length; i++) {
		for (let j = 0; j < store.game.board[i].length; j++) {
			if (store.game.board[i][j].piece[PieceProps.TYPE] === ChessPiece.KING) {
				kId = i * rowAndColValue + j;
				break;
			}
		}
		if (kId != -1) {
			break;
		}
	}
	return kId;
});

const isBoardFlipped = computed(() => getIsBoardFlipped());

// Ensure that the input values for the piece are valid
const ensureValidity = () => {
	if (props.id > 63 || props.id < 0 || props.squareColour < 0 || props.squareColour > 1) {
		console.error('Invalid piece definition. Either piece ID or colour is invalid onMounted');
	}
};

onMounted(ensureValidity);

// Check if the piece on this square is selectable
const isSelectable = computed(() => store.game.board[row][column].piece !== 'e');

function select() {
	const move = new Piece(props.id, store.game.board[row][column].piece, props.squareColour);
	store.game.deselectContainer = deselect;
	store.updateSelectedPiece(move);
	
	if (store.selectedSquareId === props.id) pieceOnSquare.selected.value = !pieceOnSquare.selected.value ;

	if ((store.selectedSquareId !== props.id && store.selectedSquareId) || store.selectedSquareId === 0) {
		makeMove(move);
		store.unselectPiece();
		return;
	}

	
}

function deselect() {
	pieceOnSquare.selected.value = false;
}
</script>

<template>
	<div
		:class="[
			{
				lighter: squareColour == 0,
				darker: squareColour == 1,
				selectable: isSelectable,
				selected: findPieceWithId(props.id).selected,
				inCheck: props.id === kingId && isKingInCheck,
				flipPiece: isBoardFlipped.value,
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
