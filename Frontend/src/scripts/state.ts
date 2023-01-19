import { reactive, ref } from "vue";

let idOfSelectedPiece: number;
let pieceOfSelectedPiece: string;
let colourOfSelectedPiece: number;

let isPieceSelected: boolean = false;

// Get Functions
// --------------------

const getIsPieceSelected = () => {
    return isPieceSelected;
};

const getIdOfSelectedPiece = () => {
    return idOfSelectedPiece;
};

// Value modifying functions
// --------------------

const postIdOfSelectedPiece = (id: number | undefined) => {
    if (!id && id != 0) {
        console.log(
            "ID of selected piece is invalid. Exiting postIdOfSelectedPiece()"
        );
        return;
    }

    idOfSelectedPiece = id;
};

const postSelectedPiece = (colour: number, id: number, piece: string, deselect: () => void) => {
    if (!id && id != 0 || (colour == undefined || piece == undefined)) {
        console.log(
            "Piece Prop of selected piece is invalid. Exiting postSelectedPiece()"
        );
        return;
    }

    colourOfSelectedPiece = colour;
    pieceOfSelectedPiece = piece;
    idOfSelectedPiece = id;
};

const updateIsPieceSelected = () => {
    isPieceSelected = !isPieceSelected;
};

// Exports
// --------------------

export {
    getIdOfSelectedPiece,
    postIdOfSelectedPiece,
    updateIsPieceSelected,
    getIsPieceSelected,
    postSelectedPiece
};
