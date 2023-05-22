import { reactive, ref, type Ref } from 'vue';
import { Piece, type IPiece, type Move, type IMove } from './types';
import { CastlingPiecesColStart, CastlingPiecesColOffset, initBoard, endOfBoardId, endRowValue, rowAndColValue, startOfBoardId, startRowValue } from './staticValues';
import { useGameStore } from './state';

let previousBoard: IPiece[][] = [];

const testToggleFlipBoard: Ref<boolean> = ref(false);
export function toggleFlipBoard() {
	testToggleFlipBoard.value = !testToggleFlipBoard.value;
}
export function getToggleFlipBoard() {
	return testToggleFlipBoard;
}
let isBoardFlipped: Ref<boolean> = ref(false);

function getPieceType(id: number) {
	const store = useGameStore();
	let pieceType = 'Invalid ID';

	store.game.board.forEach((row) => {
		row.forEach((piece) => {
			if (piece.id == id) {
				pieceType = piece.piece;
			}
		});
	});

	return pieceType;
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
	if (!testToggleFlipBoard.value) {
		return;
	}
	isBoardFlipped.value = !isBoardFlipped.value;
}

export function getIsBoardFlipped() {
	return isBoardFlipped;
}

function getSquares() {
	const squares: IPiece[] = [];
	let row: number, column: number, piece: string;

	for (let count = 0; count < 64; count++) {
		row = Math.floor(count / rowAndColValue);
		column = count % rowAndColValue;

		piece = initBoard[row][column];

		const isLightSquare = (row % 2 === 0) === (column % 2 === 0);

		squares[count] = new Piece(count, piece, isLightSquare ? 0 : 1);
	}

	return squares;
}

function commitMoveToBoard(newMove: Move) {
	saveLastBoardState();
	const store = useGameStore();
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
	saveLastBoardState();
	const store = useGameStore();
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

function endTurn() {
	const store = useGameStore();

	store.totalMoves++;

	store.toggleTurns();
	flipBoard();
	store.unselectPiece();
}

export function commitPawnPromotionToBoard(move: IMove) {
	saveLastBoardState();
	const store = useGameStore();

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

function saveLastBoardState() {
	const store = useGameStore();
	previousBoard = JSON.parse(JSON.stringify(store.game.board));
}

export function getPreviousBoard() {
	return previousBoard;
}

export function getSquareWithId(id: number) {
	const store = useGameStore();
	let row: number = Math.trunc(id! / rowAndColValue);
	let column: number = id! % rowAndColValue;

	return store.game.board[row][column];
}

function findPieceWithId(id: number, board: IPiece[][]): IPiece {
	let foundPiece: IPiece | undefined;

	for (const row of board) {
		foundPiece = row.find((piece) => piece.id === id);
		if (foundPiece) {
			break;
		}
	}

	if (id < startOfBoardId || id > endOfBoardId || !foundPiece) {
		console.log(foundPiece);
		throw new Error(`Piece with id ${id} not found or id is out of bounds. Found piece `);
	}

	return foundPiece!;
}

function findKingOnBoard(pieceColour: string, board: IPiece[][]) {
	const store = useGameStore();
	
	const pieceType = 'k';

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

export { getPieceType, commitMoveToBoard, findPieceWithId, commitCastleToBoard, findKingOnBoard };
