import { reactive, ref } from "vue";

let idOfSelectedPiece: number;
let pieceOfSelectedPiece: string;
let colourOfSelectedPiece: number;
let deselect: () => void;

// Get Functions
// --------------------

const getIdOfSelectedPiece = (): number => {
    return idOfSelectedPiece;
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

    colourOfSelectedPiece = colour;
    pieceOfSelectedPiece = piece;
    idOfSelectedPiece = id;
};

const postDeselect = (newDeselect: () => void): void => {
    if (deselect) {
        deselect();
    }

    deselect = newDeselect;
};

// Exports
// --------------------

export {
    getIdOfSelectedPiece,
    postSelectedPiece,
    postDeselect,
};
