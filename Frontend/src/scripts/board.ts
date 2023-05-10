import { reactive } from "vue";
import { getSquares } from "./board_setup";
import type { IPiece , Move , moveVoid , npNumber , npVoid , numIPiece } from "./types";
import { Piece }  from "./types";

let boardState: IPiece[][] = reactive([]);
let previousBoardState: IPiece[][] = [];

const boardSize: number = 64; // Could be updated for larger board sizes in future;
export const rowValue: number = Math.sqrt(boardSize);

export const finalRowIndex: number = rowValue - 1;
export const startingRowIndex: number = 0;
export const endOfBoardId: number = boardSize - 1;
export const startOfBoardId: number = 0;

const initPieces: IPiece[] = getSquares();
let totalMoves: number = 0;
let isBoardFlipped: boolean = false;

const setupBoard: npVoid = () => {
    let tempRow: IPiece[] = [];

    for (let row = 0; row < rowValue; row++) {
        for (let column = 0; column < rowValue; column++) {
            tempRow.push(initPieces[row * rowValue + column]);
        }
        boardState[row] = tempRow;
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

const getTotalMoves: npNumber = () => {
    return totalMoves;
};

const flipBoard = () => {
    isBoardFlipped = !isBoardFlipped;
    boardState.push([new Piece(999, "e", 999)]);
    boardState.splice(finalRowIndex + 1);
};

export const getIsBoardFlipped = () => {
    return isBoardFlipped;
}

const commitMoveToBoard: moveVoid = (newMove: Move) => {
    saveLastBoardState();
    let fromSquare: IPiece = newMove.fromSquare;

    let fromRow: number = Math.trunc(fromSquare.id / rowValue);
    let fromColumn: number = fromSquare.id % rowValue;

    boardState[fromRow][fromColumn].piece = "e";

    let toSquare: IPiece = newMove.toSquare;

    let toRow: number = Math.trunc(toSquare.id / rowValue);
    let toColumn: number = toSquare.id % rowValue;

    boardState[toRow][toColumn].piece = fromSquare.piece;
    totalMoves++;
    flipBoard();
};

enum CastlingPiecesColStart {
    ROOK_QUEENSIDE = 0,
    ROOK_KINGSIDE = 7,
    KING = 4,
}

enum CastlingPiecesColOffset {
    ROOK_QUEENSIDE = 3,
    ROOK_KINGSIDE = -2,
    KING_KINGSIDE = 2,
    KING_QUEENSIDE = -2,
}

const commitCastleToBoard = (pieceColour: string, castlingKingSide: boolean) => {
    saveLastBoardState();
    const rowToCastle = pieceColour === "w" ? 7 : 0;
    const pieceTypes = ["k", "r"];
    const kingAndRookNewId =
        castlingKingSide === true
            ? [
                  CastlingPiecesColStart.KING + CastlingPiecesColOffset.KING_KINGSIDE,
                  CastlingPiecesColStart.ROOK_KINGSIDE + CastlingPiecesColOffset.ROOK_KINGSIDE,
              ]
            : [
                  CastlingPiecesColStart.KING + CastlingPiecesColOffset.KING_QUEENSIDE,
                  CastlingPiecesColStart.ROOK_QUEENSIDE + CastlingPiecesColOffset.ROOK_QUEENSIDE,
              ];

    let iteration = 0;
    for (let piece of kingAndRookNewId) {
        boardState[rowToCastle][piece].piece = pieceColour + pieceTypes[iteration++];
    }

    if (castlingKingSide) {
        boardState[rowToCastle][CastlingPiecesColStart.ROOK_KINGSIDE].piece = "e";
    } else {
        boardState[rowToCastle][CastlingPiecesColStart.ROOK_QUEENSIDE].piece = "e";
    }

    boardState[rowToCastle][CastlingPiecesColStart.KING].piece = "e";
    totalMoves++;
    flipBoard();
};

const saveLastBoardState = () => {
    previousBoardState = JSON.parse(JSON.stringify(boardState));
};

const getPreviousBoardState = () => {
    return previousBoardState;
};

const getPreviousBoardStateWrapper = () => {
    if (!previousBoardState[0]) {
        previousBoardState = JSON.parse(JSON.stringify(boardState));
    }
    return getPreviousBoardState();
};

const getSquareWithIdWrapper: numIPiece = (id: number) => {
    if (!boardState[0]) {
        setupBoard();
    }
    return getSquareWithId(id);
};

const getSquareWithId: numIPiece = (id: number) => {
    let row: number = Math.trunc(id! / rowValue);
    let column: number = id! % rowValue;

    return boardState[row][column];
};

const getTestBoard: () => IPiece[][] = () => {
    return JSON.parse(JSON.stringify(boardState));
};

function findPieceById(id: number, board: IPiece[][] = boardState): IPiece {
    if (!board[0]) {
        setupBoard();
    }
    let foundPiece: IPiece | undefined;
    for (const row of board) {
        foundPiece = row.find((piece) => piece.id === id);
        if (foundPiece) {
            break;
        }
    }

    if (id < 0 || id > 63 || !foundPiece) {
        throw new Error(`Piece with id \${id} not found or id is out of bounds`);
    }

    return foundPiece!;
}

function findKing(pieceColour: string, board: IPiece[][] = boardState) {
    const pieceType = "k";
    if (!board[0]) {
        setupBoard();
    }

    let foundPiece: IPiece | undefined;
    for (const row of board) {
        foundPiece = row.find((square) => square.piece === pieceColour + pieceType);
        if (foundPiece) {
            break;
        }
    }

    if (foundPiece === undefined) {
        console.error("A king is missing???");
    }
    return foundPiece!;
}

export {
getPreviousBoardStateWrapper,
setupBoard,
logBoard,
getBoard,
getPieces,
getPieceType,
commitMoveToBoard,
getTestPieceType,
getSquareWithIdWrapper,
findPieceById,
commitCastleToBoard,
getTestBoard,
boardState,
findKing,
getTotalMoves
};
