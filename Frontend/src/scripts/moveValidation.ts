import { commitCastleToBoard, commitMoveToBoard } from './board';
import { determineDirectionType, hasPieceMoved, isFriendlyPiece, isJumpingPiece, isMoreThanOneSquare } from './moveUtilities';
import { CastlingPiecesId, ChessPiece, Direction, KnightMoveOffsets, PieceProps, endOfBoardId, rowAndColValue, startOfBoardId } from './staticValues';
import { type IPiece, type IMove, Move, type moveBool } from './types';
import { useGameStore } from './state';
import { isKingInCheckAfterMove, isValidEnPassant, isValidPawnPromotion, isCastlingValid } from './specialPieceRules';

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

export function makeMove(newSquare: IPiece): void {
	const store = useGameStore();

	if ((!newSquare.id && newSquare.id != 0) || newSquare.colour === undefined || newSquare.piece === undefined) {
		console.error(`Error in makeMove. One of the values below are undefined or falsy\n
        newSquare.id ${newSquare.id}\n
        newSquare.colour ${newSquare.colour}\n
        newSquare.piece ${newSquare.piece}`);
		return;
	}

	let move: IMove = new Move(store.specialContainer.selectedPiece, newSquare);

	if (!isValidMove(move)) return;
	if (store.isPromotionActive) return;

	commitMoveToBoard(move);
}

function isValidMove(move: IMove): boolean {
	const store = useGameStore();
	//Call corresponding piece type to validate a move for that piece
	const pieceType: string = move.fromSquare.piece[PieceProps.TYPE];
	const pieceColour: string = move.fromSquare.piece[PieceProps.COLOUR];

	if (store.isWhitesTurn && pieceColour === ChessPiece.BLACK) return false;
	if (!store.isWhitesTurn && pieceColour === ChessPiece.WHITE) return false;

	//Get correct validation function if it exists or get anonymous function that returns false.
	const validator: moveBool = (pieceType as ChessPiece) ? moveValidators.get(pieceType as ChessPiece) ?? (() => false) : () => false;

	return validator(move);
}

function validPawnMove(move: IMove): boolean {
	const { fromSquare, toSquare }: IMove = move;
	const pieceColour: string = fromSquare.piece[PieceProps.COLOUR];
	const opponentColour: string = pieceColour === ChessPiece.WHITE ? ChessPiece.BLACK : ChessPiece.WHITE;

	const dir: string | undefined = determineDirectionType(move);

	const idDiff: number = fromSquare.id - toSquare.id;
	const isDirectionCorrect: boolean = pieceColour === ChessPiece.WHITE ? idDiff > startOfBoardId : idDiff < startOfBoardId;

	if (!isDirectionCorrect) return false;

	const fromRowId: number = Math.floor(fromSquare.id / rowAndColValue);
	const isStartingSquare: boolean = pieceColour === ChessPiece.WHITE ? fromRowId === 6 : fromRowId === 1;
	const rowDiff: number = Math.abs(fromRowId - Math.floor(toSquare.id / rowAndColValue));

	if ((rowDiff === 2 && !isStartingSquare) || rowDiff > 2) return false;
	if (rowDiff === 2 && dir === Direction.DIAGONAL) return false;

	const isVerticalMove: boolean = dir === Direction.VERTICAL && toSquare.piece === ChessPiece.EMPTY;
	const isDiagonalMove: boolean = dir === Direction.DIAGONAL && !isFriendlyPiece(fromSquare.piece[startOfBoardId], toSquare.id);

	if (!isVerticalMove && !isDiagonalMove) return false;

	if (isDiagonalMove && toSquare.piece === ChessPiece.EMPTY) {
		if (!isValidEnPassant(fromSquare, toSquare, pieceColour, opponentColour)) return false;
	}

	isValidPawnPromotion(move);

	return !isJumpingPiece(move);
}

