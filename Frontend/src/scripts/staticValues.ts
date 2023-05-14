const notEmptyPieces: string[] = [
	'br',
	'bn',
	'bb',
	'bq',
	'bk',
	'bb',
	'bn',
	'br',
	'bp',
	'bp',
	'bp',
	'bp',
	'bp',
	'bp',
	'bp',
	'bp',
	'wp',
	'wp',
	'wp',
	'wp',
	'wp',
	'wp',
	'wp',
	'wp',
	'wr',
	'wn',
	'wb',
	'wq',
	'wk',
	'wb',
	'wn',
	'wr',
];

const numOfNotEmptyPieces: number = 32;

export function getNotEmptyPieces() {
	return notEmptyPieces;
}

export function getNumNotEmptyPieces() {
	return numOfNotEmptyPieces;
}

export enum CastlingPiecesId {
	WHITE_ROOK_QUEENSIDE = 56,
	WHITE_ROOK_KINGSIDE = 63,
	BLACK_ROOK_QUEENSIDE = 0,
	BLACK_ROOK_KINGSIDE = 7,
	WHITE_KING = 60,
	BLACK_KING = 4,
}

/*
 * KnightMoveOffsets enum represents the possible ID offsets for a knight's L-shaped moves on a chessboard.
 * Each value corresponds to a specific direction and distance combination.
 *
 * Example: Assuming the fromSquare has an id of 1root, the knight can move to squares with the following ids:
 * 1, 3, 33, 35, root, 24, 12, 2root
 *
 * Explanation:
 * - Moving up two rows (-16) and left one column (-1) results in 1root - 17 = 1
 * - Moving right two columns (+2) and down one row (+root) results in 1root + 1startOfBoardId = 2root
 */

export enum KnightMoveOffsets {
	UP_LEFT = -17,
	UP_RIGHT = -15,
	DOWN_LEFT = 15,
	DOWN_RIGHT = 17,
	LEFT_UP = -10,
	LEFT_DOWN = 6,
	RIGHT_UP = -6,
	RIGHT_DOWN = 10,
}

export enum AdjacentSquareIdOffsets {
	UP = -8,
	UP_RIGHT = -7,
	UP_LEFT = -9,
	RIGHT = 1,
	LEFT = -1,
	DOWN = 8,
	DOWN_RIGHT = 9,
	DOWN_LEFT = 7,
}

export enum ChessPiece {
	PAWN = 'p',
	ROOK = 'r',
	KNIGHT = 'n',
	BISHOP = 'b',
	KING = 'k',
	QUEEN = 'q',
}

export enum Direction {
	VERTICAL = 'v',
	HORIZONTAL = 'h',
	DIAGONAL = 'D',
}

export enum PieceProps {
	COLOUR = 0,
	TYPE = 1,
}

export enum CastlingPiecesColStart {
	ROOK_QUEENSIDE = 0,
	ROOK_KINGSIDE = 7,
	KING = 4,
}

export enum CastlingPiecesColOffset {
	ROOK_QUEENSIDE = 3,
	ROOK_KINGSIDE = -2,
	KING_KINGSIDE = 2,
	KING_QUEENSIDE = -2,
}

export const initBoardState: string[][] = [
	['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
	['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
	['e', 'e', 'e', 'e', 'e', 'e', 'e', 'e'],
	['e', 'e', 'e', 'e', 'e', 'e', 'e', 'e'],
	['e', 'e', 'e', 'e', 'e', 'e', 'e', 'e'],
	['e', 'e', 'e', 'e', 'e', 'e', 'e', 'e'],
	['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
	['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr']
];
