import type { ComputedRef, Ref } from 'vue';
import type { IMove, IPiece } from './types';

import { computed, reactive, ref } from 'vue';
import { Move, Piece, TempPiece } from './types';
import { defineStore } from 'pinia';
import { tempIPiece } from './staticValues';
import { setupBoard } from './board';

export const useGameStore = defineStore('game', () => {
	const kingInCheck: Ref<boolean> = ref(false);
	const isPromotionActive: Ref<boolean> = ref(false);
	const isWhitesTurn: Ref<boolean> = ref(true);
	const totalMoves: Ref<number> = ref(0);
	const specialContainer = reactive({
		selectedPiece: new TempPiece(),
		pieceToPromote: new TempPiece(),
		moveToPromote: new Move(new TempPiece(), new TempPiece())
	});
	const selectedPieces: Ref<number[]> = ref([]);
	const testing: boolean = false;
	const game = reactive({
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

	function updateMoveToPromote(move: IMove) {
		specialContainer.moveToPromote = move;
	}

	function unselectPiece() {
		specialContainer.selectedPiece = new TempPiece();
	}

	return {
		kingInCheck,
		isPromotionActive,
		isWhitesTurn,
		totalMoves,
		game,
		selectedPieces,
		testing,
		specialContainer,
		unselectPiece,
		updateMoveToPromote,
		toggleTurns,
		togglePromotion,
		incrementMoves,
	};
});
