import { rowAndColValue } from "./staticValues";
import type { IPiece } from "./types";

export function rowDiff(fromSquare: IPiece, toSquare: IPiece, returnAbsoluteValue: boolean = false): number {
	let result: number = Math.floor(fromSquare.id / rowAndColValue) - Math.floor(toSquare.id / rowAndColValue);

	if (returnAbsoluteValue) {
		result = Math.abs(result);
	}

	return result;
}

export function colDiff(fromSquare: IPiece, toSquare: IPiece, returnAbsoluteValue: boolean = false): number {
	let result: number = (fromSquare.id % rowAndColValue) - (toSquare.id % rowAndColValue);

	if (returnAbsoluteValue) {
		result = Math.abs(result);
	}

	return result;
}