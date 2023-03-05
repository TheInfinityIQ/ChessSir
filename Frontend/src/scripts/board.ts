import { reactive } from "vue";
import { getSquares, getTestSquares } from "./board_setup";
import type { IPiece, npVoid } from "./types";

let board: IPiece[][] = [];
let boardState = reactive({ board });

const boardSize: number = 64; // Could be updated for larger board sizes in future;
const root: number = Math.sqrt(boardSize);
const initPieces: IPiece[] = getSquares();

const setupBoard: npVoid = () => {
    let tempRow: IPiece[] = [];

    for (let row = 0; row < root; row++) {
        for (let column = 0; column < root; column++) {
            tempRow.push(initPieces[row * root + column]);
        }
        board.push(tempRow);
        tempRow = [];
    }

    boardState.board = board;
};

const logBoard: npVoid = () => {
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

const getTestPieceType: (id: number) => string = (id: number) => {
    let pieceType = "Invalid ID";

    boardState.board.forEach((row) => {
        row.forEach((piece) => {
            if (piece.id == id) {
                pieceType = piece.piece;
            }
        });
    });

    return pieceType;
};


export { setupBoard, logBoard, getBoard, getPieces, getPieceType, boardState, getTestPieceType };
