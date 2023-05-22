import { findPieceWithId, findKingOnBoard, getPreviousBoard } from './board';
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

export const hasPieceMoved = new Map<number, boolean>([
	[CastlingPiecesId.WHITE_ROOK_QUEENSIDE, false],
	[CastlingPiecesId.WHITE_ROOK_KINGSIDE, false],
	[CastlingPiecesId.BLACK_ROOK_QUEENSIDE, false],
	[CastlingPiecesId.BLACK_ROOK_KINGSIDE, false],
	[CastlingPiecesId.WHITE_KING, false],
	[CastlingPiecesId.BLACK_KING, false],
]);

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
	const prevBoard = getPreviousBoard();

	const opponentPawn = `${opponentColour}${ChessPiece.PAWN}`;

	//Get starting opponent pawn position based on piece colour
	const opponentCheckSquareId = pieceColour === ChessPiece.WHITE ? toSquare.id - rowAndColValue : toSquare.id + rowAndColValue;

	//Negative one to get correct orientiation. AttackOffset to determine if attacking left or right
	const attackOffset = ((fromSquare.id % rowAndColValue) - (toSquare.id % rowAndColValue)) * -1;
	const attackedPawnId = attackOffset + fromSquare.id;

	//If there is a pawn on the attacked square on current board and there is a pawn from the home square on the previos turn.
	const isEnPassantValid =
		findPieceWithId(attackedPawnId, store.game.board).piece === opponentPawn && findPieceWithId(opponentCheckSquareId, prevBoard)?.piece === opponentPawn;

	if (isEnPassantValid) {
		const attackedPawnRow = Math.floor(attackedPawnId / rowAndColValue);
		const attackedPawnColumn = Math.floor(attackedPawnId % rowAndColValue);
		store.game.board[attackedPawnRow][attackedPawnColumn].piece = ChessPiece.EMPTY;
		return true;
	}

	return false;
}

export function isCastlingValid(pieceColour: string, castlingKingside: boolean) {
	const store = useGameStore();
	const pieces =
		pieceColour === ChessPiece.WHITE
			? [CastlingPiecesId.WHITE_ROOK_QUEENSIDE, CastlingPiecesId.WHITE_ROOK_KINGSIDE, CastlingPiecesId.WHITE_KING]
			: [CastlingPiecesId.BLACK_ROOK_QUEENSIDE, CastlingPiecesId.BLACK_ROOK_KINGSIDE, CastlingPiecesId.BLACK_KING];

	function calcIsRoomToCastle() {
		if (castlingKingside) {
			for (let position = pieces[CastlingPiece.KING] + AdjacentSquareIdOffsets.RIGHT; position < pieces[CastlingPiece.KINGSIDE_ROOK]; position++) {
				const square = findPieceWithId(position, store.game.board);
				if (isKingInCheck(square, pieceColour, store.game.board) || square.piece !== ChessPiece.EMPTY) return false;
			}
			return true;
		} else {
			for (let position = pieces[CastlingPiece.KING] + AdjacentSquareIdOffsets.LEFT; position > pieces[CastlingPiece.QUEENSIDE_ROOK]; position--) {
				const square = findPieceWithId(position, store.game.board);
				if (isKingInCheck(square, pieceColour, store.game.board) || square.piece !== ChessPiece.EMPTY) return false;
			}

			return true;
		}
	}

	const isRoomToCastle = calcIsRoomToCastle();

	if (isKingInCheck(findKingOnBoard(pieceColour, store.game.board), pieceColour, store.game.board)) return false;
	if (hasPieceMoved.get(pieces[CastlingPiece.KING]) || !isRoomToCastle) return false;

	if (castlingKingside) {
		if (hasPieceMoved.get(pieces[CastlingPiece.KINGSIDE_ROOK])) return false;
	} else {
		if (hasPieceMoved.get(pieces[CastlingPiece.QUEENSIDE_ROOK])) return false;
	}

	return true;
}

