import { commitCastleToBoard, commitMoveToBoard } from './board';
import {
	determineDirection,
	getChessPieceFromLetter,
	hasPieceMoved,
	isCastlingValid,
	isFriendlyPiece,
	isJumpingPiece,
	isKingInCheck,
	isKingInCheckAfterMove,
	isMoreThanOneSquare,
	isValidEnPassant,
	isValidPawnPromotion,
} from './moveUtilities';
import { CastlingPiecesId, ChessPiece, Direction, KnightMoveOffsets, PieceProps, endOfBoardId, rowAndColValue, startOfBoardId } from './staticValues';
import { type IPiece, type IMove, Move, type moveBool } from './types';
import { useGameStore } from './state'

export enum CastlingPiece {
	QUEENSIDE_ROOK = 0,
	KINGSIDE_ROOK = 1,
	KING = 2,
}

export const moveValidators: Map<ChessPiece, moveBool> = new Map([
	[ChessPiece.PAWN, validPawnMove],
	[ChessPiece.ROOK, validRookMove],
	[ChessPiece.KNIGHT, validKnightMove],
	[ChessPiece.BISHOP, validBishopMove],
	[ChessPiece.KING, validKingMove],
	[ChessPiece.QUEEN, validQueenMove],
]);

export function makeMove(newSquare: IPiece) {
	const store = useGameStore();
	if ((!newSquare.id && newSquare.id != startOfBoardId) || newSquare.colour === undefined || newSquare.piece === undefined) {
		console.error(`Error in makeMove. One of the values below are undefined or falsy\n
        newSquare.id ${newSquare.id}\n
        newSquare.colour ${newSquare.colour}\n
        newSquare.piece ${newSquare.piece}`);
		return;
	}

	let move: IMove = new Move(store.selectedPiece, newSquare);

	if (!validMove(move)) return;
	if (store.isPromotionActive) return;

	commitMoveToBoard(move);
}

function validMove(move: IMove) {
	const store = useGameStore();
	//Call corresponding piece type to validate a move for that piece
	const pieceType: string = move.fromSquare.piece[PieceProps.TYPE];
	const pieceColour: string = move.fromSquare.piece[PieceProps.COLOUR];
	const piece: ChessPiece | undefined = getChessPieceFromLetter(pieceType);

	if (store.isWhitesTurn && pieceColour === 'b') return false;
	if (!store.isWhitesTurn && pieceColour === 'w') return false;

	// if piece or moveValidators.get(piece) is falsy, then return () => false
	const validator: moveBool = piece ? moveValidators.get(piece) ?? (() => false) : () => false;

	if (move.fromSquare.piece[PieceProps.TYPE] !== 'k' && store.totalMoves > startOfBoardId) {
		if (isKingInCheckAfterMove(move)) return false;
	}
	return validator(move);
}

function validPawnMove(move: IMove) {
	const { fromSquare, toSquare } = move;
	const pieceColour = fromSquare.piece[PieceProps.COLOUR];
	const opponentColour = pieceColour === 'w' ? 'b' : 'w';
	const dir = determineDirection(move);

	const idDiff = fromSquare.id - toSquare.id;
	const isDirectionCorrect = pieceColour === 'w' ? idDiff > startOfBoardId : idDiff < startOfBoardId;
	if (!isDirectionCorrect) return false;

	const fromRowId = Math.floor(fromSquare.id / rowAndColValue);
	const isStartingSquare = pieceColour === 'w' ? fromRowId === 6 : fromRowId === 1;
	const rowDiff = Math.abs(fromRowId - Math.floor(toSquare.id / rowAndColValue));
	if ((rowDiff === 2 && !isStartingSquare) || rowDiff > 2) return false;
	if (rowDiff === 2 && dir === Direction.DIAGONAL) return false;

	const isVerticalMove = dir === Direction.VERTICAL && toSquare.piece === 'e';
	const isDiagonalMove = dir === Direction.DIAGONAL && !isFriendlyPiece(fromSquare.piece[startOfBoardId], toSquare.id);

	if (!isVerticalMove && !isDiagonalMove) return false;

	if (isDiagonalMove && toSquare.piece === 'e') {
		if (!isValidEnPassant(fromSquare, toSquare, pieceColour, opponentColour)) return false;
	}

	isValidPawnPromotion(pieceColour, toSquare, move);

	return !isJumpingPiece(move);
}

