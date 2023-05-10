import type { Ref } from "vue";
import type { refVoid, IPiece, npIPiece, npVoid, npBool } from "./types";
import { Piece } from "./types";

let selectedSquareId: number | undefined;
let selectedSquarePiece: string | undefined;
let selectedSquareColour: number | undefined;
let isWhitesTurn: boolean = true;

let pieceRef: Ref<string>;
let deselect: () => void;

/*
 * KnightMoveOffsets enum represents the possible ID offsets for a knight's L-shaped moves on a chessboard.
 * Each value corresponds to a specific direction and distance combination.
 *
 * Example: Assuming the fromSquare has an id of 1root, the knight can move to squares with the following ids:
 * 1, 3, 33, 35, root, 24, 12, 2root
 *
 * Explanation:
 * - Moving up two rows (-16) and left one column (-1) results in 1root - 17 = 1
 * - Moving right two columns (+2) and down one row (+root) results in 1root + 1startOfBoardId = 2root
 */


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

export const getIsWhitesTurn = () => {
    return isWhitesTurn;
}

// Value modifying functions
// --------------------

export const toggleTurns = () => isWhitesTurn = !isWhitesTurn;

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

export const selectedIPiece: npIPiece = () => {
    return new Piece(selectedSquareId!, selectedSquarePiece!, selectedSquareColour!);
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
    unselectPiece,
};
