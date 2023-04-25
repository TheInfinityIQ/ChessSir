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

    return new Piece(selectedSquareId!, selectedSquarePiece!, selectedSquareColour!);
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
    const pieceType: string = move.fromSquare.piece[PieceComp.TYPE];
    const piece: ChessPiece | undefined = getChessPieceFromLetter(pieceType);

    // if piece or moveValidators.get(piece) is falsy, then return () => false
    const validator: moveBool = piece ? moveValidators.get(piece) ?? (() => false) : () => false;

    return validator(move);
};

const validPawnMove: moveBool = (move: IMove) => {
    const { fromSquare, toSquare } = move;
    const pieceColour = fromSquare.piece[PieceComp.COLOUR];
    const opponentColour = pieceColour === "w" ? "b" : "w";
    const dir = determineDirection(move);

    const idDiff = fromSquare.id - toSquare.id;
    const isDirectionCorrect = pieceColour === "w" ? idDiff > 0 : idDiff < 0;
    if (!isDirectionCorrect) return false;

    const fromRowId = Math.floor(fromSquare.id / 8);
    const isStartingSquare = pieceColour === "w" ? fromRowId === 6 : fromRowId === 1;
    const rowDiff = Math.abs(fromRowId - Math.floor(toSquare.id / 8));
    if ((rowDiff === 2 && !isStartingSquare) || rowDiff > 2) return false;

    const isVerticalMove = dir === Direction.VERTICAL && toSquare.piece === "e";
    const isDiagonalMove = dir === Direction.DIAGONAL && !isFriendlyPiece(fromSquare.piece[0], toSquare.id);

    if (!isVerticalMove && !isDiagonalMove) return false;

    if (isDiagonalMove && toSquare.piece === "e") {
        if (!isValidEnPassant(fromSquare, toSquare, pieceColour, opponentColour)) return false;
    }

    return !isJumpingPiece(move);
};

const isValidEnPassant = (fromSquare: IPiece, toSquare: IPiece, pieceColour: string, opponentColour: string) => {
    const prevBoard = getPreviousBoardStateWrapper();
    const opponentPawn = `${opponentColour}${ChessPiece.PAWN}`;
    const opponentCheckSquareId = pieceColour === "w" ? toSquare.id - 8 : toSquare.id + 8;
    const attackedPawnId = ((fromSquare.id % 8) - (toSquare.id % 8)) * -1 + fromSquare.id;

    const isEnPassantValid =
        getSquareWithIdWrapper(attackedPawnId).piece === opponentPawn &&
        findPieceById(prevBoard, opponentCheckSquareId)?.piece === opponentPawn;

    if (isEnPassantValid) {
        const attackedPawnRow = Math.floor(attackedPawnId / 8);
        const attackedPawnColumn = Math.floor(attackedPawnId % 8);
        boardState[attackedPawnRow][attackedPawnColumn].piece = "e";
        return true;
    }

    return false;
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
    const pieceColour = fromSquare.piece[PieceComp.COLOUR];
    const toSquare = move.toSquare;

    getAdjacentSquares(toSquare.id);

    if(willKingBeInCheck(toSquare, pieceColour)) return false;
    if (!validQueenMove(move) || isMoreThanOneSquare(move)) return false;

    return true;
};

const willKingBeInCheck = (kingSquare: IPiece, pieceColour: string) => {
    const id = kingSquare.id;
    const opponentColour = pieceColour === "w" ? "b" : "w";
    const diagonals = [AdjacentSquareIdOffsets.DOWN_LEFT, AdjacentSquareIdOffsets.DOWN_RIGHT, AdjacentSquareIdOffsets.UP_RIGHT, AdjacentSquareIdOffsets.UP_LEFT];
    const straights = [AdjacentSquareIdOffsets.LEFT, AdjacentSquareIdOffsets.RIGHT, AdjacentSquareIdOffsets.UP, AdjacentSquareIdOffsets.DOWN];

    for (const key in KnightMoveOffsets) {
        const offset = KnightMoveOffsets[key as keyof typeof KnightMoveOffsets]
        const testId = offset + id;

        if (testId > 0 && testId < 63) // Ensure no out of bounds
            if (getSquareWithIdWrapper(testId).piece === opponentColour + "n") {
                return true;
            }
    }

    for (const key in AdjacentSquareIdOffsets)
    {
        const offset = AdjacentSquareIdOffsets[key as keyof typeof AdjacentSquareIdOffsets];
        let squaresAway = 1;
        let testId = (offset * squaresAway) + id;
        
        while (testId > 0 && testId < 63) {
            const checkedSquareId = getSquareWithIdWrapper(testId);
            
            if (checkedSquareId.piece[PieceComp.COLOUR] === opponentColour) {
                if (squaresAway === 1 && checkedSquareId.piece[PieceComp.TYPE] === "k") return true;
            }
            console.log(testId);
            testId = (offset * squaresAway++) + id
        }
    }

    //Both -> King, Queen
    //Horizontal and Vertical pieces -> Rook
    //Diagonal pieces -> Bishop, Pawn
    //Only one square
    return false;
}

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
        const offset = AdjacentSquareIdOffsets[key as keyof typeof AdjacentSquareIdOffsets];
        const moddedId = checkedSquareId + offset;

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
