import type { Ref } from "vue";
import {
    boardState,
    commitMoveToBoard,
    getSquareWithIdWrapper,
    getPreviousBoardStateWrapper,
    findPieceById,
} from "./board";
import type { refVoid, IPiece, npIPiece, IMove, npVoid, moveBool, npBool } from "./types";
import { Piece, Move } from "./types";

let selectedSquareId: number | undefined;
let selectedSquarePiece: string | undefined;
let selectedSquareColour: number | undefined;

let pieceRef: Ref<string>;

let deselect: () => void;

/*
 * KnightMoveOffsets enum represents the possible ID offsets for a knight's L-shaped moves on a chessboard.
 * Each value corresponds to a specific direction and distance combination.
 *
 * Example: Assuming the fromSquare has an id of 18, the knight can move to squares with the following ids:
 * 1, 3, 33, 35, 8, 24, 12, 28
 *
 * Explanation:
 * - Moving up two rows (-16) and left one column (-1) results in 18 - 17 = 1
 * - Moving right two columns (+2) and down one row (+8) results in 18 + 10 = 28
 */
enum KnightMoveOffsets {
    UP_LEFT = -17,
    UP_RIGHT = -15,
    DOWN_LEFT = 15,
    DOWN_RIGHT = 17,
    LEFT_UP = -10,
    LEFT_DOWN = 6,
    RIGHT_UP = -6,
    RIGHT_DOWN = 10,
}

enum AdjacentSquareIdOffsets {
    UP = -8,
    UP_RIGHT = -7,
    UP_LEFT = -9,
    RIGHT = 1,
    LEFT = -1,
    DOWN = 8,
    DOWN_RIGHT = 9,
    DOWN_LEFT = 7,
}

enum ChessPiece {
    PAWN = "p",
    ROOK = "r",
    KNIGHT = "n",
    BISHOP = "b",
    KING = "k",
    QUEEN = "q",
}

enum Direction {
    VERTICAL = "v",
    HORIZONTAL = "h",
    DIAGONAL = "D",
}

enum PieceComp {
    COLOUR = 0,
    TYPE = 1,
}

enum PawnAttackSquares {
    LEFT = 7,
    RIGHT = 9,
}

// Get Functions
// --------------------

const getIdOfSelectedPiece = (): number | undefined => {
    return selectedSquareId;
};

const isPieceSelected: npBool = () => {
    if (selectedSquarePiece) {
        return true;
    }

    return false;
};

const getSelectedPiece = (): any => {
    if (
        selectedSquareId === undefined &&
        selectedSquarePiece === undefined &&
        selectedSquareColour === undefined
    ) {
        console.error(
            `getSelectedPiece was called when selectedSquare values were called.\nselectedSquareId: ${selectedSquareId}selectedSquarePiece: \n${selectedSquarePiece}selectedSquareColour: \n${selectedSquareColour}`
        );
        return;
    }

    return new PieceComp(selectedSquareId!, selectedSquarePiece!, selectedSquareColour!);
};

// Value modifying functions
// --------------------

const postSelectedPiece = (newPiece: IPiece): void => {
    selectedSquareId = newPiece.id;
    selectedSquarePiece = newPiece.piece;
    selectedSquareColour = newPiece.colour;
};

//TODO: UPDATE NAME TO MAKE MORE SENSE
const postDeselect = (newDeselect: () => void): void => {
    // If deselect is not undefined.
    if (deselect) {
        deselect();
    }

    deselect = newDeselect;
};

const unselectPiece: npVoid = () => {
    selectedSquareId = undefined;
    selectedSquarePiece = undefined;
    selectedSquareColour = undefined;
};

const postPieceRef: refVoid = (newPieceRef: Ref<string>) => {
    if (pieceRef) {
        pieceRef.value = selectedSquarePiece!;
    }

    pieceRef = newPieceRef;
};

const selectedIPiece: npIPiece = () => {
    return new Piece(selectedSquareId!, selectedSquarePiece!, selectedSquareColour!);
};

