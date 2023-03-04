import type { Ref } from "vue";
import type { npVoid, npString, refVoid } from "./types";

let idOfSelectedPiece: number;
let pieceOfSelectedPiece: string;
let colourOfSelectedPiece: number;

let idOfPreviousPiece: number;
let pieceOfPreviousPiece: string;
let colourOfPreviousPiece: number;

let pieceRef: Ref<string>;

let deselect: () => void;

// Get Functions
// --------------------

const getIdOfSelectedPiece = (): number => {
    return idOfSelectedPiece;
};

const getPreviousPiece: npString = () => {
    return pieceOfPreviousPiece;
};

// Value modifying functions
// --------------------

const postSelectedPiece = (colour: number, id: number, piece: string): void => {
    if ((!id && id != 0) || colour == undefined || piece == undefined) {
        console.log(
            "Piece Prop of selected piece is invalid. Exiting postSelectedPiece()"
        );
        return;
    }

    if (
        idOfSelectedPiece ||
        (idOfSelectedPiece == 0 &&
            pieceOfSelectedPiece &&
            colourOfSelectedPiece) ||
        colourOfSelectedPiece == 0
    ) {
        idOfPreviousPiece = idOfSelectedPiece;
        pieceOfPreviousPiece = pieceOfSelectedPiece;
        colourOfPreviousPiece = colourOfSelectedPiece;
    }

    idOfSelectedPiece = id;
    pieceOfSelectedPiece = piece;
    colourOfSelectedPiece = colour;
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
        pieceRef.value = pieceOfPreviousPiece;
    }
    
    pieceRef = newPieceRef;
}

// Debug
// --------------------

const printPiece = () => {
    console.log(pieceOfSelectedPiece);
};

const printPreviousPiece = () => {
    return;
};

// Exports
// --------------------

export {
    getIdOfSelectedPiece,
    getPreviousPiece,
    postSelectedPiece,
    postPieceRef,
    postDeselect,
    printPiece,
    printPreviousPiece,
};
