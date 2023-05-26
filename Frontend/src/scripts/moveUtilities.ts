import { CastlingPiece } from './moveValidation';
import {
	CastlingPiecesId,
	ChessPiece,
	AdjacentSquareIdOffsets,
	KnightMoveOffsets,
	PieceProps,
	Direction,
	endOfBoardId,
	endRowValue,
	rowAndColValue,
	startOfBoardId,
	startRowValue,
	PawnValues,
} from './staticValues';
import { Move, type IMove, type IPiece, Piece } from './types';
import { useGameStore } from './state';
import { findPieceWithId } from './boardUtilities';

//TODO: ADD TO STATE
export const hasPieceMoved = new Map<number, boolean>([
	[CastlingPiecesId.WHITE_ROOK_QUEENSIDE, false],
	[CastlingPiecesId.WHITE_ROOK_KINGSIDE, false],
	[CastlingPiecesId.BLACK_ROOK_QUEENSIDE, false],
	[CastlingPiecesId.BLACK_ROOK_KINGSIDE, false],
	[CastlingPiecesId.WHITE_KING, false],
	[CastlingPiecesId.BLACK_KING, false],
]);

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
	const store = useGameStore();
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
		const square = findPieceWithId(id, store.game.board);
		if (square.piece !== ChessPiece.EMPTY) {
			return true;
		}
	}

	return false;
}

export function jumpingPieceOnStraight(move: IMove, direction: Direction) {
	const store = useGameStore();
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
		const square = findPieceWithId(id, store.game.board);
		if (square.piece !== ChessPiece.EMPTY) {
			return true;
		}
	}

	return false;
}

export function isFriendlyPiece(friendlyColour: string, toSquareId: number) {
	const store = useGameStore();
	const toPiece: string = findPieceWithId(toSquareId, store.game.board).piece;

	if (toPiece === ChessPiece.EMPTY) return false;

	return toPiece[PieceProps.COLOUR] === friendlyColour;
}

export function getChessPieceFromLetter(letter: string): ChessPiece | undefined {
	for (const key in ChessPiece) {
		if (ChessPiece[key as keyof typeof ChessPiece] === letter) {
			return ChessPiece[key as keyof typeof ChessPiece];
		}
	}
	return undefined;
}

