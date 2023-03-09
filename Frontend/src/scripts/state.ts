import type { Ref } from "vue";
import { commitMoveToBoard } from "./board";
import { type refVoid, type IPiece, type npIPiece, Piece, type IMove, Move, type npVoid } from "./types";

let selectedSquareId: number | undefined;
let selectedSquarePiece: string | undefined;
let selectedSquareColour: number | undefined;

let pieceRef: Ref<string>;

let deselect: () => void;

// Get Functions
// --------------------

const getIdOfSelectedPiece = (): number |  undefined => {
    return selectedSquareId;
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
    if (deselect) {
        deselect();
    }

    deselect = newDeselect;
};

const unselectPiece: npVoid = () => {
    selectedSquareId = undefined;
    selectedSquarePiece = undefined;
    selectedSquareColour = undefined;
}

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
    commitMoveToBoard(move); 

    console.log("move made");
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

export { getIdOfSelectedPiece, postSelectedPiece, postPieceRef, postDeselect, printPiece, printPreviousPiece, makeMove, unselectPiece };
