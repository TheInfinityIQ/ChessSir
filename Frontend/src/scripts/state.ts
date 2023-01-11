import { reactive } from "vue";

let idOfSelectedPiece: { id: number } = reactive({ id: 64 });

const getIdOfSelectedPiece = () => {
    return idOfSelectedPiece.id;
};

const postIdOfSelectedPiece = (id: number | undefined) => {
    if (!id) {
        return;
    }
    
    idOfSelectedPiece = { id };
    console.log(id);
};

export { getIdOfSelectedPiece, postIdOfSelectedPiece };