const makeMove = (newSquare: IPiece) => {
    if (
        (!newSquare.id && newSquare.id != 0) ||
        newSquare.colour === undefined ||
        newSquare.piece === undefined
    ) {
        console.error(`Error in makeMove. One of the values below are undefined or falsy\n
        newSquare.id ${newSquare.id}\n
        newSquare.colour ${newSquare.colour}\n
        newSquare.piece ${newSquare.piece}`);
        return;
    }

    let move: IMove = new Move(selectedIPiece(), newSquare);

    if (!validMove(move)) return;

    commitMoveToBoard(move);
};

const validMove: moveBool = (move: IMove) => {
    //Call corresponding piece type to validate a move for that piece
    const pieceType: string = move.fromSquare.piece.substring(move.fromSquare.piece.length, 1);
    const piece: ChessPiece | undefined = getChessPieceFromLetter(pieceType);

    // if piece or moveValidators.get(piece) is falsy, then return () => false
    const validator: moveBool = piece ? moveValidators.get(piece) ?? (() => false) : () => false;

    return validator(move);
};

const validPawnMove: moveBool = (move: IMove) => {
    const { fromSquare, toSquare } = move;
    const pieceColour = fromSquare.piece[PieceComp.COLOUR];
    const opponentColour = pieceColour === "w" ? "b" : "w";
    const direction = determineDirection(move);

    const idDifference = fromSquare.id - toSquare.id;
    const isDirectionCorrect = pieceColour === "w" ? idDifference > 0 : idDifference < 0;
    if (!isDirectionCorrect) return false;

    const fromRowId = Math.floor(fromSquare.id / 8);
    const isStartingSquare = pieceColour === "w" ? fromRowId === 6 : fromRowId === 1;
    const rowDifference = Math.abs(fromRowId - Math.floor(toSquare.id / 8));
    if ((rowDifference === 2 && !isStartingSquare) || rowDifference > 2) return false;

    const isVerticalMoveValid = () => direction === Direction.VERTICAL && toSquare.piece === "e";
    const isDiagonalMoveValid = () =>
        direction === Direction.DIAGONAL &&
        !isFriendlyPiece(fromSquare.piece[0], toSquare.id);

    if (!isVerticalMoveValid() && !isDiagonalMoveValid()) return false;

    const attemptedEnPassent = direction === Direction.DIAGONAL && toSquare.piece === "e";

    console.log(`Is attempted valid: ${attemptedEnPassent}`);
    if (attemptedEnPassent) {
        // En Passant
        const prevBoardState = getPreviousBoardStateWrapper();
        const opponentPawn = pieceColour === "w" ? "bp" : "wp";
        const opponentPawnCheckSquareId = pieceColour === "w" ? toSquare.id - 8 : toSquare.id + 8;
        const checkColumn = ((fromSquare.id % 8 - toSquare.id % 8) * -1 + fromSquare.id);

        const isEnPassantValid = () =>
            getSquareWithIdWrapper(checkColumn).piece === opponentPawn &&
            findPieceById(prevBoardState, opponentPawnCheckSquareId)?.piece === opponentPawn;

        console.log(prevBoardState);
        console.log(getSquareWithIdWrapper(checkColumn).piece === opponentPawn);
        console.log(findPieceById(prevBoardState, opponentPawnCheckSquareId)?.piece)

        console.log(`Is valid ${isEnPassantValid()}`);
        // console.log(fromSquare.id + rowDifference);
        if (attemptedEnPassent && !isEnPassantValid()) return false;
    }

    return !isJumpingPiece(move);
};

const validRookMove: moveBool = (move: IMove) => {
    const fromSquare = move.fromSquare;
    const toSquare = move.toSquare;

    return !(
        isJumpingPiece(move) ||
        determineDirection(move) === Direction.DIAGONAL ||
        isFriendlyPiece(fromSquare.piece[0], toSquare.id)
    );
};

