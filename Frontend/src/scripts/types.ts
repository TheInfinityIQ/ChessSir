import type { Ref } from "vue";

interface IPiece {
    id: number; 
    colour: number; 
    piece: string
}

// No Paramaters
// --------------------
type npAny = () => any;
type npString = () => string;
type npVoid = () => void;

// One Paramater
// --------------------
type boolVoid = (param: boolean) => void;
type stringVoid = (param: string) => void;
type refVoid = (param: Ref<any>) => void;

export type { IPiece, npVoid, boolVoid, stringVoid, npAny, npString, refVoid }