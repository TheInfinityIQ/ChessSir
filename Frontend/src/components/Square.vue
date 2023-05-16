<script lang="ts">
export default {
	inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { findPieceWithId, getIsBoardFlipped } from '@/scripts/board';
import { makeMove } from '@/scripts/moveValidation';
import { PieceProps, ChessPiece, rowAndColValue, UnselectedPiece } from '@/scripts/staticValues';
import { Piece } from '@/scripts/types';
import { type ComputedRef, computed, onMounted, ref, type Ref, reactive } from 'vue';
import { useGameStore } from '../scripts/state';
const store = useGameStore();

const props = defineProps<{
	id: number;
	squareColour: number;
}>();

let isKingInCheck: ComputedRef<boolean> = computed(() => false);
const isSelected = computed(() => store.selectedPieces.includes(props.id));

// Calculate row and column from the given ID
const row = Math.floor(props.id / rowAndColValue);
const column = props.id % rowAndColValue;
const pieceOnSquare = store.game.board[row][column].piece;

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

    // If the user is trying to deselect the current piece
    if (store.selectedSquareId === props.id) {
        deselect();
        store.unselectPiece();
        return;
    }

    // If a piece was already selected and the user is trying to select a new piece of the same color
    if (store.selectedSquareId !== UnselectedPiece.ID && pieceOnSquare[PieceProps.COLOUR] === props.squareColour) {
        deselect();
        store.unselectPiece();
        store.updateSelectedPiece(move);
        return;
    }

    // If a piece was already selected and the user is trying to select a piece of a different color (i.e., make a move)
    if (store.selectedSquareId !== UnselectedPiece.ID && store.selectedSquarePiece.value[PieceProps.COLOUR] !== props.squareColour) {
        // If the selected piece is moving to an empty square
        if (pieceOnSquare.value.piece === 'e') {
            makeMove(move);
            deselect();
            store.unselectPiece();
            return;
        }
        // If the selected piece is moving to an occupied square
        if (pieceOnSquare.value.piece !== 'e' && pieceOnSquare.value.piece[PieceProps.COLOUR] !== store.selectedSquarePiece.value[PieceProps.COLOUR]) {
            makeMove(move);
            deselect();
            store.unselectPiece();
            return;
        }
    }

    // Otherwise, if no piece is currently selected, select the clicked piece
    if (store.selectedSquareId === UnselectedPiece.ID) {
        store.updateSelectedPiece(move);
        pieceOnSquare.value.selected = true;
    }
}

function deselect() {
    store.deselectPiece(props.id); // Add this line
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
