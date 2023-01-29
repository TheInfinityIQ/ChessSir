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
};

const logBoard: () => void = () => {
    console.log(board);
};

const getBoard: () => IPiece[][] = () => {
    return board;
};

const getPieces: () => IPiece[] = () => {
    if (!board[0]) {
        setupBoard();
    }

    let pieces: IPiece[] = [];

    board.forEach((row) => {
        row.forEach((piece) => {
            pieces.push(piece);
        });
    });

    return pieces;
};

const getPieceType: (id: number) => string = (id: number) => {
    let pieceType = "Invalid ID";

    board.forEach((row) => {
        row.forEach((piece) => {
            if (piece.id == id) {
                pieceType = piece.piece;
            }
        });
    });

    return pieceType;
};

export { setupBoard, logBoard, getBoard, getPieces, getPieceType };