function validRookMove(move: IMove): boolean {
	const fromSquare: IPiece = move.fromSquare;
	const toSquare: IPiece = move.toSquare;

	if (isJumpingPiece(move) || determineDirectionType(move) === Direction.DIAGONAL || isFriendlyPiece(fromSquare.piece[startOfBoardId], toSquare.id)) {
		return false;
	}

	// TODO: move into validKingMove because these are castling tests
	const rookStartingIds = [
		CastlingPiecesId.BLACK_ROOK_KINGSIDE,
		CastlingPiecesId.BLACK_ROOK_QUEENSIDE,
		CastlingPiecesId.WHITE_ROOK_QUEENSIDE,
		CastlingPiecesId.WHITE_ROOK_KINGSIDE,
	];
	const foundRook: boolean = rookStartingIds.some((id) => id === fromSquare.id);
	if (foundRook) {
		hasPieceMoved.set(fromSquare.id, true);
	}

	if (isKingInCheckAfterMove(move)) return false;

	return true;
}

function validKnightMove(move: IMove): boolean {
	const fromSquare: IPiece = move.fromSquare;
	const toSquare: IPiece = move.toSquare;

	const pieceColour: string = fromSquare.piece[startOfBoardId];

	const validIdsOffsets: number[] = [
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

	//Get all possible moves
	validIdsOffsets.forEach((value: number) => {
		let offsetId: number = value + fromSquare.id;
		const lessThanUpBound: boolean = value + fromSquare.id < endOfBoardId;
		const moreThanLowBound: boolean = value + fromSquare.id > startOfBoardId;
		const notFriendlyPiece: boolean = !isFriendlyPiece(pieceColour, toSquare.id);

		if (lessThanUpBound && moreThanLowBound && notFriendlyPiece) {
			validIDs.push(offsetId);
		}
	});

	const result: boolean = validIDs.some((id) => id === toSquare.id);

	if (isKingInCheckAfterMove(move)) return false;

	return result;
}

function validBishopMove(move: IMove): boolean {
	const fromSquare: IPiece = move.fromSquare;
	const toSquare: IPiece = move.toSquare;

	if (isKingInCheckAfterMove(move)) return false;

	return !(
		isJumpingPiece(move) ||
		determineDirectionType(move) === Direction.HORIZONTAL ||
		determineDirectionType(move) === Direction.VERTICAL ||
		determineDirectionType(move) !== Direction.DIAGONAL ||
		isFriendlyPiece(fromSquare.piece[startOfBoardId], toSquare.id)
	);
}

export function validKingMove(move: IMove): boolean {
	const fromSquare: IPiece = move.fromSquare;
	const toSquare: IPiece = move.toSquare;
	const kingColour: string = fromSquare.piece[PieceProps.COLOUR];
	const castlingKingside: boolean = toSquare.id - fromSquare.id > startOfBoardId ? true : false;

	const colDiff: number = Math.floor(fromSquare.id % rowAndColValue) - Math.floor(toSquare.id % rowAndColValue);
	const rowDiff: number = Math.floor(fromSquare.id / rowAndColValue) - Math.floor(toSquare.id / rowAndColValue);

	if (Math.abs(colDiff) === 2 && rowDiff === 0 && isCastlingValid(kingColour, castlingKingside)) {
		commitCastleToBoard(kingColour, castlingKingside);
	}

	if (!validQueenMove(move) || isMoreThanOneSquare(move)) return false;

	if (isKingInCheckAfterMove(move)) return false;

	return true;
}

function validQueenMove(move: IMove): boolean {
	const fromSquare: IPiece = move.fromSquare;
	const toSquare: IPiece = move.toSquare;

	if (determineDirectionType(move) !== Direction.DIAGONAL && determineDirectionType(move) !== Direction.HORIZONTAL && determineDirectionType(move) !== Direction.VERTICAL) {
		return false; // Not a valid queen move
	}

	if (isKingInCheckAfterMove(move)) return false;

	return !(isJumpingPiece(move) || isFriendlyPiece(fromSquare.piece[startOfBoardId], toSquare.id));
}
