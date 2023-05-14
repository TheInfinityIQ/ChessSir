import { reactive, ref, type Ref } from 'vue';
import { getSquares } from './board_setup';
import type { IPiece, Move, moveVoid, npNumber, npVoid, numIPiece } from './types';
import { Piece } from './types';
import { getPawnPromotionMove, getPawnPromotionPiece, toggleIsPromotionActive, toggleTurns } from './state';

let boardState: IPiece[][] = reactive([]);
let previousBoardState: IPiece[][] = [];

export const boardSize: number = 64; // Could be updated for larger board sizes in future;
export const rowAndColValue: number = Math.sqrt(boardSize);
export const endRowValue: number = rowAndColValue - 1;
export const startRowValue: number = 0;
export const endOfBoardId: number = boardSize - 1;
export const startOfBoardId: number = 0;

const testToggleFlipBoard: Ref<boolean> = ref(true);
export function toggleFlipBoard() {
	testToggleFlipBoard.value = !testToggleFlipBoard.value;
}
export function getToggleFlipBoard() {
	return testToggleFlipBoard;
}

const initPieces: IPiece[] = getSquares();
let totalMoves: number = 0;
let isBoardFlipped: Ref<boolean> = ref(false);

function setupBoard() {
	let tempRow: IPiece[] = [];

	for (let row = startRowValue; row < rowAndColValue; row++) {
		for (let column = 0; column < rowAndColValue; column++) {
			tempRow.push(initPieces[row * rowAndColValue + column]);
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
	if (!testToggleFlipBoard.value) {
		return;
	}
	isBoardFlipped.value = !isBoardFlipped.value;
}

export function getIsBoardFlipped() {
	return isBoardFlipped;
}

function commitMoveToBoard(newMove: Move) {
	saveLastBoardState();
	let fromSquare: IPiece = newMove.fromSquare;

	let fromRow: number = Math.trunc(fromSquare.id / rowAndColValue);
	let fromColumn: number = fromSquare.id % rowAndColValue;

	boardState[fromRow][fromColumn].piece = 'e';

	let toSquare: IPiece = newMove.toSquare;

	let toRow: number = Math.trunc(toSquare.id / rowAndColValue);
	let toColumn: number = toSquare.id % rowAndColValue;

	boardState[toRow][toColumn].piece = fromSquare.piece;
	endTurn();
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
	const rowToCastle = pieceColour === 'w' ? endRowValue : startRowValue;
	const pieceTypes = ['k', 'r'];
	const kingAndRookNewId =
		castlingKingSide === true
			? [CastlingPiecesColStart.KING + CastlingPiecesColOffset.KING_KINGSIDE, CastlingPiecesColStart.ROOK_KINGSIDE + CastlingPiecesColOffset.ROOK_KINGSIDE]
			: [CastlingPiecesColStart.KING + CastlingPiecesColOffset.KING_QUEENSIDE, CastlingPiecesColStart.ROOK_QUEENSIDE + CastlingPiecesColOffset.ROOK_QUEENSIDE];

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
	endTurn();
}

function endTurn() {
	// if(isCheckmate());
	
	totalMoves++;
	
	toggleTurns();
	flipBoard();
}

function isCheckmate() {
	
}

export function commitPawnPromotionToBoard() {
	const move = getPawnPromotionMove();
	const piece = getPawnPromotionPiece().value;

	const { fromSquare, toSquare } = move;
	const fromRow = Math.floor(fromSquare.id / rowAndColValue);
	const fromCol = Math.floor(fromSquare.id % rowAndColValue);
	const toRow = Math.floor(toSquare.id / rowAndColValue);
	const toCol = Math.floor(toSquare.id % rowAndColValue);

	boardState[fromRow][fromCol].piece = 'e';
	boardState[toRow][toCol].piece = piece;
	toggleIsPromotionActive();
	endTurn();
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
	let row: number = Math.trunc(id! / rowAndColValue);
	let column: number = id! % rowAndColValue;

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
