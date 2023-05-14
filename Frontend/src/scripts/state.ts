import { reactive, ref, type Ref } from 'vue';
import type { IMove, IPiece } from './types';
import { Move, Piece } from './types';

let selectedSquareId: number | undefined;
let selectedSquarePiece: string | undefined;
let selectedSquareColour: number | undefined;
let isWhitesTurn: boolean = true;
const isPromotionActive: Ref<boolean> = ref(false);
const pawnPromotionColour: Ref<string> = ref('');
const pawnPromotionPiece: Ref<string> = ref('');
const tempIPiece = new Piece(0, '', 2);
let pawnPromotionMove: IMove = reactive(new Move(tempIPiece, tempIPiece));

let deselect: () => void;

// Get Functions
// --------------------

function getIdOfSelectedPiece() {
	return selectedSquareId;
}

function isPieceSelected() {
	if (selectedSquarePiece) {
		return true;
	}

	return false;
}

function getSelectedPiece(): any {
	if (selectedSquareId === undefined && selectedSquarePiece === undefined && selectedSquareColour === undefined) {
		console.error(
			`getSelectedPiece was called when selectedSquare values were called.\nselectedSquareId: ${selectedSquareId}selectedSquarePiece: \n${selectedSquarePiece}selectedSquareColour: \n${selectedSquareColour}`
		);
		return;
	}

	return new Piece(selectedSquareId!, selectedSquarePiece!, selectedSquareColour!);
}

export function getPawnPromotionMove() {
	return pawnPromotionMove;
}

export function getIsWhitesTurn() {
	return isWhitesTurn;
}

export function getIsPromotionActive() {
	return isPromotionActive;
}

export function getPawnPromotionColour() {
	return pawnPromotionColour;
}

export function getPawnPromotionPiece() {
	return pawnPromotionPiece;
}

// Value modifying functions
// --------------------

export function toggleTurns() {
	return (isWhitesTurn = !isWhitesTurn);
}

export function toggleIsPromotionActive() {
	isPromotionActive.value = !isPromotionActive.value;
}

export function selectedIPiece() {
	return new Piece(selectedSquareId!, selectedSquarePiece!, selectedSquareColour!);
}

export function setPawnPromotionMove(move: IMove) {
	pawnPromotionMove = move;
}

export function setPawnPromotionColour(colour: string) {
	pawnPromotionColour.value = colour;
}

export function setPawnPromotionPiece(piece: string | undefined) {
	if (piece === undefined) {
		console.log(`setPawnPromotionPiece is undefined...`);
		return;
	}

	pawnPromotionPiece.value = piece;
}

function setSelectedPiece(newPiece: IPiece): void {
	selectedSquareId = newPiece.id;
	selectedSquarePiece = newPiece.piece;
	selectedSquareColour = newPiece.colour;
}

function setDeselect(newDeselect: () => void): void {
	// If deselect is not undefined.
	if (deselect) {
		deselect();
	}

	deselect = newDeselect;
}

function unselectPiece() {
	selectedSquareId = undefined;
	selectedSquarePiece = undefined;
	selectedSquareColour = undefined;
}

// Exports
// --------------------

export {
	isPieceSelected,
	getIdOfSelectedPiece,
	getSelectedPiece,
	setSelectedPiece as postSelectedPiece,
	setDeselect as postDeselect,
	unselectPiece,
};
