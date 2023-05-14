import { computed, ref } from 'vue';
import {
	boardState,
	commitCastleToBoard,
	commitMoveToBoard,
	endOfBoardId,
	endRowValue,
	findKing,
	findPieceById,
	getPreviousBoardStateWrapper,
	getSquareWithIdWrapper,
	getTestBoard,
	getTotalMoves,
	rowAndColValue,
	startOfBoardId,
	startRowValue,
} from './board';
import { getIsPromotionActive, getIsWhitesTurn, selectedIPiece, setPawnPromotionColour, setPawnPromotionMove, toggleIsPromotionActive, toggleTurns } from './state';
import { type IPiece, type IMove, Move, type moveBool } from './types';

const isModalActive = getIsPromotionActive();

export enum CastlingPiecesId {
	WHITE_ROOK_QUEENSIDE = 56,
	WHITE_ROOK_KINGSIDE = 63,
	BLACK_ROOK_QUEENSIDE = 0,
	BLACK_ROOK_KINGSIDE = 7,
	WHITE_KING = 60,
	BLACK_KING = 4,
}

export enum CastlingPiece {
	QUEENSIDE_ROOK = 0,
	KINGSIDE_ROOK = 1,
	KING = 2,
}

export enum KnightMoveOffsets {
	UP_LEFT = -17,
	UP_RIGHT = -15,
	DOWN_LEFT = 15,
	DOWN_RIGHT = 17,
	LEFT_UP = -10,
	LEFT_DOWN = 6,
	RIGHT_UP = -6,
	RIGHT_DOWN = 10,
}

export enum AdjacentSquareIdOffsets {
	UP = -8,
	UP_RIGHT = -7,
	UP_LEFT = -9,
	RIGHT = 1,
	LEFT = -1,
	DOWN = 8,
	DOWN_RIGHT = 9,
	DOWN_LEFT = 7,
}

export enum ChessPiece {
	PAWN = 'p',
	ROOK = 'r',
	KNIGHT = 'n',
	BISHOP = 'b',
	KING = 'k',
	QUEEN = 'q',
}

export enum Direction {
	VERTICAL = 'v',
	HORIZONTAL = 'h',
	DIAGONAL = 'D',
}

export enum PieceProps {
	COLOUR = 0,
	TYPE = 1,
}

export const hasPieceMoved = new Map<number, boolean>([
	[CastlingPiecesId.WHITE_ROOK_QUEENSIDE, false],
	[CastlingPiecesId.WHITE_ROOK_KINGSIDE, false],
	[CastlingPiecesId.BLACK_ROOK_QUEENSIDE, false],
	[CastlingPiecesId.BLACK_ROOK_KINGSIDE, false],
	[CastlingPiecesId.WHITE_KING, false],
	[CastlingPiecesId.BLACK_KING, false],
]);

export const moveValidators: Map<ChessPiece, moveBool> = new Map([
	[ChessPiece.PAWN, validPawnMove],
	[ChessPiece.ROOK, validRookMove],
	[ChessPiece.KNIGHT, validKnightMove],
	[ChessPiece.BISHOP, validBishopMove],
	[ChessPiece.KING, validKingMove],
	[ChessPiece.QUEEN, validQueenMove],
]);

// Value modifying functions
// --------------------

export function makeMove(newSquare: IPiece) {
	if ((!newSquare.id && newSquare.id != startOfBoardId) || newSquare.colour === undefined || newSquare.piece === undefined) {
		console.error(`Error in makeMove. One of the values below are undefined or falsy\n
        newSquare.id ${newSquare.id}\n
        newSquare.colour ${newSquare.colour}\n
        newSquare.piece ${newSquare.piece}`);
		return;
	}

	let move: IMove = new Move(selectedIPiece(), newSquare);

	if (!validMove(move)) return;
	if (isModalActive.value) return;

	commitMoveToBoard(move);
}

