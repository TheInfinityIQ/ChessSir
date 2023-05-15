import {
	getPreviousBoardStateWrapper,
	getTestBoard,
	findPieceWithId,
	findKingOnBoard,
	setupBoard,
} from './board';
import { CastlingPiece } from './moveValidation';
import { CastlingPiecesId, ChessPiece, AdjacentSquareIdOffsets, KnightMoveOffsets, PieceProps, Direction, endOfBoardId, endRowValue, rowAndColValue, startOfBoardId, startRowValue } from './staticValues';
import type { IMove, IPiece, Move } from './types';
import { useGameStore } from './state'

export const hasPieceMoved = new Map<number, boolean>([
	[CastlingPiecesId.WHITE_ROOK_QUEENSIDE, false],
	[CastlingPiecesId.WHITE_ROOK_KINGSIDE, false],
	[CastlingPiecesId.BLACK_ROOK_QUEENSIDE, false],
	[CastlingPiecesId.BLACK_ROOK_KINGSIDE, false],
	[CastlingPiecesId.WHITE_KING, false],
	[CastlingPiecesId.BLACK_KING, false],
]);

export function isValidPawnPromotion(pieceColour: string, toSquare: IPiece, move: IMove) {
	const store = useGameStore();
	const checkedRow = Math.floor(toSquare.id / rowAndColValue);

	if (pieceColour === 'w' ? checkedRow === startRowValue : checkedRow === endRowValue) {
		store.updateMoveToPromote(move);
		store.pawnPromotionColour = pieceColour;
		store.togglePromotion();
	}
}

export function isValidEnPassant(fromSquare: IPiece, toSquare: IPiece, pieceColour: string, opponentColour: string) {
	const store = useGameStore();
	const prevBoard = getPreviousBoardStateWrapper();
	const opponentPawn = `${opponentColour}${ChessPiece.PAWN}`;
	const opponentCheckSquareId = pieceColour === 'w' ? toSquare.id - rowAndColValue : toSquare.id + rowAndColValue;
	//Negative one to get correct orientiation.
	const attackOffset = ((fromSquare.id % rowAndColValue) - (toSquare.id % rowAndColValue)) * -1;
	const attackedPawnId = attackOffset + fromSquare.id;
	const isEnPassantValid = findPieceWithId(attackedPawnId, store.game.board).piece === opponentPawn && findPieceWithId(opponentCheckSquareId, prevBoard)?.piece === opponentPawn;

	if (isEnPassantValid) {
		const attackedPawnRow = Math.floor(attackedPawnId / rowAndColValue);
		const attackedPawnColumn = Math.floor(attackedPawnId % rowAndColValue);
		store.game.board[attackedPawnRow][attackedPawnColumn].piece = 'e';
		return true;
	}

	return false;
}

export function isCastlingValid(pieceColour: string, castlingKingside: boolean) {
	const pieces =
		pieceColour === 'w'
			? [CastlingPiecesId.WHITE_ROOK_QUEENSIDE, CastlingPiecesId.WHITE_ROOK_KINGSIDE, CastlingPiecesId.WHITE_KING]
			: [CastlingPiecesId.BLACK_ROOK_QUEENSIDE, CastlingPiecesId.BLACK_ROOK_KINGSIDE, CastlingPiecesId.BLACK_KING];

	function calcIsRoomToCastle() {
		if (castlingKingside) {
			for (let position = pieces[CastlingPiece.KING] + AdjacentSquareIdOffsets.RIGHT; position < pieces[CastlingPiece.KINGSIDE_ROOK]; position++) {
				const square = findPieceWithId(position);
				if (isKingInCheck(square, pieceColour) || square.piece !== 'e') return false;
			}
			return true;
		} else {
			for (let position = pieces[CastlingPiece.KING] + AdjacentSquareIdOffsets.LEFT; position > pieces[CastlingPiece.QUEENSIDE_ROOK]; position--) {
				const square = findPieceWithId(position);
				if (isKingInCheck(square, pieceColour) || square.piece !== 'e') return false;
			}

			return true;
		}
	}

	const isRoomToCastle = calcIsRoomToCastle();

	if (isKingInCheck(findKingOnBoard(pieceColour), pieceColour)) return false;
	if (hasPieceMoved.get(pieces[CastlingPiece.KING]) || !isRoomToCastle) return false;

	if (castlingKingside) {
		if (hasPieceMoved.get(pieces[CastlingPiece.KINGSIDE_ROOK])) return false;
	} else {
		if (hasPieceMoved.get(pieces[CastlingPiece.QUEENSIDE_ROOK])) return false;
	}

	return true;
}

