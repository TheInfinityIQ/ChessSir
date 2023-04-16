import type { Ref } from "vue";
import { commitMoveToBoard, getSquareWithId } from "./board";
import type { refVoid, IPiece, npIPiece, IMove, npVoid, moveBool, npBool } from "./types";
import { Piece, Move } from "./types";

let selectedSquareId: number | undefined;
let selectedSquarePiece: string | undefined;
let selectedSquareColour: number | undefined;

let pieceRef: Ref<string>;

let deselect: () => void;

enum ChessPiece {
    PAWN = "p",
    ROOK = "r",
    KNIGHT = "n",
    BISHOP = "b",
    KING = "k",
    QUEEN = "q",
}

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
    if (selectedSquareId === undefined && selectedSquarePiece === undefined && selectedSquareColour === undefined) {
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
    if ((!newSquare.id && newSquare.id != 0) || newSquare.colour === undefined || newSquare.piece === undefined) {
        console.error(`Error in makeMove. One of the values below are undefined or falsy\n
        newSquare.id ${newSquare.id}\n
        newSquare.colour ${newSquare.colour}\n
        newSquare.piece ${newSquare.piece}`);
        return;
    }

    let move: IMove = new Move(selectedIPiece(), newSquare);

    if (!validateMove(move)) return;

    commitMoveToBoard(move);
};

const validateMove: moveBool = (move: IMove) => {
    //Call corresponding piece type to validate a move for that piece
    const pieceType: string = move.fromSquare.piece.substring(move.fromSquare.piece.length, 1);
    const piece: ChessPiece | undefined = getChessPieceFromLetter(pieceType);

    // if piece or moveValidators.get(piece) is falsy, then return () => false
    const validator: moveBool = piece ? moveValidators.get(piece) ?? (() => false) : () => false;

    return validator(move);
};

const validatePawnMove: moveBool = (move: IMove) => {
    // isFriendlyPiece(move);
    isMoreThanOneSquare(move); // is only okay if pawn is off starting square
    isJumpingPiece(move);
    //More than 2 squares after move one
    //Backwards
    //En Passent
    //Promote
    console.log("Pawn move validated");

    return false;
};

const validateRookMove: moveBool = (move: IMove) => {
    // isFriendlyPiece(move);
    isDiagonalMove(move);
    isJumpingPiece(move);

    console.log("Rook move validated");
    return false;
};

const validateKnightMove: moveBool = (move: IMove) => {
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

const validateBishopMove: moveBool = (move: IMove) => {
    // isFriendlyPiece(move);
    isVertOrHorizontalMove(move);
    isJumpingPiece(move);

    console.log("Bishop move validated");
    return false;
};

const validateKingMove: moveBool = (move: IMove) => {
    // isFriendlyPiece(move);
    isMoreThanOneSquare(move);
    isJumpingPiece(move);
    //Castles

    console.log("King move validated");
    return false;
};

const validateQueenMove: moveBool = (move: IMove) => {
    // isFriendlyPiece(move);
    isJumpingPiece(move);

    console.log("Queen move validated");
    return false;
};

const moveValidators: Map<ChessPiece, moveBool> = new Map([
    [ChessPiece.PAWN, validatePawnMove],
    [ChessPiece.ROOK, validateRookMove],
    [ChessPiece.KNIGHT, validateKnightMove],
    [ChessPiece.BISHOP, validateBishopMove],
    [ChessPiece.KING, validateKingMove],
    [ChessPiece.QUEEN, validateQueenMove],
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

const isMoreThanOneSquare: moveBool = () => {
    return false;
};

const isJumpingPiece: moveBool = () => {
    return false;
};

const isFriendlyPiece: (friendlyColour: string, toSquareId: number) => boolean = (friendlyColour: string, toSquareId: number) => {
    const toPiece: string = getSquareWithId(toSquareId).piece;

    if (toPiece === "e") return false;

    return toPiece[0] === friendlyColour;
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

export { isPieceSelected, getIdOfSelectedPiece, getSelectedPiece, postSelectedPiece, postPieceRef, postDeselect, printPiece, printPreviousPiece, makeMove, unselectPiece };
