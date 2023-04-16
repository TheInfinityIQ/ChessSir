import type { Ref } from "vue";
import { commitMoveToBoard } from "./board";
import type { refVoid, IPiece, npIPiece, IMove, npVoid, moveBool } from "./types";
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

// Get Functions
// --------------------

const getIdOfSelectedPiece = (): number | undefined => {
    return selectedSquareId;
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
    if ((!newSquare.id && newSquare.id != 0) || newSquare.colour == undefined || newSquare.colour == undefined) {
        console.log("Piece Prop of selected piece is invalid. Exiting postSelectedPiece()");
        return;
    }

    let move: IMove = new Move(selectedIPiece(), newSquare);
    validateMove(move); // TODO: update to prevent move from being commited if false

    commitMoveToBoard(move);
};

const validateMove: moveBool = (move: IMove) => {
    //Call corresponding piece type to validate a move for that piece
    const pieceType: string = move.fromSquare.piece.substring(move.fromSquare.piece.length, 1);
    const piece: ChessPiece | undefined = getChessPieceFromLetter(pieceType);
    let validator: moveBool = () => false;

    if (piece)
        validator = moveValidators.get(piece)!; // moveValidators will never be invalid if piece is valid

    return validator(move);
}

const validatePawnMove: moveBool = (move: IMove) => {
    isMoreThanOneSquare(move); // is only okay if pawn is off starting square
    isJumpingPiece(move);
    //More than 2 squares after move one
    //Backwards
    //En Passent
    //Promote
    console.log("Pawn move validated");

    return false;
}

const validateRookMove: moveBool = (move: IMove) => {
    isDiagonalMove(move);
    isJumpingPiece(move);

    console.log("Rook move validated");
    return false;
}

const validateKnightMove: moveBool = (move: IMove) => {
    isDiagonalMove(move);
    isVertOrHorizontalMove(move);
    //Only move in Ls

    console.log("Knight move validated");
    return false;
}

const validateBishopMove: moveBool = (move: IMove) => {
    isVertOrHorizontalMove(move);
    isJumpingPiece(move);

    console.log("Bishop move validated");
    return false;
}

const validateKingMove: moveBool = (move: IMove) => {
    isMoreThanOneSquare(move);
    isJumpingPiece(move);
    //Castles

    console.log("King move validated");
    return false;
}

const validateQueenMove: moveBool = (move: IMove) => {
    isJumpingPiece(move);

    console.log("Queen move validated");
    return false;
}

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
}

const isVertOrHorizontalMove: moveBool = () => {

    return false;
}

const isMoreThanOneSquare: moveBool = () => {

    return false;
}

const isJumpingPiece: moveBool = () => {

    return false;
}

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

export { getIdOfSelectedPiece, getSelectedPiece, postSelectedPiece, postPieceRef, postDeselect, printPiece, printPreviousPiece, makeMove, unselectPiece };