export function isKingInCheck(kingSquare: IPiece, pieceColour: string, board: IPiece[][] = setupBoard()) {
	const startingId = kingSquare.id;
	const startingRow = Math.floor(startingId / rowAndColValue);
	const startingCol = Math.floor(startingId % rowAndColValue);
	const opponentColour = pieceColour === 'w' ? 'b' : 'w';

	//Knight
	for (const key in KnightMoveOffsets) {
		const offset = KnightMoveOffsets[key as keyof typeof KnightMoveOffsets];
		const testId = offset + startingId;
		const maxKnightRowOrColDiff = 2;

		let rowDiff = Math.abs(startingRow - Math.floor(testId / rowAndColValue));
		let colDiff = Math.abs(startingCol - Math.floor(testId % rowAndColValue));

		if (rowDiff > maxKnightRowOrColDiff || colDiff > maxKnightRowOrColDiff) break;

		if (testId > startOfBoardId && testId < endOfBoardId) {
			if (findPieceWithId(testId).piece === opponentColour + 'n') {
				// Ensure no out of bounds
				return true;
			}
		}
	}

	//Pawn
	const PawnOffset =
		pieceColour === 'w' ? [AdjacentSquareIdOffsets.UP_LEFT, AdjacentSquareIdOffsets.UP_RIGHT] : [AdjacentSquareIdOffsets.DOWN_LEFT, AdjacentSquareIdOffsets.DOWN_RIGHT];
	for (const offset of PawnOffset) {
		const testId: number = offset + startingId;
		const kingAndPawnColDiff = Math.floor(testId % rowAndColValue) - Math.floor(startingId % rowAndColValue);
		if (Math.abs(kingAndPawnColDiff) > 1) break;

		if (testId > startOfBoardId && testId < endOfBoardId) {
			if (findPieceWithId(testId, board).piece === opponentColour + 'p') {
				return true;
			}
		}
	}

	// Bishop and Queen and King
	const Diagonal = [AdjacentSquareIdOffsets.DOWN_LEFT, AdjacentSquareIdOffsets.DOWN_RIGHT, AdjacentSquareIdOffsets.UP_LEFT, AdjacentSquareIdOffsets.UP_RIGHT];

	for (const offset of Diagonal) {
		let squaresAway: number = 1;
		let testId: number = offset + startingId;
		let rowDiff = 0;
		let colDiff = 0;

		while (testId > startOfBoardId && testId < endOfBoardId) {
			rowDiff = Math.abs(startingRow - Math.floor(testId / rowAndColValue));
			colDiff = Math.abs(startingCol - Math.floor(testId % rowAndColValue));
			/*
                Avoids Ids increments and loops around to other side of board. Example, checking horizontal on row 0 and current Id is 7, then we add AdjacentSquareIdOffsets.UP_LEFT.
            */
			if (rowDiff > squaresAway || colDiff > squaresAway) break;

			const testPiece = findPieceWithId(testId, board).piece;
			const testPieceType = testPiece[PieceProps.TYPE];
			//Pieces to Ignore
			if (
				testPieceType === 'r' ||
				testPieceType === 'n' ||
				testPieceType === 'p' ||
				(squaresAway > 1 && testPieceType === 'k') ||
				testPiece[PieceProps.COLOUR] === pieceColour
			)
				break;
			if (squaresAway === 1 && testPiece === opponentColour + 'k') {
				return true;
			}
			if (testPiece === opponentColour + 'q' || testPiece === opponentColour + 'b') {
				return true;
			}

			testId = startingId + squaresAway++ * offset;
		}
	}

	// Rook && Queen && King
	const Straigts = [AdjacentSquareIdOffsets.UP, AdjacentSquareIdOffsets.RIGHT, AdjacentSquareIdOffsets.DOWN, AdjacentSquareIdOffsets.LEFT];

	for (const offset of Straigts) {
		let squaresAway: number = 1;
		let testId: number = offset + startingId;
		let rowDiff = 0;
		let colDiff = 0;

		while (testId > startOfBoardId && testId < endOfBoardId) {
			const testPiece = findPieceWithId(testId, board).piece;
			const testPieceType = testPiece[PieceProps.TYPE];
			rowDiff = Math.abs(startingRow - Math.floor(testId / rowAndColValue));
			colDiff = Math.abs(startingCol - Math.floor(testId % rowAndColValue));
			if (rowDiff > squaresAway || colDiff > squaresAway) break;
			//Pieces to Ignore
			if (
				testPieceType === 'n' ||
				testPieceType === 'p' ||
				testPiece === opponentColour + 'b' ||
				(squaresAway > 1 && testPieceType === 'k') ||
				testPiece[PieceProps.COLOUR] === pieceColour
			)
				break;
			if (squaresAway === 1 && testPiece === opponentColour + 'k') {
				return true;
			}
			if (testPiece === opponentColour + 'r' || testPiece === opponentColour + 'q') {
				return true;
			}

			testId = startingId + squaresAway++ * offset;
		}
	}

	return false;
}

