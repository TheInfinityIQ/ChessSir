import { getSquares } from "./board_setup";
import type { IPiece } from "./types";

let board: IPiece[][] = [];

const boardSize: number = 64; // Could be updated for larger board sizes in future;
const root: number = Math.sqrt(boardSize);
const initPieces: IPiece[] = getSquares();

const setupBoard: () => void = () => {
    let tempRow: IPiece[] = [];

    for (let row = 0; row < root; row++) {
        for (let column = 0; column < root; column++) {
            tempRow.push(initPieces[row * root + column]);
        }
        board.push(tempRow);
        tempRow = [];
    }

    console.log(board);
};

const logBoard: () => void = () => {
    console.log(board);
};

const getBoard: () => IPiece[][] = () => {
    return board;
}

const getPieces: () => IPiece[] = () => {
    if (!board[0]) {
        setupBoard();
    }
    
    let pieces: IPiece[] = [];
    
    board.forEach(row => {
        row.forEach(piece => {
            pieces.push(piece);
        })
    });

    return pieces;
}

export { setupBoard, logBoard, getBoard, getPieces };