const validKnightMove: moveBool = (move: IMove) => {
    const fromSquare = move.fromSquare;
    const toSquare = move.toSquare;

    const pieceColour = fromSquare.piece[0];

    const validIdsMods = [
        KnightMoveOffsets.UP_LEFT,
        KnightMoveOffsets.UP_RIGHT,
        KnightMoveOffsets.DOWN_LEFT,
        KnightMoveOffsets.DOWN_RIGHT,
        KnightMoveOffsets.LEFT_UP,
        KnightMoveOffsets.LEFT_DOWN,
        KnightMoveOffsets.RIGHT_UP,
        KnightMoveOffsets.RIGHT_DOWN,
    ];

    const validIDs: number[] = [];

    validIdsMods.forEach((value: number) => {
        let modId = value + fromSquare.id;
        const lessThanUpBound = value + fromSquare.id < 63;
        const moreThanlowBound = value + fromSquare.id > 0;
        const notFriendlyPiece = !isFriendlyPiece(pieceColour, toSquare.id);

        if (lessThanUpBound && moreThanlowBound && notFriendlyPiece) {
            validIDs.push(modId);
        }
    });

    const result = validIDs.some((id) => id === toSquare.id);

    return result;
};

const validBishopMove: moveBool = (move: IMove) => {
    const fromSquare = move.fromSquare;
    const toSquare = move.toSquare;

    const pieceColour = fromSquare.piece[0];

    return !(
        isJumpingPiece(move) ||
        determineDirection(move) === Direction.HORIZONTAL ||
        determineDirection(move) === Direction.VERTICAL ||
        determineDirection(move) !== Direction.DIAGONAL ||
        isFriendlyPiece(fromSquare.piece[0], toSquare.id)
    );
};

const validKingMove: moveBool = (move: IMove) => {
    const fromSquare = move.fromSquare;
    const toSquare = move.toSquare;

    getAdjacentSquares(toSquare.id);

    if (validQueenMove(move) && !isMoreThanOneSquare(move)) return true;

    return false;
};

const validQueenMove: moveBool = (move: IMove) => {
    const fromSquare = move.fromSquare;
    const toSquare = move.toSquare;

    if (
        determineDirection(move) !== Direction.DIAGONAL &&
        determineDirection(move) !== Direction.HORIZONTAL &&
        determineDirection(move) !== Direction.VERTICAL
    ) {
        return false; // Not a valid queen move
    }

    return !(isJumpingPiece(move) || isFriendlyPiece(fromSquare.piece[0], toSquare.id));
};

const moveValidators: Map<ChessPiece, moveBool> = new Map([
    [ChessPiece.PAWN, validPawnMove],
    [ChessPiece.ROOK, validRookMove],
    [ChessPiece.KNIGHT, validKnightMove],
    [ChessPiece.BISHOP, validBishopMove],
    [ChessPiece.KING, validKingMove],
    [ChessPiece.QUEEN, validQueenMove],
]);

const getChessPieceFromLetter = (letter: string): ChessPiece | undefined => {
    for (const key in ChessPiece) {
        if (ChessPiece[key as keyof typeof ChessPiece] === letter) {
            return ChessPiece[key as keyof typeof ChessPiece];
        }
    }
    return undefined;
};

const isDiagonalMove: moveBool = () => {
    return false;
};

const isVertOrHorizontalMove: moveBool = () => {
    return false;
};

const isMoreThanOneSquare: moveBool = (move: IMove) => {
    const fromSquare = move.fromSquare;
    const toSquare = move.toSquare;

    const rowDifference = Math.abs(Math.floor(fromSquare.id / 8) - Math.floor(toSquare.id / 8));
    const colDifference = Math.abs((fromSquare.id % 8) - (toSquare.id % 8));

    // Check if the move is more than one square away
    if (rowDifference > 1 || colDifference > 1) {
        return true;
    }

    return false;
};

const determineDirection = (move: Move) => {
    const fromSquare = move.fromSquare;
    const toSquare = move.toSquare;

    //Determine if straight line
    const rowDifference = Math.abs(Math.floor(fromSquare.id / 8) - Math.floor(toSquare.id / 8));
    const colDifference = Math.abs((fromSquare.id % 8) - (toSquare.id % 8));

    const isDiagonalMove = rowDifference === colDifference;
    const isVerticalMove = rowDifference > 0 && colDifference === 0;
    const isHorizontalMove = rowDifference === 0 && colDifference > 0; // determines if both fromSquare and toSquare are in same row

    if (isDiagonalMove) {
        return Direction.DIAGONAL;
    }

    if (isVerticalMove) {
        return Direction.VERTICAL;
    }

    if (isHorizontalMove) {
        return Direction.HORIZONTAL;
    }

    return;
};

