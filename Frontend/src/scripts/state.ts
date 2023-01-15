import { reactive, ref } from "vue";

let idOfSelectedPiece: { id: number } = reactive({ id: -1});
let isPieceSelected: boolean = false;

const getIsPieceSelected = () => {
    return isPieceSelected;
}

const updateIsPieceSelected = () => {
    isPieceSelected = !isPieceSelected;
};

const getIdOfSelectedPiece = () => {
    return idOfSelectedPiece.id;
};

const postIdOfSelectedPiece = (id: number | undefined) => {
    if (!id) {
        ///br does not have ID?
        return;
    }

    idOfSelectedPiece = { id };
};

export { getIdOfSelectedPiece, postIdOfSelectedPiece, updateIsPieceSelected, getIsPieceSelected };
