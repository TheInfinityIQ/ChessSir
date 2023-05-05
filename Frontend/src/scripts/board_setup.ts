import { Piece, type IPiece } from "./types";

const getInitBoardState = () => {
    return [
        ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
        ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
        ["e", "e", "e", "e", "e", "e", "e", "e"],
        ["e", "e", "e", "e", "e", "e", "e", "e"],
        ["e", "e", "e", "e", "e", "e", "e", "e"],
        ["e", "e", "e", "e", "e", "e", "e", "e"],
        ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
        ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"],
    ];
};

const initBoardState: string[][] = getInitBoardState();
let row: number, column: number, pieceValue: string;

const getSquares: () => IPiece[] = () => {
    const squares: IPiece[] = [];

    for (let count = 0; count < 64; count++) {
        row = Math.floor(count / 8);
        column = count % 8;

        pieceValue = initBoardState[row][column];

        const isLightSquare = (row % 2 === 0) === (column % 2 === 0);

        squares[count] = new Piece (count, pieceValue, isLightSquare ? 0 : 1);
    }

    return squares;
};

export { getSquares, getInitBoardState };