export function isKingInCheckAfterMove(move: IMove) {
	const pieceColour = move.fromSquare.piece[PieceProps.COLOUR];
	let tempBoard = getTestBoard();

	const { fromSquare, toSquare } = move;
	let fromRow: number = Math.trunc(fromSquare.id / rowAndColValue);
	let fromColumn: number = fromSquare.id % rowAndColValue;

	tempBoard[fromRow][fromColumn].piece = 'e';

	let toRow: number = Math.trunc(toSquare.id / rowAndColValue);
	let toColumn: number = toSquare.id % rowAndColValue;

	tempBoard[toRow][toColumn].piece = fromSquare.piece;

	return isKingInCheck(findKingOnBoard(pieceColour, tempBoard), pieceColour, tempBoard);
}

export function getChessPieceFromLetter(letter: string): ChessPiece | undefined {
	for (const key in ChessPiece) {
		if (ChessPiece[key as keyof typeof ChessPiece] === letter) {
			return ChessPiece[key as keyof typeof ChessPiece];
		}
	}
	return undefined;
}

export function isMoreThanOneSquare(move: IMove) {
	const fromSquare = move.fromSquare;
	const toSquare = move.toSquare;

	const rowDifference = Math.abs(Math.floor(fromSquare.id / rowAndColValue) - Math.floor(toSquare.id / rowAndColValue));
	const colDifference = Math.abs((fromSquare.id % rowAndColValue) - (toSquare.id % rowAndColValue));

	// Check if the move is more than one square away
	if (rowDifference > 1 || colDifference > 1) {
		return true;
	}

	return false;
}

export function determineDirection(move: Move) {
	const fromSquare = move.fromSquare;
	const toSquare = move.toSquare;

	//Determine if straight line
	const rowDifference = Math.abs(Math.floor(fromSquare.id / rowAndColValue) - Math.floor(toSquare.id / rowAndColValue));
	const colDifference = Math.abs((fromSquare.id % rowAndColValue) - (toSquare.id % rowAndColValue));

	const isDiagonalMove = rowDifference === colDifference;
	const isVerticalMove = rowDifference > startOfBoardId && colDifference === startOfBoardId;
	const isHorizontalMove = rowDifference === startOfBoardId && colDifference > startOfBoardId; // determines if both fromSquare and toSquare are in same row

	if (isDiagonalMove) {
		return Direction.DIAGONAL;
	}

	if (isVerticalMove) {
		return Direction.VERTICAL;
	}

	if (isHorizontalMove) {
		return Direction.HORIZONTAL;
	}

	return;
}

export function isJumpingPiece(move: IMove) {
	const d = determineDirection(move);

	if (d === Direction.DIAGONAL) {
		return jumpingPieceOnDiagonal(move);
	}

	if (d === Direction.VERTICAL) {
		return jumpingPieceOnStraight(move, Direction.VERTICAL);
	}

	if (d === Direction.HORIZONTAL) {
		return jumpingPieceOnStraight(move, Direction.HORIZONTAL);
	}

	// Will only happen if illegal move. Can me moved over to a new function using the log if (!(isDiagonalMove || isVerticalMove || isHorizontalMove)) return true;
	return true;
}

export function jumpingPieceOnDiagonal(move: Move) {
	const fromSquare = move.fromSquare;
	const toSquare = move.toSquare;

	let startId = Math.min(fromSquare.id, toSquare.id);
	let endId = Math.max(fromSquare.id, toSquare.id);

	const rowDiff = Math.abs(Math.floor(fromSquare.id / rowAndColValue) - Math.floor(toSquare.id / rowAndColValue));
	const colDiff = Math.abs((fromSquare.id % rowAndColValue) - (toSquare.id % rowAndColValue));

	if (rowDiff !== colDiff) {
		// The move is not diagonal
		return false;
	}

	let step = rowDiff === colDiff ? 9 : 7;

	// Check if the move is up and left or down and right
	if (
		(fromSquare.id < toSquare.id && fromSquare.id % rowAndColValue > toSquare.id % rowAndColValue) ||
		(fromSquare.id > toSquare.id && fromSquare.id % rowAndColValue < toSquare.id % rowAndColValue)
	) {
		step = 7;
	}

	// Start checking from the next square in the direction of the move
	startId += step;

	for (let id = startId; id < endId; id += step) {
		const square = findPieceWithId(id);
		if (square.piece !== 'e') {
			return true;
		}
	}

	return false;
}

export function jumpingPieceOnStraight(move: IMove, direction: Direction) {
	const fromSquare = move.fromSquare;
	const toSquare = move.toSquare;

	let startId = Math.min(fromSquare.id, toSquare.id);
	let endId = Math.max(fromSquare.id, toSquare.id);
	let step;

	if (direction === Direction.HORIZONTAL) {
		step = 1;
	} else {
		step = rowAndColValue;
	}

	// Start checking from the next square in the direction of the move
	startId += step;

	for (let id = startId; id < endId; id += step) {
		const square = findPieceWithId(id);
		if (square.piece !== 'e') {
			return true;
		}
	}

	return false;
}

export function isFriendlyPiece(friendlyColour: string, toSquareId: number) {
	const toPiece: string = findPieceWithId(toSquareId).piece;

	if (toPiece === 'e') return false;

	return toPiece[startOfBoardId] === friendlyColour;
}