const isJumpingPiece: moveBool = (move: IMove) => {
    const d = determineDirection(move);

    if (d === Direction.DIAGONAL) {
        return jumpingPieceOnDiagonal(move);
    }

    if (d === Direction.VERTICAL) {
        return jumpingPieceOnStraight(move, Direction.VERTICAL);
    }

    if (d === Direction.HORIZONTAL) {
        return jumpingPieceOnStraight(move, Direction.HORIZONTAL);
    }

    // Will only happen if illegal move. Can me moved over to a new function using the log if (!(isDiagonalMove || isVerticalMove || isHorizontalMove)) return true;
    return true;
};

const jumpingPieceOnDiagonal: moveBool = (move: Move) => {
    const fromSquare = move.fromSquare;
    const toSquare = move.toSquare;

    let startId = Math.min(fromSquare.id, toSquare.id);
    let endId = Math.max(fromSquare.id, toSquare.id);

    const rowDiff = Math.abs(Math.floor(fromSquare.id / 8) - Math.floor(toSquare.id / 8));
    const colDiff = Math.abs((fromSquare.id % 8) - (toSquare.id % 8));

    if (rowDiff !== colDiff) {
        // The move is not diagonal
        return false;
    }

    let step = rowDiff === colDiff ? 9 : 7;

    // Check if the move is up and left or down and right
    if (
        (fromSquare.id < toSquare.id && fromSquare.id % 8 > toSquare.id % 8) ||
        (fromSquare.id > toSquare.id && fromSquare.id % 8 < toSquare.id % 8)
    ) {
        step = 7;
    }

    // Start checking from the next square in the direction of the move
    startId += step;

    for (let id = startId; id < endId; id += step) {
        const square = getSquareWithIdWrapper(id);
        if (square.piece !== "e") {
            return true;
        }
    }

    return false;
};

const jumpingPieceOnStraight: (param: Move, direction: Direction) => boolean = (
    move: Move,
    direction: Direction
) => {
    const fromSquare = move.fromSquare;
    const toSquare = move.toSquare;

    let startId = Math.min(fromSquare.id, toSquare.id);
    let endId = Math.max(fromSquare.id, toSquare.id);
    let step;

    if (direction === Direction.HORIZONTAL) {
        step = 1;
    } else {
        step = 8;
    }

    // Start checking from the next square in the direction of the move
    startId += step;

    for (let id = startId; id < endId; id += step) {
        const square = getSquareWithIdWrapper(id);
        if (square.piece !== "e") {
            return true;
        }
    }

    return false;
};

const isFriendlyPiece: (friendlyColour: string, toSquareId: number) => boolean = (
    friendlyColour: string,
    toSquareId: number
) => {
    const toPiece: string = getSquareWithIdWrapper(toSquareId).piece;

    if (toPiece === "e") return false;

    return toPiece[0] === friendlyColour;
};

const getAdjacentSquares: (checkedSquareId: number) => IPiece[] | undefined = (
    checkedSquareId: number
) => {
    const upperBound = 63;
    const lowerBound = 0;
    const adjacentPieces: IPiece[] = [];

    for (const key in AdjacentSquareIdOffsets) {
        const mod = AdjacentSquareIdOffsets[key as keyof typeof AdjacentSquareIdOffsets];
        const moddedId = checkedSquareId + mod;

        if (moddedId > lowerBound && moddedId < upperBound) {
            adjacentPieces.push(getSquareWithIdWrapper(moddedId));
        }
    }

    return adjacentPieces;
};

// Debug
// --------------------

const printPiece = () => {
    console.log(selectedSquarePiece);
};

const printPreviousPiece = () => {
    return;
};

// Exports
// --------------------

export {
    isPieceSelected,
    getIdOfSelectedPiece,
    getSelectedPiece,
    postSelectedPiece,
    postPieceRef,
    postDeselect,
    printPiece,
    printPreviousPiece,
    makeMove,
    unselectPiece,
};
