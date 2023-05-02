import { reactive } from "vue";
import { getSquares } from "./board_setup";
import type { IPiece, Move, moveVoid, npVoid, numIPiece } from "./types";

let boardState: IPiece[][] = reactive([]);
let previousBoardState: IPiece[][] = [];

const boardSize: number = 64; // Could be updated for larger board sizes in future;
const root: number = Math.sqrt(boardSize);
const initPieces: IPiece[] = getSquares();

const setupBoard: npVoid = () => {
    let tempRow: IPiece[] = [];

    for (let row = 0; row < root; row++) {
        for (let column = 0; column < root; column++) {
            tempRow.push(initPieces[row * root + column]);
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

const commitMoveToBoard: moveVoid = (newMove: Move) => {
    // console.log(boardState.board);
    let fromSquare: IPiece = newMove.fromSquare;
    if (fromSquare.piece === "e") {
        return;
    }

    previousBoardState = JSON.parse(JSON.stringify(boardState));

    let fromRow: number = Math.trunc(fromSquare.id / 8);
    let fromColumn: number = fromSquare.id % 8;

    boardState[fromRow][fromColumn].piece = "e";
    // console.log(boardState);

    let toSquare: IPiece = newMove.toSquare;

    let toRow: number = Math.trunc(toSquare.id / 8);
    let toColumn: number = toSquare.id % 8;

    boardState[toRow][toColumn].piece = fromSquare.piece;
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
    let row: number = Math.trunc(id! / 8);
    let column: number = id! % 8;

    return boardState[row][column];
};

function findPieceById(board: IPiece[][], id: number): IPiece | undefined {
    if (!board[0]) {
        return undefined;
    }

    for (const row of board) {
        const foundPiece = row.find((piece) => piece.id === id);
        if (foundPiece) {
            return foundPiece;
        }
    }
    return undefined;
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
    commitCastleToBoard
};
export { boardState };
