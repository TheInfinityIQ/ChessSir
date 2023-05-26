import { useGameStore } from "./state";
import { rowAndColValue, initBoard, startRowValue, endOfBoardId, startOfBoardId } from "./staticValues";
import { Piece, type IPiece } from "./types";

export function getSquares() {
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

export function getPieceType(id: number) {
	const store = useGameStore();
	let pieceType = 'Invalid ID';

	store.game.board.forEach((row: IPiece[]) => {
		row.forEach((piece: IPiece) => {
			if (piece.id == id) {
				pieceType = piece.piece;
			}
		});
	});

	return pieceType;
}



export function getSquareWithId(id: number) {
	const store = useGameStore();
	let row: number = Math.trunc(id! / rowAndColValue);
	let column: number = id! % rowAndColValue;

	return store.game.board[row][column];
}


export function findPieceWithId(id: number, board: IPiece[][]): IPiece {
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

export function findKingOnBoard(pieceColour: string, board: IPiece[][]) {
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
