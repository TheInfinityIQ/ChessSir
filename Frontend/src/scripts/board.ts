import { reactive } from "vue";
import { getSquares } from "./board_setup";
import type { IPiece, Move, moveVoid, npVoid, numIPiece } from "./types";

let boardState: IPiece[][] = reactive([]);

const boardSize: number = 64; // Could be updated for larger board sizes in future;
const root: number = Math.sqrt(boardSize);
const initPieces: IPiece[] = getSquares();

const setupBoard: npVoid = () => {
    let tempRow: IPiece[] = [];

    for (let row = 0; row < root; row++) {
        for (let column = 0; column < root; column++) {
            tempRow.push(initPieces[row * root + column]);
        }
        boardState.push(tempRow);
        tempRow = [];
    }
};

const logBoard: npVoid = () => {
    console.log(boardState);
};

const getBoard = () => {
    return [];
};

const getPieces: () => IPiece[] = () => {
    if (!boardState[0]) {
        setupBoard();
    }

    let pieces: IPiece[] = [];

    boardState.forEach((row) => {
        row.forEach((piece) => {
            pieces.push(piece);
        });
    });

    return pieces;
};

const getPieceType: (id: number) => string = (id: number) => {
    let pieceType = "Invalid ID";

    boardState.forEach((row) => {
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

    boardState.forEach((row) => {
        row.forEach((piece) => {
            if (piece.id == id) {
                pieceType = piece.piece;
            }
        });
    });

    return pieceType;
};

const commitMoveToBoard: moveVoid = (newMove: Move) => {
    // console.log(boardState.board);
    let fromSquare: IPiece = newMove.fromSquare;
    if ((fromSquare.piece == "e")) {
        console.log("here");
        return;
    }    

    let fromRow: number = Math.trunc(fromSquare.id / 8);
    let fromColumn: number = fromSquare.id % 8;

    boardState[fromRow][fromColumn].piece = "e";
    // console.log(boardState);

    let toSquare: IPiece = newMove.toSquare;

    let toRow: number = Math.trunc(toSquare.id / 8);
    let toColumn: number = toSquare.id % 8;
    
    boardState[toRow][toColumn].piece = fromSquare.piece;

    //
    // console.log(boardState);
};

const getPieceWithId: numIPiece = (id: number) => {
    let row: number = Math.trunc(id! / 8);
    let column: number = id! % 8;

    return boardState[row][column].piece;
};

export { setupBoard, logBoard, getBoard, getPieces, getPieceType, commitMoveToBoard, getTestPieceType, getPieceWithId };
export { boardState };
