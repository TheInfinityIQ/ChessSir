import { Piece, type IPiece } from './types';
import { initBoardState } from './staticValues'

let row: number, column: number, pieceValue: string;

function getSquares() {
	const squares: IPiece[] = [];

	for (let count = 0; count < 64; count++) {
		row = Math.floor(count / 8);
		column = count % 8;

		pieceValue = initBoardState[row][column];

		const isLightSquare = (row % 2 === 0) === (column % 2 === 0);

		squares[count] = new Piece(count, pieceValue, isLightSquare ? 0 : 1);
	}

	return squares;
}

export { getSquares };
