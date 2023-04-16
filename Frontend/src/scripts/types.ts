import type { Ref } from "vue";


// Interfaces
// --------------------
export interface IPiece {
    id: number;
    piece: string;
    colour: number;
}

export interface IMove {
    fromSquare: IPiece;
    toSquare: IPiece;
}

// Classes
// --------------------
export class Piece implements IPiece {
    id: number;
    piece: string;
    colour: number;

    constructor(id: number, piece: string, colour: number) {
        this.id = id;
        this.piece = piece;
        this.colour = colour;
    }
}

export class Move implements IMove {
    fromSquare: IPiece;
    toSquare: IPiece;

    constructor(fromSquare: IPiece, toSquare: IPiece) {
        this.fromSquare = fromSquare;
        this.toSquare = toSquare;
    }
}

// Type aliases
// --------------------
type npAny = () => any;
type npString = () => string;
type npVoid = () => void;
type npIPiece = () => IPiece;
type npBool = () => boolean;

type boolVoid = (param: boolean) => void;
type stringVoid = (param: string) => void;
type refVoid = (param: Ref<any>) => void;
type moveVoid = (param: IMove) => void;
type numIPiece = (param: number) => void;
type moveBool = (param: IMove) => boolean;

// Exported types
// --------------------
export type { npVoid, npAny, npString, npIPiece, npBool };
export type { boolVoid, stringVoid, refVoid, moveVoid, numIPiece, moveBool };