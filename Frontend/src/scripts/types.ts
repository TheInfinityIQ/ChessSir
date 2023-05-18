// Interfaces

import type { Ref } from "vue";

// --------------------
export interface IPiece {
	id: number;
	piece: string;
	colour: number;
	selected: boolean;
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
	selected: boolean;

	constructor(id: number, piece: string, colour: number) {
		this.id = id;
		this.piece = piece;
		this.colour = colour;
		this.selected = false;
	}
}

export class TempPiece implements IPiece {
	id: number;
	piece: string;
	colour: number;
	selected: boolean;

	constructor() {
		this.id = -1;
		this.piece = "";
		this.colour = -1;
		this.selected = false;
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
type npNumber = () => number;

type boolVoid = (param: boolean) => void;
type stringVoid = (param: string) => void;
type refVoid = (param: Ref<any>) => void;
type moveVoid = (param: IMove) => void;
type numIPiece = (param: number) => IPiece;
type moveBool = (param: IMove) => boolean;

// Exported types
// --------------------
export type { npVoid, npAny, npString, npIPiece, npBool, npNumber };
export type { boolVoid, stringVoid, refVoid, moveVoid, numIPiece, moveBool };
