import { findPieceWithId, findKingOnBoard } from './boardUtilities';
import { hasPieceMoved, piecesToSquare } from './moveUtilities';
import { CastlingPiece } from './moveValidation';
import { useGameStore } from './state';
import { rowAndColValue, PieceProps, ChessPiece, startRowValue, endRowValue, CastlingPiecesId, AdjacentSquareIdOffsets } from './staticValues';
import type { IMove, IPiece } from './types';

export function isValidPawnPromotion(move: IMove) {
	const store = useGameStore();

	const checkedRow = Math.floor(move.toSquare.id / rowAndColValue);

	if (move.fromSquare.piece[PieceProps.COLOUR] === ChessPiece.WHITE ? checkedRow === startRowValue : checkedRow === endRowValue) {
		store.updateMoveToPromote(move);
		store.specialContainer.pieceToPromote = move.fromSquare;
		store.togglePromotion();
	}
}

export function isValidEnPassant(fromSquare: IPiece, toSquare: IPiece, pieceColour: string, opponentColour: string) {
	const store = useGameStore();

	const opponentPawn = `${opponentColour}${ChessPiece.PAWN}`;

	//Get starting opponent pawn position based on piece colour
	const opponentCheckSquareId = pieceColour === ChessPiece.WHITE ? toSquare.id - rowAndColValue : toSquare.id + rowAndColValue;

	//Negative one to get correct orientation. AttackOffset to determine if attacking left or right
	const attackOffset = ((fromSquare.id % rowAndColValue) - (toSquare.id % rowAndColValue)) * -1;
	const attackedPawnId = attackOffset + fromSquare.id;

	//If there is a pawn on the attacked square on current board and there is a pawn from the home square on the previous turn.
	const isEnPassantValid =
		findPieceWithId(attackedPawnId, store.game.board).piece === opponentPawn && findPieceWithId(opponentCheckSquareId, store.getPreviousBoard())?.piece === opponentPawn;

	if (isEnPassantValid) {
		const attackedPawnRow = Math.floor(attackedPawnId / rowAndColValue);
		const attackedPawnColumn = Math.floor(attackedPawnId % rowAndColValue);
		store.game.board[attackedPawnRow][attackedPawnColumn].piece = ChessPiece.EMPTY;
		return true;
	}

	return false;
}

export function isCastlingValid(kingColour: string, castlingKingside: boolean) {
	const store = useGameStore();
	const pieces =
		kingColour === ChessPiece.WHITE
			? [CastlingPiecesId.WHITE_ROOK_QUEENSIDE, CastlingPiecesId.WHITE_ROOK_KINGSIDE, CastlingPiecesId.WHITE_KING]
			: [CastlingPiecesId.BLACK_ROOK_QUEENSIDE, CastlingPiecesId.BLACK_ROOK_KINGSIDE, CastlingPiecesId.BLACK_KING];

	function calcIsRoomToCastle() {
		if (castlingKingside) {
			for (let position = pieces[CastlingPiece.KING] + AdjacentSquareIdOffsets.RIGHT; position < pieces[CastlingPiece.KINGSIDE_ROOK]; position++) {
				const square = findPieceWithId(position, store.game.board);
				if (isKingInCheck(square, store.game.board, kingColour) || square.piece !== ChessPiece.EMPTY) return false;
			}
			return true;
		} else {
			for (let position = pieces[CastlingPiece.KING] + AdjacentSquareIdOffsets.LEFT; position > pieces[CastlingPiece.QUEENSIDE_ROOK]; position--) {
				const square = findPieceWithId(position, store.game.board);
				if (isKingInCheck(square, store.game.board, kingColour) || square.piece !== ChessPiece.EMPTY) return false;
			}

			return true;
		}
	}

	const isRoomToCastle = calcIsRoomToCastle();

	if (isKingInCheck(findKingOnBoard(kingColour, store.game.board), store.game.board, kingColour)) return false;
	if (hasPieceMoved.get(pieces[CastlingPiece.KING]) || !isRoomToCastle) return false;

	if (castlingKingside) {
		if (hasPieceMoved.get(pieces[CastlingPiece.KINGSIDE_ROOK])) return false;
	} else {
		if (hasPieceMoved.get(pieces[CastlingPiece.QUEENSIDE_ROOK])) return false;
	}

	return true;
}

export function isKingInCheck(toSquare: IPiece, board: IPiece[][], kingColour: string) {
	const opponentColour = kingColour === ChessPiece.WHITE ? ChessPiece.BLACK : ChessPiece.WHITE;

	const pieces: IPiece[] = piecesToSquare(toSquare, opponentColour, board);
	if (pieces.length > 0) return true;
	return false;
}

export function isKingInCheckAfterMove(move: IMove) {
	const store = useGameStore();

	const kingColour = move.fromSquare.piece[PieceProps.COLOUR];
	let tempBoard = JSON.parse(JSON.stringify(store.game.board));

	const { fromSquare, toSquare } = move;
	let fromRow: number = Math.trunc(fromSquare.id / rowAndColValue);
	let fromColumn: number = fromSquare.id % rowAndColValue;

	tempBoard[fromRow][fromColumn].piece = ChessPiece.EMPTY;

	let toRow: number = Math.trunc(toSquare.id / rowAndColValue);
	let toColumn: number = toSquare.id % rowAndColValue;

	tempBoard[toRow][toColumn].piece = fromSquare.piece;

	return isKingInCheck(findKingOnBoard(kingColour, store.game.board), tempBoard, kingColour);
}
