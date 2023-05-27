import { flipBoard } from './board';
import { findKingOnBoard, findPieceWithId, isIdWithinBounds } from './boardUtilities';
import { getPathOfSquaresToPiece, piecesToSquare } from './moveUtilities';
import { moveValidators, validKingMove } from './moveValidation';
import { isKingInCheck } from './specialPieceRules';
import { useGameStore } from './state';
import { AdjacentSquareIdOffsets, ChessPiece, PieceProps } from './staticValues';
import { type IPiece, Move, type IMove, type moveBool } from './types';

export function endTurn() {
	const store = useGameStore();

	store.totalMoves++;

	// const opponentKingColour = store.specialContainer.selectedPiece.piece[PieceProps.COLOUR] === ChessPiece.WHITE ? ChessPiece.BLACK : ChessPiece.WHITE;
	// isItCheckmate(opponentKingColour);

	store.toggleTurns();
	store.unselectPiece();
	flipBoard();
}

export function isItCheckmate(kingColour: string): boolean {
	const store = useGameStore();

	const kingSquare = findKingOnBoard(kingColour, store.game.board);
	const isInCheck = isKingInCheck(kingSquare, store.game.board);

	if (!isInCheck) return false;
	if (canKingMove(kingSquare)) return false;
	if (canPiecePreventCheckmate(kingSquare)) return false;

	return true;
}

function canKingMove(kingSquare: IPiece): boolean {
	const store = useGameStore();

	let result = false;

	const emptySquares = getPossibleKingMoves(kingSquare.piece[PieceProps.COLOUR], store.game.board);
	console.log('empty squares');
	console.log(emptySquares);

	for (let checkedSquare = 0; checkedSquare < emptySquares.length; checkedSquare++) {
		const emptySquare = emptySquares[checkedSquare];

		if (validKingMove(new Move(kingSquare, emptySquare))) result = true;
	}

	console.log(`Can King Move: ${result}`);
	return result;
}

function getPossibleKingMoves(kingColour: string, board: IPiece[][]): IPiece[] {
	const opponentColour = kingColour === ChessPiece.WHITE ? ChessPiece.BLACK : ChessPiece.WHITE;
	const kingSquare = findKingOnBoard(kingColour, board);

	const offsets = [
		AdjacentSquareIdOffsets.DOWN,
		AdjacentSquareIdOffsets.DOWN_LEFT,
		AdjacentSquareIdOffsets.DOWN_RIGHT,
		AdjacentSquareIdOffsets.LEFT,
		AdjacentSquareIdOffsets.RIGHT,
		AdjacentSquareIdOffsets.UP,
		AdjacentSquareIdOffsets.UP_LEFT,
		AdjacentSquareIdOffsets.UP_RIGHT,
	];

	const emptySquares: IPiece[] = [];

	offsets.forEach((id) => {
		const testId = kingSquare.id + id;

		if (isIdWithinBounds(testId)) {
			const foundSquare = findPieceWithId(testId, board);
			if (foundSquare.piece === ChessPiece.EMPTY || foundSquare.piece[PieceProps.COLOUR] === opponentColour) emptySquares.push(foundSquare);
		}
	});

	return emptySquares;
}

function canPiecePreventCheckmate(kingSquare: IPiece): boolean {
	const store = useGameStore();

	let result: boolean = false;

	const opponentColour: string = kingSquare.piece[PieceProps.COLOUR] === ChessPiece.WHITE ? ChessPiece.BLACK : ChessPiece.WHITE;
	const squaresPuttingKingInCheck: IPiece[] = piecesToSquare(kingSquare, opponentColour, store.game.board);
	const potentialPreventingCheckmateMoves: IMove[] = [];

	//Get potential moves that will prevent checkMate
	squaresPuttingKingInCheck.forEach((attackSquare) => {
		const path = getPathOfSquaresToPiece(kingSquare, attackSquare, true);
		path.forEach((squareOnPath) => {
			const friendlyPiecesToSquare = piecesToSquare(squareOnPath, kingSquare.piece[PieceProps.COLOUR], store.game.board);
			friendlyPiecesToSquare.forEach((friendlyPiece) => {
				potentialPreventingCheckmateMoves.push(new Move(friendlyPiece, squareOnPath));
			});
		});
	});

	potentialPreventingCheckmateMoves.forEach((move: IMove) => {
		//Get correct validation function if it exists or get anonymous function that returns false.
		const pieceToValidate: ChessPiece = move.fromSquare.piece[PieceProps.TYPE] as ChessPiece;
		const validator: moveBool = pieceToValidate ? moveValidators.get(pieceToValidate) ?? (() => false) : () => false;
		//Can be modified to return potential saving moves for a 'training wheel mode' to beginners
		if (validator(move)) result = true;
	});

	console.log(`Can piece prevent checkmate: ${result}`);
	return result;
}
