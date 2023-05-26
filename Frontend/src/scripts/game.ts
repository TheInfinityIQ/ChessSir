import { flipBoard } from "./board";
import { useGameStore } from "./state";

export function endTurn() {
	const store = useGameStore();

	store.totalMoves++;

	isItCheckmate();

	store.toggleTurns();
	store.unselectPiece();
	flipBoard();
}

export function isItCheckmate()
{
	
}