import type { Ref } from 'vue';
import type { IMove, IPiece } from './types';

import { reactive, ref } from 'vue';
import { Move, TempPiece } from './types';
import { defineStore } from 'pinia';
import { setupBoard } from './board';

export const useGameStore = defineStore('game', () => {
	const kingInCheck: Ref<boolean> = ref(false);
	const isPromotionActive: Ref<boolean> = ref(false);
	const isWhitesTurn: Ref<boolean> = ref(true);
	const testToggleFlipBoard: Ref<boolean> = ref(false);
	const isBoardFlipped: Ref<boolean> = ref(false);
	const totalMoves: Ref<number> = ref(0);
	const selectedPieces: Ref<number[]> = ref([]);
	const specialContainer = reactive({
		selectedPiece: new TempPiece(),
		pieceToPromote: new TempPiece(),
		moveToPromote: new Move(new TempPiece(), new TempPiece()),
	});
	const testing: boolean = false;
	let previousBoard: IPiece[][] = [];
	const game = reactive({
		board: setupBoard(),
	});

	function incrementMoves(): void {
		totalMoves.value++;
	}

	function toggleTurns(): void {
		isWhitesTurn.value = !isWhitesTurn.value;
	}

	function togglePromotion(): void {
		isPromotionActive.value = !isPromotionActive.value;
	}

	function updateMoveToPromote(move: IMove): void {
		specialContainer.moveToPromote = move;
	}

	function unselectPiece(): void {
		specialContainer.selectedPiece = new TempPiece();
	}

	function isPieceSelected(): boolean {
		//Compared not equal to make function more readable. If they equaled, then no piece is selected.
		return JSON.stringify(specialContainer.selectedPiece) !== JSON.stringify(new TempPiece());
	}

	function savePreviousBoard(board: IPiece[][]): void {
		previousBoard = JSON.parse(JSON.stringify(board));
	}

	function getPreviousBoard(): IPiece[][] {
		return previousBoard;
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
		isBoardFlipped,
		testToggleFlipBoard,
		getPreviousBoard,
		isPieceSelected,
		unselectPiece,
		updateMoveToPromote,
		savePreviousBoard,
		toggleTurns,
		togglePromotion,
		incrementMoves,
	};
});
