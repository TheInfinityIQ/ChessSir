import type { ComputedRef, Ref } from 'vue';
import type { IMove, IPiece } from './types';

import { computed, reactive, ref } from 'vue';
import { Move, Piece } from './types';
import { defineStore } from 'pinia';
import { UnselectedPiece, tempIPiece } from './staticValues';
import { setupBoard } from './board';



export const useGameStore = defineStore('game', () => {
	const kingInCheck: Ref<boolean> = ref(false);
	const isPromotionActive: Ref<boolean> = ref(false);
	const pawnPromotionColour: Ref<string> = ref('');
	const pawnPromotionPiece: Ref<string> = ref('');
	const selectedSquarePiece: Ref<string | undefined> = ref('');
	const selectedSquareColour: Ref<number | undefined> = ref(-1);
	const selectedSquareId: Ref<number | undefined> = ref(-1);
	const isWhitesTurn: Ref<boolean> = ref(true);
	const totalMoves: Ref<number> = ref(0);
	const selectedPiece: ComputedRef<IPiece> = computed(() => new Piece(selectedSquareId.value!, selectedSquarePiece.value!, selectedSquareColour.value!))
	let moveToPromote = new Move(tempIPiece, tempIPiece);
	const game = reactive({
		deselectContainer: () => {},
		board: setupBoard(),
	});

	function incrementMoves() {
		totalMoves.value++;
	}

	function toggleTurns() {
		isWhitesTurn.value = !isWhitesTurn.value;
	}

	function togglePromotion() {
		isPromotionActive.value = !isPromotionActive.value;
	}

	function unselectPiece() {
		game.deselectContainer();
		game.deselectContainer = () => {};
		selectedSquarePiece.value = UnselectedPiece.PIECE;
		selectedSquareColour.value = UnselectedPiece.COLOUR;
		selectedSquareId.value = UnselectedPiece.ID;
	}

	function updateSelectedPiece(piece: IPiece) {
		selectedSquarePiece.value = piece.piece;
		selectedSquareColour.value = piece.colour;
		selectedSquareId.value = piece.id;
	}

	function updateMoveToPromote(move: IMove) {
		moveToPromote = move;
	}

	return {
		kingInCheck,
		isPromotionActive,
		pawnPromotionColour,
		selectedSquarePiece,
		selectedSquareColour,
		selectedSquareId,
		isWhitesTurn,
		pawnPromotionPiece,
		totalMoves,
		game,
		selectedPiece,
		moveToPromote,
		updateSelectedPiece,
		updateMoveToPromote,
		toggleTurns,
		togglePromotion,
		unselectPiece,
		incrementMoves,
	};
});