function validMove(move: IMove) {
	//Call corresponding piece type to validate a move for that piece
	const pieceType: string = move.fromSquare.piece[PieceProps.TYPE];
	const pieceColour: string = move.fromSquare.piece[PieceProps.COLOUR];
	const piece: ChessPiece | undefined = getChessPieceFromLetter(pieceType);

	if (getIsWhitesTurn() && pieceColour === 'b') return false;
	if (!getIsWhitesTurn() && pieceColour === 'w') return false;

	// if piece or moveValidators.get(piece) is falsy, then return () => false
	const validator: moveBool = piece ? moveValidators.get(piece) ?? (() => false) : () => false;

	if (move.fromSquare.piece[PieceProps.TYPE] !== 'k' && getTotalMoves() > startOfBoardId) {
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

function isValidPawnPromotion(pieceColour: string, toSquare: IPiece, move: IMove) {
	const checkedRow = Math.floor(toSquare.id / rowAndColValue);

	if (pieceColour === 'w' ? checkedRow === startRowValue : checkedRow === endRowValue) {
		setPawnPromotionMove(move);
		setPawnPromotionColour(pieceColour);
		toggleIsPromotionActive();
	}
}

function isValidEnPassant(fromSquare: IPiece, toSquare: IPiece, pieceColour: string, opponentColour: string) {
	const prevBoard = getPreviousBoardStateWrapper();
	const opponentPawn = `${opponentColour}${ChessPiece.PAWN}`;
	const opponentCheckSquareId = pieceColour === 'w' ? toSquare.id - rowAndColValue : toSquare.id + rowAndColValue;
	//Negative one to get correct orientiation.
	const attackOffset = ((fromSquare.id % rowAndColValue) - (toSquare.id % rowAndColValue)) * -1;
	const attackedPawnId = attackOffset + fromSquare.id;
	const isEnPassantValid = getSquareWithIdWrapper(attackedPawnId).piece === opponentPawn && findPieceById(opponentCheckSquareId, prevBoard)?.piece === opponentPawn;

	if (isEnPassantValid) {
		const attackedPawnRow = Math.floor(attackedPawnId / rowAndColValue);
		const attackedPawnColumn = Math.floor(attackedPawnId % rowAndColValue);
		boardState[attackedPawnRow][attackedPawnColumn].piece = 'e';
		return true;
	}

	return false;
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
	console.log('King is Not In check');

	console.log(`Is Col Diff two: ${Math.abs(colDiff) === 2}, is rowDiff 0: ${rowDiff === 0}, is CastlingValid: ${isCastlingValid(pieceColour, castlingKingside)}`);
	if (Math.abs(colDiff) === 2 && rowDiff === 0 && isCastlingValid(pieceColour, castlingKingside)) {
		commitCastleToBoard(pieceColour, castlingKingside);
		toggleTurns();
	}

	if (!validQueenMove(move) || isMoreThanOneSquare(move)) return false;

	//Updates to prevent castling
	pieceColour === 'w' ? hasPieceMoved.set(CastlingPiecesId.WHITE_KING, true) : hasPieceMoved.set(CastlingPiecesId.BLACK_KING, true);
	return true;
}

function isCastlingValid(pieceColour: string, castlingKingside: boolean) {
	const pieces =
		pieceColour === 'w'
			? [CastlingPiecesId.WHITE_ROOK_QUEENSIDE, CastlingPiecesId.WHITE_ROOK_KINGSIDE, CastlingPiecesId.WHITE_KING]
			: [CastlingPiecesId.BLACK_ROOK_QUEENSIDE, CastlingPiecesId.BLACK_ROOK_KINGSIDE, CastlingPiecesId.BLACK_KING];

	console.log(`pieceColour when castling is ${pieceColour}.`);

	function calcIsRoomToCastle() {
		if (castlingKingside) {
			for (let position = pieces[CastlingPiece.KING] + AdjacentSquareIdOffsets.RIGHT; position < pieces[CastlingPiece.KINGSIDE_ROOK]; position++) {
				const square = getSquareWithIdWrapper(position);
				if (isKingInCheck(square, pieceColour) || square.piece !== 'e') return false;
			}
			return true;
		} else {
			console.log(`Position: ${pieces[CastlingPiece.KING] + AdjacentSquareIdOffsets.LEFT}\nPiece: ${pieces[CastlingPiece.QUEENSIDE_ROOK]}`);
			for (let position = pieces[CastlingPiece.KING] + AdjacentSquareIdOffsets.LEFT; position > pieces[CastlingPiece.QUEENSIDE_ROOK]; position--) {
				const square = getSquareWithIdWrapper(position);
				console.log(`Not Empty Square: ${square.piece !== 'e'}, King is in Check ${isKingInCheck(square, pieceColour)}`);
				if (isKingInCheck(square, pieceColour) || square.piece !== 'e') return false;
			}

			console.log('Castling Is Valid');

			return true;
		}
	}

	const isRoomToCastle = calcIsRoomToCastle();
	console.log(`RoomToCastle: ${isRoomToCastle}`);

	if (isKingInCheck(findKing(pieceColour), pieceColour)) return false;
	if (hasPieceMoved.get(pieces[CastlingPiece.KING]) || !isRoomToCastle) return false;

	if (castlingKingside) {
		if (hasPieceMoved.get(pieces[CastlingPiece.KINGSIDE_ROOK])) return false;
	} else {
		if (hasPieceMoved.get(pieces[CastlingPiece.QUEENSIDE_ROOK])) return false;
	}

	return true;
}

function isKingInCheck(kingSquare: IPiece, pieceColour: string, board: IPiece[][] = boardState) {
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
			if (findPieceById(testId).piece === opponentColour + 'n') {
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
			if (findPieceById(testId, board).piece === opponentColour + 'p') {
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

			const testPiece = findPieceById(testId, board).piece;
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
			const testPiece = findPieceById(testId, board).piece;
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

function validQueenMove(move: IMove) {
	const fromSquare = move.fromSquare;
	const toSquare = move.toSquare;

	if (determineDirection(move) !== Direction.DIAGONAL && determineDirection(move) !== Direction.HORIZONTAL && determineDirection(move) !== Direction.VERTICAL) {
		return false; // Not a valid queen move
	}

	return !(isJumpingPiece(move) || isFriendlyPiece(fromSquare.piece[startOfBoardId], toSquare.id));
}

function isKingInCheckAfterMove(move: IMove) {
	const pieceColour = move.fromSquare.piece[PieceProps.COLOUR];
	let tempBoard = getTestBoard();

	const { fromSquare, toSquare } = move;
	let fromRow: number = Math.trunc(fromSquare.id / rowAndColValue);
	let fromColumn: number = fromSquare.id % rowAndColValue;

	tempBoard[fromRow][fromColumn].piece = 'e';

	let toRow: number = Math.trunc(toSquare.id / rowAndColValue);
	let toColumn: number = toSquare.id % rowAndColValue;

	tempBoard[toRow][toColumn].piece = fromSquare.piece;

	return isKingInCheck(findKing(pieceColour, tempBoard), pieceColour, tempBoard);
}

function getChessPieceFromLetter(letter: string): ChessPiece | undefined {
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

function determineDirection(move: Move) {
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

function isJumpingPiece(move: IMove) {
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

function jumpingPieceOnDiagonal(move: Move) {
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
		const square = getSquareWithIdWrapper(id);
		if (square.piece !== 'e') {
			return true;
		}
	}

	return false;
}

function jumpingPieceOnStraight(move: Move, direction: Direction) {
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
		const square = getSquareWithIdWrapper(id);
		if (square.piece !== 'e') {
			return true;
		}
	}

	return false;
}

function isFriendlyPiece(friendlyColour: string, toSquareId: number) {
	const toPiece: string = getSquareWithIdWrapper(toSquareId).piece;

	if (toPiece === 'e') return false;

	return toPiece[startOfBoardId] === friendlyColour;
}