export function isKingInCheck(kingSquare: IPiece, pieceColour: string, board: IPiece[][]) {
	const store = useGameStore();

	if (store.testing) console.log(`Inside isKingInCheck`);

	const startingId = kingSquare.id;
	const startingRow = Math.floor(startingId / rowAndColValue);
	const startingCol = Math.floor(startingId % rowAndColValue);
	const opponentColour = pieceColour === ChessPiece.WHITE ? ChessPiece.BLACK : ChessPiece.WHITE;

	//Knight
	for (const key in KnightMoveOffsets) {
		const offset = KnightMoveOffsets[key as keyof typeof KnightMoveOffsets];
		const testId = offset + startingId;
		const maxKnightRowOrColDiff = 2;

		let rowDiff = Math.abs(startingRow - Math.floor(testId / rowAndColValue));
		let colDiff = Math.abs(startingCol - Math.floor(testId % rowAndColValue));

		if (rowDiff > maxKnightRowOrColDiff || colDiff > maxKnightRowOrColDiff) break;

		if (testId > startOfBoardId && testId < endOfBoardId) {
			if (findPieceWithId(testId, board).piece === opponentColour + ChessPiece.KNIGHT) {
				// Ensure no out of bounds
				return true;
			}
		}
	}

	//Pawn
	const PawnOffset =
		pieceColour === ChessPiece.WHITE
			? [AdjacentSquareIdOffsets.UP_LEFT, AdjacentSquareIdOffsets.UP_RIGHT]
			: [AdjacentSquareIdOffsets.DOWN_LEFT, AdjacentSquareIdOffsets.DOWN_RIGHT];
	for (const offset of PawnOffset) {
		const testId: number = offset + startingId;
		const kingAndPawnColDiff = Math.floor(testId % rowAndColValue) - Math.floor(startingId % rowAndColValue);
		if (Math.abs(kingAndPawnColDiff) > 1) break;

		if (testId > startOfBoardId && testId < endOfBoardId) {
			if (findPieceWithId(testId, board).piece === opponentColour + ChessPiece.PAWN) {
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
				testPieceType === ChessPiece.ROOK ||
				testPieceType === ChessPiece.KNIGHT ||
				testPieceType === ChessPiece.PAWN ||
				(squaresAway > 1 && testPieceType === ChessPiece.KING) ||
				testPiece[PieceProps.COLOUR] === pieceColour
			)
				break;
			if (squaresAway === 1 && testPiece === opponentColour + ChessPiece.KING) {
				return true;
			}
			if (testPiece === opponentColour + ChessPiece.QUEEN || testPiece === opponentColour + ChessPiece.BLACK) {
				return true;
			}

			testId = startingId + squaresAway++ * offset;
		}
	}

	// Rook && Queen && King
	const Straights = [AdjacentSquareIdOffsets.UP, AdjacentSquareIdOffsets.RIGHT, AdjacentSquareIdOffsets.DOWN, AdjacentSquareIdOffsets.LEFT];

	for (const offset of Straights) {
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
				testPieceType === ChessPiece.KNIGHT ||
				testPieceType === ChessPiece.PAWN ||
				testPiece === opponentColour + ChessPiece.BLACK ||
				(squaresAway > 1 && testPieceType === ChessPiece.KING) ||
				testPiece[PieceProps.COLOUR] === pieceColour
			)
				break;
			if (squaresAway === 1 && testPiece === opponentColour + ChessPiece.KING) {
				return true;
			}
			if (testPiece === opponentColour + ChessPiece.ROOK || testPiece === opponentColour + ChessPiece.QUEEN) {
				return true;
			}

			testId = startingId + squaresAway++ * offset;
		}
	}

	return false;
}

export function isItCheckmate(targetOffsetColour: string) {
	const store = useGameStore();
	const king = findKingOnBoard(targetOffsetColour, store.game.board);

	//Can attacking piece be captured? (draw offsets from that square )
	//If piece can be captured, is king in check after capture? (double attack after discovery type deal)
	//If piece can't be captured,
}

export function piecesToSquare(targetSquare: IPiece, targetColour: string): IPiece[] {
	const squareContainer: IPiece[] = [];

	squareContainer.push(
		...knightsToTargetSquare(targetSquare, targetColour),
		...diagonalToTargetSquare(targetSquare, targetColour),
		...pawnToTargetSquare(targetSquare, targetColour),
		...straightsToTargetSquare(targetSquare, targetColour)
	);

	return squareContainer;
}

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
			const foundSquare = findPieceWithId(testId, store.game.board);
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
			const foundSquare = findPieceWithId(testId, store.game.board);

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

				if (offset === attackOne && findPieceWithId(targetSquare.id, store.game.board).piece[PieceProps.COLOUR] === nonTargetColour) {
					squareContainer.push(foundSquare);
					continue;
				}

				if (offset === attackTwo && findPieceWithId(targetSquare.id, store.game.board).piece[PieceProps.COLOUR] === nonTargetColour) {
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

			const foundSquare = findPieceWithId(testId, store.game.board);

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
				console.log(`Testid: ${testId} SquaresAway: ${squaresAway}`);
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

			const foundSquare = findPieceWithId(testId, store.game.board);

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

export function isKingInCheckAfterMove(move: IMove) {
	const store = useGameStore();
	if (store.testing) console.log(`inside isKingInCheckAfterMove`);
	const pieceColour = move.fromSquare.piece[PieceProps.COLOUR];
	let tempBoard = JSON.parse(JSON.stringify(store.game.board));

	const { fromSquare, toSquare } = move;
	let fromRow: number = Math.trunc(fromSquare.id / rowAndColValue);
	let fromColumn: number = fromSquare.id % rowAndColValue;

	tempBoard[fromRow][fromColumn].piece = ChessPiece.EMPTY;

	let toRow: number = Math.trunc(toSquare.id / rowAndColValue);
	let toColumn: number = toSquare.id % rowAndColValue;

	tempBoard[toRow][toColumn].piece = fromSquare.piece;

	return isKingInCheck(findKingOnBoard(pieceColour, store.game.board), pieceColour, tempBoard);
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
