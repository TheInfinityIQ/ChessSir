import { flipBoard } from './board';
import { findKingOnBoard, findPieceWithId, isIdWithinBounds } from './boardUtilities';
import { piecesToSquare } from './moveUtilities';
import { validKingMove } from './moveValidation';
import { isKingInCheck } from './specialPieceRules';
import { useGameStore } from './state';
import { AdjacentSquareIdOffsets, ChessPiece, PieceProps } from './staticValues';
import { Piece, type IPiece, Move } from './types';

export function endTurn() {
	const store = useGameStore();

	store.totalMoves++;

	const opponentKingColour = store.specialContainer.selectedPiece.piece[PieceProps.COLOUR] === ChessPiece.WHITE ? ChessPiece.BLACK : ChessPiece.WHITE;
	console.log(`Is ${opponentKingColour}'s king in checkmate?`);
	isItCheckmate(opponentKingColour);

	store.toggleTurns();
	store.unselectPiece();
	flipBoard();
}

export function isItCheckmate(kingColour: string): boolean {
	const store = useGameStore();

	const kingSquare = findKingOnBoard(kingColour, store.game.board);
	const isInCheck = isKingInCheck(kingSquare, store.game.board, kingSquare.piece[PieceProps.COLOUR]);

	if (!isInCheck) return false;
	if (canKingMove(kingSquare)) return false;
	if (canPiecePreventCheckmate(kingSquare)) return false;

	return true;
}

function canKingMove(kingSquare: IPiece): boolean {
	const store = useGameStore();

	let result = false;

	const emptySquares = getPossibleKingMoves(kingSquare.piece[PieceProps.COLOUR], store.game.board);
	console.log('empty squares');
	console.log(emptySquares);

	for (let checkedSquare = 0; checkedSquare < emptySquares.length; checkedSquare++) {
		const emptySquare = emptySquares[checkedSquare];

		if (validKingMove(new Move(kingSquare, emptySquare))) result = true;
	}

	console.log(`Can King Move: ${result}`);
	return result;
}

function getPossibleKingMoves(kingColour: string, board: IPiece[][]): IPiece[] {
	const opponentColour = kingColour === ChessPiece.WHITE ? ChessPiece.BLACK : ChessPiece.WHITE;
	const kingSquare = findKingOnBoard(kingColour, board);

	const offsets = [
		AdjacentSquareIdOffsets.DOWN,
		AdjacentSquareIdOffsets.DOWN_LEFT,
		AdjacentSquareIdOffsets.DOWN_RIGHT,
		AdjacentSquareIdOffsets.LEFT,
		AdjacentSquareIdOffsets.RIGHT,
		AdjacentSquareIdOffsets.UP,
		AdjacentSquareIdOffsets.UP_LEFT,
		AdjacentSquareIdOffsets.UP_RIGHT,
	];

	const emptySquares: IPiece[] = [];

	offsets.forEach((id) => {
		const testId = kingSquare.id + id;
		console.log(id);

		if (isIdWithinBounds(testId)) {
			const foundSquare = findPieceWithId(testId, board);
			if (foundSquare.piece === ChessPiece.EMPTY || foundSquare.piece[PieceProps.COLOUR] === opponentColour) emptySquares.push(foundSquare);
		}
	});

	return emptySquares;
}

function canPiecePreventCheckmate(kingSquare: IPiece): boolean {
	const store = useGameStore();

	let result = false;

	const opponentColour = kingSquare.piece[PieceProps.COLOUR] === ChessPiece.WHITE ? ChessPiece.BLACK : ChessPiece.WHITE;
	const attackingPieces = piecesToSquare(kingSquare, opponentColour, store.game.board);

	return true;
}