export function piecesToSquare(targetSquare: IPiece, targetColour: string, board: IPiece[][]): IPiece[] {
	const squareContainer: IPiece[] = [];

	squareContainer.push(
		...knightsToTargetSquare(targetSquare, targetColour),
		...diagonalToTargetSquare(targetSquare, targetColour),
		...pawnToTargetSquare(targetSquare, targetColour),
		...straightsToTargetSquare(targetSquare, targetColour)
	);

	return squareContainer;

	function knightsToTargetSquare(targetSquare: IPiece, targetColour: string) {
		const store = useGameStore();
		const squareContainer: IPiece[] = [];
	
		const startingRow = Math.floor(targetSquare.id / rowAndColValue);
		const startingCol = Math.floor(targetSquare.id % rowAndColValue);
	
		for (const key in KnightMoveOffsets) {
			const offset = KnightMoveOffsets[key as keyof typeof KnightMoveOffsets];
			const testId = offset + targetSquare.id;
			const maxKnightRowOrColDiff = 2;
	
			let rowDiff = Math.abs(startingRow - Math.floor(testId / rowAndColValue));
			let colDiff = Math.abs(startingCol - Math.floor(testId % rowAndColValue));
	
			if (rowDiff > maxKnightRowOrColDiff || colDiff > maxKnightRowOrColDiff) continue;
	
			if (testId > startOfBoardId && testId < endOfBoardId) {
				const foundSquare = findPieceWithId(testId, board);
				if (foundSquare.piece === targetColour + ChessPiece.KNIGHT) {
					squareContainer.push(foundSquare);
				}
			}
		}
	
		return squareContainer;
	}
	
	function pawnToTargetSquare(targetSquare: IPiece, targetColour: string) {
		const store = useGameStore();
	
		const squareContainer: IPiece[] = [];
		const targetCol = targetSquare.id % rowAndColValue;
	
		const nonTargetColour = targetColour === ChessPiece.WHITE ? ChessPiece.BLACK : ChessPiece.WHITE;
	
		//Pawn
		const PawnOffset =
			targetColour === ChessPiece.WHITE
				? [AdjacentSquareIdOffsets.DOWN_LEFT, AdjacentSquareIdOffsets.DOWN_RIGHT, AdjacentSquareIdOffsets.DOWN, PawnValues.DOWN_DOUBLE_MOVE_OFFSET, AdjacentSquareIdOffsets.NO_OFFSET]
				: [AdjacentSquareIdOffsets.UP_LEFT, AdjacentSquareIdOffsets.UP_RIGHT, AdjacentSquareIdOffsets.UP, PawnValues.UP_DOUBLE_MOVE_OFFSET, AdjacentSquareIdOffsets.NO_OFFSET];
	
		const pawnStartRow = targetColour === ChessPiece.WHITE ? PawnValues.WHITE_PAWN_START : PawnValues.BLACK_PAWN_START;
		const doubleMove = targetColour === ChessPiece.WHITE ? PawnValues.DOWN_DOUBLE_MOVE_OFFSET : PawnValues.UP_DOUBLE_MOVE_OFFSET;
		const singleMove = targetColour === ChessPiece.WHITE ? AdjacentSquareIdOffsets.DOWN : AdjacentSquareIdOffsets.UP;
		const attackOne = targetColour === ChessPiece.WHITE ? AdjacentSquareIdOffsets.DOWN_LEFT : AdjacentSquareIdOffsets.UP_LEFT;
		const attackTwo = targetColour === ChessPiece.WHITE ? AdjacentSquareIdOffsets.DOWN_RIGHT : AdjacentSquareIdOffsets.UP_RIGHT;
	
		for (const offset of PawnOffset) {
			const testId: number = offset + targetSquare.id;
	
			if (testId > startOfBoardId && testId < endOfBoardId) {
				const foundSquare = findPieceWithId(testId, board);
	
				const colDiff = Math.abs(targetCol - (testId % rowAndColValue));
	
				if (foundSquare.piece === targetColour + ChessPiece.PAWN) {
					//Avoids it from increasing offset that will make it jump from various sides of the board instead of drawing line.
					if (colDiff > 1) continue;
	
					//If pawn can use special first move to block.
					if (offset === doubleMove) {
						if (Math.floor(testId / rowAndColValue) === pawnStartRow && !isJumpingPiece(new Move(targetSquare, foundSquare))) squareContainer.push(foundSquare);
						continue;
					}
	
					//If pawn can capture on target square
					if (offset === singleMove) {
						squareContainer.push(foundSquare);
						continue;
					}
	
					if (offset === attackOne && findPieceWithId(targetSquare.id, board).piece[PieceProps.COLOUR] === nonTargetColour) {
						squareContainer.push(foundSquare);
						continue;
					}
	
					if (offset === attackTwo && findPieceWithId(targetSquare.id, board).piece[PieceProps.COLOUR] === nonTargetColour) {
						squareContainer.push(foundSquare);
						continue;
					}
				}
			}
		}
	
		return squareContainer;
	}
	
	function diagonalToTargetSquare(targetSquare: IPiece, targetColour: string) {
		const store = useGameStore();
	
		const nonTargetColour = targetColour === ChessPiece.WHITE ? ChessPiece.BLACK : ChessPiece.WHITE;
		const squareContainer: IPiece[] = [];
	
		const Diagonal = [AdjacentSquareIdOffsets.DOWN_LEFT, AdjacentSquareIdOffsets.DOWN_RIGHT, AdjacentSquareIdOffsets.UP_LEFT, AdjacentSquareIdOffsets.UP_RIGHT];
	
		const startingRow = Math.floor(targetSquare.id / rowAndColValue);
		const startingCol = Math.floor(targetSquare.id % rowAndColValue);
	
		for (const offset of Diagonal) {
			let squaresAway: number = 1;
			let testId: number = offset + targetSquare.id;
	
			while (testId >= startOfBoardId && testId <= endOfBoardId) {
				const rowDiff = Math.abs(startingRow - Math.floor(testId / rowAndColValue));
				const colDiff = Math.abs(startingCol - (testId % rowAndColValue));
	
				//Avoids it from increasing offset that will make it jump from various sides of the board instead of drawing line.
				if (rowDiff > squaresAway || colDiff > squaresAway) break;
	
				const foundSquare = findPieceWithId(testId, board);
	
				//Pieces to Ignore
				if (
					foundSquare.piece[PieceProps.TYPE] === ChessPiece.ROOK ||
					foundSquare.piece[PieceProps.TYPE] === ChessPiece.KNIGHT ||
					foundSquare.piece[PieceProps.TYPE] === ChessPiece.PAWN ||
					foundSquare.piece[PieceProps.COLOUR] === nonTargetColour
				)
					break;
				//Pieces to test
				if (foundSquare.piece === targetColour + ChessPiece.QUEEN || foundSquare.piece === targetColour + ChessPiece.BISHOP) {
					squareContainer.push(foundSquare);
				}
	
				squaresAway++;
				testId = targetSquare.id + squaresAway * offset;
			}
		}
	
		return squareContainer;
	}
	
	function straightsToTargetSquare(targetSquare: IPiece, targetColour: string) {
		const store = useGameStore();
	
		const nonTargetColour = targetColour === ChessPiece.WHITE ? ChessPiece.BLACK : ChessPiece.WHITE;
		const squareContainer: IPiece[] = [];
	
		const Straights = [AdjacentSquareIdOffsets.UP, AdjacentSquareIdOffsets.RIGHT, AdjacentSquareIdOffsets.DOWN, AdjacentSquareIdOffsets.LEFT];
	
		const startingRow = Math.floor(targetSquare.id / rowAndColValue);
		const startingCol = Math.floor(targetSquare.id % rowAndColValue);
	
		for (const offset of Straights) {
			let squaresAway: number = 1;
			let testId: number = offset + targetSquare.id;
	
			while (testId >= startOfBoardId && testId <= endOfBoardId) {
				const rowDiff = Math.abs(startingRow - Math.floor(testId / rowAndColValue));
				const colDiff = Math.abs(startingCol - (testId % rowAndColValue));
	
				//Avoids it from increasing offset that will make it jump from various sides of the board instead of drawing line.
				if (rowDiff > squaresAway || colDiff > squaresAway) break;
	
				const foundSquare = findPieceWithId(testId, board);
	
				//Pieces to Ignore
				if (
					foundSquare.piece[PieceProps.TYPE] === ChessPiece.KNIGHT ||
					foundSquare.piece[PieceProps.TYPE] === ChessPiece.PAWN ||
					foundSquare.piece[PieceProps.TYPE] === ChessPiece.BISHOP ||
					foundSquare.piece[PieceProps.COLOUR] === nonTargetColour
				) {
					break;
				}
				//Pieces that attack on straights
				if (foundSquare.piece === targetColour + ChessPiece.ROOK || foundSquare.piece === targetColour + ChessPiece.QUEEN) {
					squareContainer.push(foundSquare);
				}
	
				squaresAway++;
				testId = targetSquare.id + squaresAway * offset;
			}
		}
	
		return squareContainer;
	}
}
