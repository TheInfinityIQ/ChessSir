import { reactive } from 'vue';
import { getSquares } from './board_setup';
import type { IPiece, Move, moveVoid, npNumber, npVoid, numIPiece } from './types';
import { Piece } from './types';

let boardState: IPiece[][] = reactive([]);
let previousBoardState: IPiece[][] = [];

export const boardSize: number = 64; // Could be updated for larger board sizes in future;
export const rankAndFileValue: number = Math.sqrt(boardSize);
export const finalRowValue: number = rankAndFileValue - 1;
export const startingRowValue: number = 0;
export const endOfBoardId: number = boardSize - 1;
export const startOfBoardId: number = 0;

const initPieces: IPiece[] = getSquares();
let totalMoves: number = 0;
let isBoardFlipped: boolean = false;

function setupBoard() {
	let tempRow: IPiece[] = [];

	for (let row = startingRowValue; row < rankAndFileValue; row++) {
		for (let column = 0; column < rankAndFileValue; column++) {
			tempRow.push(initPieces[row * rankAndFileValue + column]);
		}
		boardState[row] = tempRow;
		tempRow = [];
	}
}

function logBoard() {
	console.log(boardState);
}

function getBoard() {
	return [];
}

function getPieces() {
	if (!boardState[0]) {
		setupBoard();
	}

	let pieces: IPiece[] = [];

	boardState.forEach((row) => {
		row.forEach((piece) => {
			pieces.push(piece);
		});
	});

	return pieces;
}

function getPieceType(id: number) {
	let pieceType = 'Invalid ID';

	boardState.forEach((row) => {
		row.forEach((piece) => {
			if (piece.id == id) {
				pieceType = piece.piece;
			}
		});
	});

	return pieceType;
}

function getTestPieceType(id: number) {
	let pieceType = 'Invalid ID';

	boardState.forEach((row) => {
		row.forEach((piece) => {
			if (piece.id == id) {
				pieceType = piece.piece;
			}
		});
	});

	return pieceType;
}

function getTotalMoves() {
	return totalMoves;
}

export function flipBoard() {
	isBoardFlipped = !isBoardFlipped;
	// Used to refresh piece orientation and trigger reactivity. 
	boardState.push([new Piece(999, 'e', 999)]);
	boardState.splice(finalRowValue + 1);
}

export function getIsBoardFlipped() {
	return isBoardFlipped;
}

function commitMoveToBoard(newMove: Move) {
	saveLastBoardState();
	let fromSquare: IPiece = newMove.fromSquare;

	let fromRow: number = Math.trunc(fromSquare.id / rankAndFileValue);
	let fromColumn: number = fromSquare.id % rankAndFileValue;

	boardState[fromRow][fromColumn].piece = 'e';

	let toSquare: IPiece = newMove.toSquare;

	let toRow: number = Math.trunc(toSquare.id / rankAndFileValue);
	let toColumn: number = toSquare.id % rankAndFileValue;

	boardState[toRow][toColumn].piece = fromSquare.piece;
	totalMoves++;
	flipBoard();
}

enum CastlingPiecesColStart {
	ROOK_QUEENSIDE = 0,
	ROOK_KINGSIDE = 7,
	KING = 4,
}

enum CastlingPiecesColOffset {
	ROOK_QUEENSIDE = 3,
	ROOK_KINGSIDE = -2,
	KING_KINGSIDE = 2,
	KING_QUEENSIDE = -2,
}

function commitCastleToBoard(pieceColour: string, castlingKingSide: boolean) {
	saveLastBoardState();
	const rowToCastle = pieceColour === 'w' ? finalRowValue : startingRowValue;
	const pieceTypes = ['k', 'r'];
	const kingAndRookNewId =
		castlingKingSide === true
			? [
					CastlingPiecesColStart.KING + CastlingPiecesColOffset.KING_KINGSIDE,
					CastlingPiecesColStart.ROOK_KINGSIDE + CastlingPiecesColOffset.ROOK_KINGSIDE,
			  ]
			: [
					CastlingPiecesColStart.KING + CastlingPiecesColOffset.KING_QUEENSIDE,
					CastlingPiecesColStart.ROOK_QUEENSIDE + CastlingPiecesColOffset.ROOK_QUEENSIDE,
			  ];

	let iteration = 0;
	for (let piece of kingAndRookNewId) {
		boardState[rowToCastle][piece].piece = pieceColour + pieceTypes[iteration++];
	}

	if (castlingKingSide) {
		boardState[rowToCastle][CastlingPiecesColStart.ROOK_KINGSIDE].piece = 'e';
	} else {
		boardState[rowToCastle][CastlingPiecesColStart.ROOK_QUEENSIDE].piece = 'e';
	}

	boardState[rowToCastle][CastlingPiecesColStart.KING].piece = 'e';
	totalMoves++;
	flipBoard();
}

function saveLastBoardState() {
	previousBoardState = JSON.parse(JSON.stringify(boardState));
}

function getPreviousBoardState() {
	return previousBoardState;
}

function getPreviousBoardStateWrapper() {
	if (!previousBoardState[0]) {
		previousBoardState = JSON.parse(JSON.stringify(boardState));
	}
	return getPreviousBoardState();
}

function getSquareWithIdWrapper(id: number) {
	if (!boardState[0]) {
		setupBoard();
	}
	return getSquareWithId(id);
}

function getSquareWithId(id: number) {
	let row: number = Math.trunc(id! / rankAndFileValue);
	let column: number = id! % rankAndFileValue;

	return boardState[row][column];
}

function getTestBoard() {
	return JSON.parse(JSON.stringify(boardState));
}

function findPieceById(id: number, board: IPiece[][] = boardState): IPiece {
	if (!board[0]) {
		setupBoard();
	}
	let foundPiece: IPiece | undefined;
	for (const row of board) {
		foundPiece = row.find((piece) => piece.id === id);
		if (foundPiece) {
			break;
		}
	}

	if (id < startOfBoardId || id > endOfBoardId || !foundPiece) {
		throw new Error(`Piece with id \${id} not found or id is out of bounds`);
	}

	return foundPiece!;
}

function findKing(pieceColour: string, board: IPiece[][] = boardState) {
	const pieceType = 'k';
	if (!board[0]) {
		setupBoard();
	}

	let foundPiece: IPiece | undefined;
	for (const row of board) {
		foundPiece = row.find((square) => square.piece === pieceColour + pieceType);
		if (foundPiece) {
			break;
		}
	}

	if (foundPiece === undefined) {
		console.error('A king is missing???');
	}
	return foundPiece!;
}

export {
	getPreviousBoardStateWrapper,
	setupBoard,
	logBoard,
	getBoard,
	getPieces,
	getPieceType,
	commitMoveToBoard,
	getTestPieceType,
	getSquareWithIdWrapper,
	findPieceById,
	commitCastleToBoard,
	getTestBoard,
	boardState,
	findKing,
	getTotalMoves,
};
