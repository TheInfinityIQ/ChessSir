import { Piece, type IPiece, type Move, type IMove } from './types';
import { CastlingPiecesColStart, CastlingPiecesColOffset, endRowValue, rowAndColValue, startRowValue } from './staticValues';
import { useGameStore } from './state';
import { endTurn } from './game';
import { getSquares } from './boardUtilities';

//TODO: REMOVE WHEN DONE TESTING
export function toggleFlipBoard() {
	const store = useGameStore();
	store.testToggleFlipBoard = store.testToggleFlipBoard;
}

function commitMoveToBoard(newMove: Move): void {
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

function commitCastleToBoard(pieceColour: string, castlingKingSide: boolean): void {
	const store = useGameStore();
	store.savePreviousBoard(store.game.board);
	const rowToCastle: number = pieceColour === 'w' ? endRowValue : startRowValue;
	const pieceTypes: string[] = ['k', 'r'];
	const kingAndRookNewId: number[] =
		castlingKingSide === true
			? [CastlingPiecesColStart.KING + CastlingPiecesColOffset.KING_KINGSIDE, CastlingPiecesColStart.ROOK_KINGSIDE + CastlingPiecesColOffset.ROOK_KINGSIDE]
			: [CastlingPiecesColStart.KING + CastlingPiecesColOffset.KING_QUEENSIDE, CastlingPiecesColStart.ROOK_QUEENSIDE + CastlingPiecesColOffset.ROOK_QUEENSIDE];

	let iteration: number = 0;
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

export function commitPawnPromotionToBoard(move: IMove): void {
	const store = useGameStore();
	store.savePreviousBoard(store.game.board);

	const { fromSquare, toSquare }: IMove = move;
	const fromRow: number = Math.floor(fromSquare.id / rowAndColValue);
	const fromCol: number = Math.floor(fromSquare.id % rowAndColValue);
	const toRow: number = Math.floor(toSquare.id / rowAndColValue);
	const toCol: number = Math.floor(toSquare.id % rowAndColValue);

	store.game.board[fromRow][fromCol].piece = 'e';
	store.game.board[toRow][toCol].piece = store.specialContainer.pieceToPromote.piece;
	store.togglePromotion();
	endTurn();
}

export function setupBoard(): IPiece[][] {
	let board: IPiece[][] = [];
	let tempRow: IPiece[] = [];

	for (let row = startRowValue; row < rowAndColValue; row++) {
		for (let column = 0; column < rowAndColValue; column++) {
			const tempPiece: IPiece = getSquares()[row * rowAndColValue + column];
			tempRow.push(new Piece(tempPiece.id, tempPiece.piece, tempPiece.colour));
		}
		board[row] = tempRow;
		tempRow = [];
	}

	return board;
}

export function flipBoard(): void {
	const store = useGameStore();
	if (!store.testToggleFlipBoard) {
		return;
	}
	store.isBoardFlipped = !store.isBoardFlipped;
}

export { commitMoveToBoard, commitCastleToBoard };
