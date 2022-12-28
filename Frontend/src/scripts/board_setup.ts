import { getInitBoardState } from "@/scripts/init";
const initBoardState: string[][] = getInitBoardState();

let row, column, pieceValue;

const getSquares = () => {
    const squares: { id: number; colour: number; piece: string }[] = [];

    let startLightRow = true;
    for (let count = 0; count < 64; count++) {
        // 8 takes place of the SquareRoot of the square 2d array
        row = Math.trunc(count / 8);
        column = count % 8;

        pieceValue = initBoardState[row][column];

        startLightRow = row % 2 < 1;

        if (startLightRow) {
            squares[count] = { id: count, colour: count % 2, piece: pieceValue };
        } else {
            squares[count] = { id: count, colour: ((count % 2) + 1) % 2, piece: pieceValue };
        }
    }

    return squares;
};

export { getSquares };
