import { reactive, ref, type Ref } from 'vue';
import { Piece, type IPiece, type Move, type IMove } from './types';
import { CastlingPiecesColStart, CastlingPiecesColOffset, initBoard, endOfBoardId, endRowValue, rowAndColValue, startOfBoardId, startRowValue } from './staticValues';
import { useGameStore } from './state';
import { endTurn } from './game';
import { getSquares } from './boardUtilities';
import { determineOffset, getPathOfSquaresToPiece } from './moveUtilities';

//TODO: REMOVE WHEN DONE TESTING
export function toggleFlipBoard() {
	const store = useGameStore();
	store.testToggleFlipBoard = store.testToggleFlipBoard;
}

function commitMoveToBoard(newMove: Move) {
	const store = useGameStore();
	
	store.savePreviousBoard(store.game.board);
	let fromSquare: IPiece = newMove.fromSquare;

	let fromRow: number = Math.trunc(fromSquare.id / rowAndColValue);
	let fromColumn: number = fromSquare.id % rowAndColValue;

	store.game.board[fromRow][fromColumn].piece = 'e';

	let toSquare: IPiece = newMove.toSquare;

	let toRow: number = Math.trunc(toSquare.id / rowAndColValue);
	let toColumn: number = toSquare.id % rowAndColValue;

	store.game.board[toRow][toColumn].piece = fromSquare.piece;
	endTurn();
}

function commitCastleToBoard(pieceColour: string, castlingKingSide: boolean) {
	const store = useGameStore();
	store.savePreviousBoard(store.game.board);
	const rowToCastle = pieceColour === 'w' ? endRowValue : startRowValue;
	const pieceTypes = ['k', 'r'];
	const kingAndRookNewId =
		castlingKingSide === true
			? [CastlingPiecesColStart.KING + CastlingPiecesColOffset.KING_KINGSIDE, CastlingPiecesColStart.ROOK_KINGSIDE + CastlingPiecesColOffset.ROOK_KINGSIDE]
			: [CastlingPiecesColStart.KING + CastlingPiecesColOffset.KING_QUEENSIDE, CastlingPiecesColStart.ROOK_QUEENSIDE + CastlingPiecesColOffset.ROOK_QUEENSIDE];

	let iteration = 0;
	for (let piece of kingAndRookNewId) {
		store.game.board[rowToCastle][piece].piece = pieceColour + pieceTypes[iteration++];
	}

	if (castlingKingSide) {
		store.game.board[rowToCastle][CastlingPiecesColStart.ROOK_KINGSIDE].piece = 'e';
	} else {
		store.game.board[rowToCastle][CastlingPiecesColStart.ROOK_QUEENSIDE].piece = 'e';
	}

	store.game.board[rowToCastle][CastlingPiecesColStart.KING].piece = 'e';
	endTurn();
}

export function commitPawnPromotionToBoard(move: IMove) {
	const store = useGameStore();
	store.savePreviousBoard(store.game.board);

	const { fromSquare, toSquare } = move;
	const fromRow = Math.floor(fromSquare.id / rowAndColValue);
	const fromCol = Math.floor(fromSquare.id % rowAndColValue);
	const toRow = Math.floor(toSquare.id / rowAndColValue);
	const toCol = Math.floor(toSquare.id % rowAndColValue);

	store.game.board[fromRow][fromCol].piece = 'e';
	store.game.board[toRow][toCol].piece = store.specialContainer.pieceToPromote.piece;
	store.togglePromotion();
	endTurn();
}

export function setupBoard() {
	let board: IPiece[][] = [];
	let tempRow: IPiece[] = [];

	for (let row = startRowValue; row < rowAndColValue; row++) {
		for (let column = 0; column < rowAndColValue; column++) {
			const tempPiece = getSquares()[row * rowAndColValue + column];
			tempRow.push(new Piece(tempPiece.id, tempPiece.piece, tempPiece.colour));
		}
		board[row] = tempRow;
		tempRow = [];
	}

	return board;
}

export function flipBoard() {
	const store = useGameStore();
	if (!store.testToggleFlipBoard) {
		return;
	}
	store.isBoardFlipped = !store.isBoardFlipped;
}

export { commitMoveToBoard, commitCastleToBoard };
