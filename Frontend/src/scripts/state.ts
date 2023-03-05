import type { Ref } from "vue";
import type { npVoid, npString, refVoid } from "./types";

let PreviousID: number;
let previousPiece: string;
let previousColour: number;

let pieceRef: Ref<string>;

let deselect: () => void;

// Get Functions
// --------------------

const getIdOfSelectedPiece = (): number => {
    return PreviousID;
};

const getPreviousPiece: npString = () => {
    return previousPiece;
};

// Value modifying functions
// --------------------

const postSelectedPiece = (newColour: number, newID: number, newPiece: string): void => {
    if ((!newID && newID != 0) || newColour == undefined || newPiece == undefined) {
        console.log("Piece Prop of selected piece is invalid. Exiting postSelectedPiece()");
        return;
    }

    PreviousID = newID;
    previousPiece = newPiece;
    previousColour = newColour;
};

//TODO: UPDATE NAME TO MAKE MORE SENSE
const postDeselect = (newDeselect: () => void): void => {
    if (deselect) {
        deselect();
    }

    deselect = newDeselect;
};

const postPieceRef: refVoid = (newPieceRef: Ref<string>) => {
    if (pieceRef) {
        pieceRef.value = previousPiece;
    }

    pieceRef = newPieceRef;
};

// Debug
// --------------------

const printPiece = () => {
    console.log(previousPiece);
};

const printPreviousPiece = () => {
    return;
};

// Exports
// --------------------

export { getIdOfSelectedPiece, getPreviousPiece, postSelectedPiece, postPieceRef, postDeselect, printPiece, printPreviousPiece };