function validRookMove(move: IMove) {
	const fromSquare = move.fromSquare;
	const toSquare = move.toSquare;

	if (isJumpingPiece(move) || determineDirection(move) === Direction.DIAGONAL || isFriendlyPiece(fromSquare.piece[startOfBoardId], toSquare.id)) {
		return false;
	}

	const rookStartingIds = [
		CastlingPiecesId.BLACK_ROOK_KINGSIDE,
		CastlingPiecesId.BLACK_ROOK_QUEENSIDE,
		CastlingPiecesId.WHITE_ROOK_QUEENSIDE,
		CastlingPiecesId.WHITE_ROOK_KINGSIDE,
	];
	const foundRook = rookStartingIds.some((id) => id === fromSquare.id);
	if (foundRook) {
		hasPieceMoved.set(fromSquare.id, true);
	}

	return true;
}

function validKnightMove(move: IMove) {
	const fromSquare = move.fromSquare;
	const toSquare = move.toSquare;

	const pieceColour = fromSquare.piece[startOfBoardId];

	const validIdsMods = [
		KnightMoveOffsets.UP_LEFT,
		KnightMoveOffsets.UP_RIGHT,
		KnightMoveOffsets.DOWN_LEFT,
		KnightMoveOffsets.DOWN_RIGHT,
		KnightMoveOffsets.LEFT_UP,
		KnightMoveOffsets.LEFT_DOWN,
		KnightMoveOffsets.RIGHT_UP,
		KnightMoveOffsets.RIGHT_DOWN,
	];

	const validIDs: number[] = [];

	validIdsMods.forEach((value: number) => {
		let modId = value + fromSquare.id;
		const lessThanUpBound = value + fromSquare.id < endOfBoardId;
		const moreThanlowBound = value + fromSquare.id > startOfBoardId;
		const notFriendlyPiece = !isFriendlyPiece(pieceColour, toSquare.id);

		if (lessThanUpBound && moreThanlowBound && notFriendlyPiece) {
			validIDs.push(modId);
		}
	});

	const result = validIDs.some((id) => id === toSquare.id);

	return result;
}

function validBishopMove(move: IMove) {
	const fromSquare = move.fromSquare;
	const toSquare = move.toSquare;

	return !(
		isJumpingPiece(move) ||
		determineDirection(move) === Direction.HORIZONTAL ||
		determineDirection(move) === Direction.VERTICAL ||
		determineDirection(move) !== Direction.DIAGONAL ||
		isFriendlyPiece(fromSquare.piece[startOfBoardId], toSquare.id)
	);
}

function validKingMove(move: IMove) {
	const fromSquare = move.fromSquare;
	const pieceColour = fromSquare.piece[PieceProps.COLOUR];
	const toSquare = move.toSquare;
	const castlingKingside = toSquare.id - fromSquare.id > startOfBoardId ? true : false;

	const colDiff = Math.floor(fromSquare.id % rowAndColValue) - Math.floor(toSquare.id % rowAndColValue);
	const rowDiff = Math.floor(fromSquare.id / rowAndColValue) - Math.floor(toSquare.id / rowAndColValue);

	if (isKingInCheck(toSquare, pieceColour)) return false;

	if (Math.abs(colDiff) === 2 && rowDiff === 0 && isCastlingValid(pieceColour, castlingKingside)) {
		commitCastleToBoard(pieceColour, castlingKingside);
	}

	if (!validQueenMove(move) || isMoreThanOneSquare(move)) return false;

	//Updates to prevent castling
	pieceColour === 'w' ? hasPieceMoved.set(CastlingPiecesId.WHITE_KING, true) : hasPieceMoved.set(CastlingPiecesId.BLACK_KING, true);
	return true;
}

function validQueenMove(move: IMove) {
	const fromSquare = move.fromSquare;
	const toSquare = move.toSquare;

	if (determineDirection(move) !== Direction.DIAGONAL && determineDirection(move) !== Direction.HORIZONTAL && determineDirection(move) !== Direction.VERTICAL) {
		return false; // Not a valid queen move
	}

	return !(isJumpingPiece(move) || isFriendlyPiece(fromSquare.piece[startOfBoardId], toSquare.id));
}
