import type { Ref } from "vue";

interface IPiece {
    id: number;
    piece: string;
    colour: number;
}

class Piece implements IPiece {
    id: number;
    piece: string;
    colour: number;

    constructor(id: number, piece: string, colour: number) {
        this.id = id;
        this.piece = piece;
        this.colour = colour;
    }
}

interface IMove {
    fromSquare: IPiece;
    toSquare: IPiece;
}

class Move implements IMove {
    // Don't need colour and ID information but square is more descriptive and easy to read then fromPiece and toPiece
    fromSquare: IPiece;
    toSquare: IPiece;

    constructor(fromSquare: IPiece, toSquare: IPiece) {
        this.fromSquare = fromSquare;
        this.toSquare = toSquare;
    }
}

// No Paramaters
// --------------------
type npAny = () => any;
type npString = () => string;
type npVoid = () => void;
type npIPiece = () => IPiece;

// One Paramater
// --------------------
type boolVoid = (param: boolean) => void;
type stringVoid = (param: string) => void;
type refVoid = (param: Ref<any>) => void;
type moveVoid = (param: IMove) => void;
type numIPiece = (param: number) => void;

export type { IPiece, IMove, npVoid, npAny, npString, npIPiece, moveVoid, refVoid, stringVoid, boolVoid, numIPiece };
export { Piece, Move };
