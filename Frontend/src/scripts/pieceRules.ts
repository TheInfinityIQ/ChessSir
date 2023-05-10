import { boardState, commitCastleToBoard, commitMoveToBoard, endOfBoardId, findKing, findPieceById, getPreviousBoardStateWrapper, getSquareWithIdWrapper, getTestBoard, getTotalMoves, rowValue, startOfBoardId } from "./board";
import { getIsWhitesTurn, selectedIPiece, toggleTurns } from "./state";
import { type IPiece, type IMove, Move, type moveBool, type npBool } from "./types";

enum CastlingPiecesId {
    WHITE_ROOK_QUEENSIDE = 56,
    WHITE_ROOK_KINGSIDE = endOfBoardId,
    BLACK_ROOK_QUEENSIDE = 0,
    BLACK_ROOK_KINGSIDE = 7,
    WHITE_KING = 0,
    BLACK_KING = 4,
}

enum CastlingPiece {
    QUEENSIDE_ROOK = 0,
    KINGSIDE_ROOK = 1,
    KING = 2,
}

enum KnightMoveOffsets {
    UP_LEFT = -17,
    UP_RIGHT = -15,
    DOWN_LEFT = 15,
    DOWN_RIGHT = 17,
    LEFT_UP = -10,
    LEFT_DOWN = 6,
    RIGHT_UP = -6,
    RIGHT_DOWN = 10,
}

enum AdjacentSquareIdOffsets {
    UP = -rowValue,
    UP_RIGHT = -7,
    UP_LEFT = -9,
    RIGHT = 1,
    LEFT = -1,
    DOWN = rowValue,
    DOWN_RIGHT = 9,
    DOWN_LEFT = 7,
}

enum ChessPiece {
    PAWN = "p",
    ROOK = "r",
    KNIGHT = "n",
    BISHOP = "b",
    KING = "k",
    QUEEN = "q",
}

enum Direction {
    VERTICAL = "v",
    HORIZONTAL = "h",
    DIAGONAL = "D",
}

enum PieceComp {
    COLOUR = 0,
    TYPE = 1,
}

let hasPieceMoved = new Map<number, boolean>([
    [CastlingPiecesId.WHITE_ROOK_QUEENSIDE, false],
    [CastlingPiecesId.WHITE_ROOK_KINGSIDE, false],
    [CastlingPiecesId.BLACK_ROOK_QUEENSIDE, false],
    [CastlingPiecesId.BLACK_ROOK_KINGSIDE, false],
    [CastlingPiecesId.WHITE_KING, false],
    [CastlingPiecesId.BLACK_KING, false],
]);

// Value modifying functions
// --------------------

export const makeMove = (newSquare: IPiece) => {
    if (
        (!newSquare.id && newSquare.id != startOfBoardId) ||
        newSquare.colour === undefined ||
        newSquare.piece === undefined
    ) {
        console.error(`Error in makeMove. One of the values below are undefined or falsy\n
        newSquare.id ${newSquare.id}\n
        newSquare.colour ${newSquare.colour}\n
        newSquare.piece ${newSquare.piece}`);
        return;
    }

    let move: IMove = new Move(selectedIPiece(), newSquare);

    if (!validMove(move)) return;

    commitMoveToBoard(move);
    toggleTurns();
};

const validMove: moveBool = (move: IMove) => {
    //Call corresponding piece type to validate a move for that piece
    const pieceType: string = move.fromSquare.piece[PieceComp.TYPE];
    const pieceColour: string = move.fromSquare.piece[PieceComp.COLOUR];
    const piece: ChessPiece | undefined = getChessPieceFromLetter(pieceType);

    if (getIsWhitesTurn() && pieceColour === "b") return false;
    if (!getIsWhitesTurn() && pieceColour === "w") return false;

    // if piece or moveValidators.get(piece) is falsy, then return () => false
    const validator: moveBool = piece ? moveValidators.get(piece) ?? (() => false) : () => false;

    if (move.fromSquare.piece[PieceComp.TYPE] !== "k" && getTotalMoves() > startOfBoardId) {
        if(isKingInCheckAfterMove(move)) return false;
    }
    return validator(move);
};

const validPawnMove: moveBool = (move: IMove) => {
    const { fromSquare, toSquare } = move;
    const pieceColour = fromSquare.piece[PieceComp.COLOUR];
    const opponentColour = pieceColour === "w" ? "b" : "w";
    const dir = determineDirection(move);

    const idDiff = fromSquare.id - toSquare.id;
    const isDirectionCorrect = pieceColour === "w" ? idDiff > startOfBoardId : idDiff < startOfBoardId;
    if (!isDirectionCorrect) return false;

    const fromRowId = Math.floor(fromSquare.id / rowValue);
    const isStartingSquare = pieceColour === "w" ? fromRowId === 6 : fromRowId === 1;
    const rowDiff = Math.abs(fromRowId - Math.floor(toSquare.id / rowValue));
    if ((rowDiff === 2 && !isStartingSquare) || rowDiff > 2) return false;
    if (rowDiff === 2 && dir === Direction.DIAGONAL) return false;

    const isVerticalMove = dir === Direction.VERTICAL && toSquare.piece === "e";
    const isDiagonalMove =
        dir === Direction.DIAGONAL && !isFriendlyPiece(fromSquare.piece[startOfBoardId], toSquare.id);

    if (!isVerticalMove && !isDiagonalMove) return false;

    if (isDiagonalMove && toSquare.piece === "e") {
        if (!isValidEnPassant(fromSquare, toSquare, pieceColour, opponentColour)) return false;
    }

    return !isJumpingPiece(move);
};

const isValidEnPassant = (
    fromSquare: IPiece,
    toSquare: IPiece,
    pieceColour: string,
    opponentColour: string
) => {
    const prevBoard = getPreviousBoardStateWrapper();
    const opponentPawn = `${opponentColour}${ChessPiece.PAWN}`;
    const opponentCheckSquareId = pieceColour === "w" ? toSquare.id - rowValue : toSquare.id + rowValue;
    //Negative one to get correct orientiation. 
    const attackOffset = ((fromSquare.id % rowValue) - (toSquare.id % rowValue)) * -1;
    const attackedPawnId = attackOffset + fromSquare.id;
    const isEnPassantValid =
        getSquareWithIdWrapper(attackedPawnId).piece === opponentPawn &&
        findPieceById(opponentCheckSquareId, prevBoard)?.piece === opponentPawn;

    if (isEnPassantValid) {
        const attackedPawnRow = Math.floor(attackedPawnId / rowValue);
        const attackedPawnColumn = Math.floor(attackedPawnId % rowValue);
        boardState[attackedPawnRow][attackedPawnColumn].piece = "e";
        return true;
    }

    return false;
};

const validRookMove: moveBool = (move: IMove) => {
    const fromSquare = move.fromSquare;
    const toSquare = move.toSquare;

    if (
        isJumpingPiece(move) ||
        determineDirection(move) === Direction.DIAGONAL ||
        isFriendlyPiece(fromSquare.piece[startOfBoardId], toSquare.id)
    ) {
        return false;
    }

    const rookStartingIds = [
        CastlingPiecesId.BLACK_ROOK_KINGSIDE,
        CastlingPiecesId.BLACK_ROOK_QUEENSIDE,
        CastlingPiecesId.WHITE_ROOK_QUEENSIDE,
        CastlingPiecesId.WHITE_ROOK_KINGSIDE,
    ];
    const foundRook = rookStartingIds.some((id) => id === fromSquare.id);
    if (foundRook) {
        hasPieceMoved.set(fromSquare.id, true);
    }

    return true;
};

const validKnightMove: moveBool = (move: IMove) => {
    const fromSquare = move.fromSquare;
    const toSquare = move.toSquare;

    const pieceColour = fromSquare.piece[startOfBoardId];

    const validIdsMods = [
        KnightMoveOffsets.UP_LEFT,
        KnightMoveOffsets.UP_RIGHT,
        KnightMoveOffsets.DOWN_LEFT,
        KnightMoveOffsets.DOWN_RIGHT,
        KnightMoveOffsets.LEFT_UP,
        KnightMoveOffsets.LEFT_DOWN,
        KnightMoveOffsets.RIGHT_UP,
        KnightMoveOffsets.RIGHT_DOWN,
    ];

    const validIDs: number[] = [];

    validIdsMods.forEach((value: number) => {
        let modId = value + fromSquare.id;
        const lessThanUpBound = value + fromSquare.id < endOfBoardId;
        const moreThanlowBound = value + fromSquare.id > startOfBoardId;
        const notFriendlyPiece = !isFriendlyPiece(pieceColour, toSquare.id);

        if (lessThanUpBound && moreThanlowBound && notFriendlyPiece) {
            validIDs.push(modId);
        }
    });

    const result = validIDs.some((id) => id === toSquare.id);

    return result;
};

const validBishopMove: moveBool = (move: IMove) => {
    const fromSquare = move.fromSquare;
    const toSquare = move.toSquare;

    const pieceColour = fromSquare.piece[startOfBoardId];

    return !(
        isJumpingPiece(move) ||
        determineDirection(move) === Direction.HORIZONTAL ||
        determineDirection(move) === Direction.VERTICAL ||
        determineDirection(move) !== Direction.DIAGONAL ||
        isFriendlyPiece(fromSquare.piece[startOfBoardId], toSquare.id)
    );
};

const validKingMove: moveBool = (move: IMove) => {
    const fromSquare = move.fromSquare;
    const pieceColour = fromSquare.piece[PieceComp.COLOUR];
    const toSquare = move.toSquare;
    const castlingKingside = move.toSquare.id - move.fromSquare.id > startOfBoardId ? true : false;

    const colDiff = Math.floor(fromSquare.id % rowValue) - Math.floor(toSquare.id % rowValue);
    const rowDiff = Math.floor(fromSquare.id / rowValue) - Math.floor(toSquare.id / rowValue);

    getAdjacentSquares(toSquare.id);

    if (isKingInCheck(toSquare, pieceColour)) return false;
    if (
        Math.abs(colDiff) === 2 &&
        rowDiff === startOfBoardId &&
        isCastlingValid(pieceColour, castlingKingside)
    ) {
        commitCastleToBoard(pieceColour, castlingKingside);
    }
    if (!validQueenMove(move) || isMoreThanOneSquare(move)) return false;

    //Updates to prevent castling
    pieceColour === "w"
        ? hasPieceMoved.set(CastlingPiecesId.WHITE_KING, true)
        : hasPieceMoved.set(CastlingPiecesId.BLACK_KING, true);
    return true;
};

const isCastlingValid = (pieceColour: string, castlingKingside: boolean) => {
    const pieces =
        pieceColour === "w"
            ? [
                  CastlingPiecesId.WHITE_ROOK_QUEENSIDE,
                  CastlingPiecesId.WHITE_ROOK_KINGSIDE,
                  CastlingPiecesId.WHITE_KING,
              ]
            : [
                  CastlingPiecesId.BLACK_ROOK_QUEENSIDE,
                  CastlingPiecesId.BLACK_ROOK_KINGSIDE,
                  CastlingPiecesId.BLACK_KING,
              ];

    const calcIsRoomToCastle: npBool = () => {
        if (castlingKingside) {
            for (
                let position = pieces[CastlingPiece.KING] + AdjacentSquareIdOffsets.RIGHT;
                position < pieces[CastlingPiece.KINGSIDE_ROOK];
                position++
            ) {
                const square = getSquareWithIdWrapper(position);
                if (isKingInCheck(square, pieceColour) || square.piece !== "e") return false;
            }
            return true;
        } else {
            for (
                let position = pieces[CastlingPiece.KING] + AdjacentSquareIdOffsets.LEFT;
                position > pieces[CastlingPiece.QUEENSIDE_ROOK];
                position--
            ) {
                const square = getSquareWithIdWrapper(position);
                if (isKingInCheck(square, pieceColour) || square.piece !== "e") return false;
            }
            
            return true;
        }
    };

    const isRoomToCastle = calcIsRoomToCastle();

    if (isKingInCheck(findKing(pieceColour), pieceColour)) return false;
    if (hasPieceMoved.get(pieces[CastlingPiece.KING]) || !isRoomToCastle) return false;

    if (castlingKingside) {
        if (hasPieceMoved.get(pieces[CastlingPiece.KINGSIDE_ROOK])) return false;
    } else {
        if (hasPieceMoved.get(pieces[CastlingPiece.QUEENSIDE_ROOK])) return false;
    }

    return true;
};

const isKingInCheck = (kingSquare: IPiece, pieceColour: string, board: IPiece[][] = boardState) => {
    const startingId = kingSquare.id;
    const startingRow = Math.floor(startingId / rowValue);
    const startingCol = Math.floor(startingId % rowValue);
    const opponentColour = pieceColour === "w" ? "b" : "w";

    //Knight
    for (const key in KnightMoveOffsets) {
        const offset = KnightMoveOffsets[key as keyof typeof KnightMoveOffsets];
        const testId = offset + startingId;

        let rowDiff = Math.abs(startingRow - Math.floor(testId / rowValue));
        let colDiff = Math.abs(startingCol - Math.floor(testId % rowValue));

        if (rowDiff > 2 || colDiff > 2) break;

        if (testId > startOfBoardId && testId < endOfBoardId) {
            if (findPieceById(testId).piece === opponentColour + "n") {
                // Ensure no out of bounds
                return true;
            }
        }
    }

    //Pawn
    const PawnOffset =
        pieceColour === "w"
            ? [AdjacentSquareIdOffsets.UP_LEFT, AdjacentSquareIdOffsets.UP_RIGHT]
            : [AdjacentSquareIdOffsets.DOWN_LEFT, AdjacentSquareIdOffsets.DOWN_RIGHT];
    for (const offset of PawnOffset) {
        const testId: number = offset + startingId;
        const kingAndPawnColDiff = Math.floor(testId % rowValue) - Math.floor(startingId % rowValue);
        if (Math.abs(kingAndPawnColDiff) > 1) break;

        if (testId > startOfBoardId && testId < endOfBoardId) {
            if (findPieceById(testId, board).piece === opponentColour + "p") {
                return true;
            }
        }
    }

    // Bishop and Queen and King
    const Diagonal = [
        AdjacentSquareIdOffsets.DOWN_LEFT,
        AdjacentSquareIdOffsets.DOWN_RIGHT,
        AdjacentSquareIdOffsets.UP_LEFT,
        AdjacentSquareIdOffsets.UP_RIGHT,
    ];

    for (const offset of Diagonal) {
        let squaresAway: number = 1;
        let testId: number = offset + startingId;
        let rowDiff = startOfBoardId;
        let colDiff = startOfBoardId;

        while (testId > startOfBoardId && testId < endOfBoardId) {
            rowDiff = Math.abs(startingRow - Math.floor(testId / rowValue));
            colDiff = Math.abs(startingCol - Math.floor(testId % rowValue));
            if (rowDiff > squaresAway || colDiff > squaresAway) break;
            
            const testPiece = findPieceById(testId, board).piece;
            const testPieceType = testPiece[PieceComp.TYPE];
        
            if (
                testPieceType === "r" ||
                testPieceType === "n" ||
                testPieceType === "p" ||
                (squaresAway > 1 && testPieceType === "k") ||
                testPiece[PieceComp.COLOUR] === pieceColour
            )
                break;
            if (squaresAway === 1 && testPiece === opponentColour + "k") {
                return true;
            }
            if (testPiece === opponentColour + "q" || testPiece === opponentColour + "b") {
                return true;
            }

            testId = startingId + squaresAway++ * offset;
        }
    }

    // Rook && Queen && King
    const Straigts = [
        AdjacentSquareIdOffsets.UP,
        AdjacentSquareIdOffsets.RIGHT,
        AdjacentSquareIdOffsets.DOWN,
        AdjacentSquareIdOffsets.LEFT,
    ];

    for (const offset of Straigts) {
        let squaresAway: number = 1;
        let testId: number = offset + startingId;
        let rowDiff = startOfBoardId;
        let colDiff = startOfBoardId;

        while (testId > startOfBoardId && testId < endOfBoardId) {
            const testPiece = findPieceById(testId, board).piece;
            const testPieceType = testPiece[PieceComp.TYPE];
            rowDiff = Math.abs(startingRow - Math.floor(testId / rowValue));
            colDiff = Math.abs(startingCol - Math.floor(testId % rowValue));
            if (rowDiff > squaresAway || colDiff > squaresAway) break;
            if (
                testPieceType === "n" ||
                testPieceType === "p" ||
                testPiece === opponentColour + "b" ||
                (squaresAway > 1 && testPieceType === "k") ||
                testPiece[PieceComp.COLOUR] === pieceColour
            )
                break;
            if (squaresAway === 1 && testPiece === opponentColour + "k") {
                return true;
            }
            if (testPiece === opponentColour + "r" || testPiece === opponentColour + "q") {
                return true;
            }

            testId = startingId + squaresAway++ * offset;
        }
    }
};

const validQueenMove: moveBool = (move: IMove) => {
    const fromSquare = move.fromSquare;
    const toSquare = move.toSquare;

    if (
        determineDirection(move) !== Direction.DIAGONAL &&
        determineDirection(move) !== Direction.HORIZONTAL &&
        determineDirection(move) !== Direction.VERTICAL
    ) {
        return false; // Not a valid queen move
    }

    return !(isJumpingPiece(move) || isFriendlyPiece(fromSquare.piece[startOfBoardId], toSquare.id));
};

const moveValidators: Map<ChessPiece, moveBool> = new Map([
    [ChessPiece.PAWN, validPawnMove],
    [ChessPiece.ROOK, validRookMove],
    [ChessPiece.KNIGHT, validKnightMove],
    [ChessPiece.BISHOP, validBishopMove],
    [ChessPiece.KING, validKingMove],
    [ChessPiece.QUEEN, validQueenMove],
]);

const isKingInCheckAfterMove = (move: IMove) => {
    const pieceColour = move.fromSquare.piece[PieceComp.COLOUR];
    let tempBoard = getTestBoard();

    const { fromSquare, toSquare } = move;
    let fromRow: number = Math.trunc(fromSquare.id / rowValue);
    let fromColumn: number = fromSquare.id % rowValue;

    tempBoard[fromRow][fromColumn].piece = "e";

    let toRow: number = Math.trunc(toSquare.id / rowValue);
    let toColumn: number = toSquare.id % rowValue;

    tempBoard[toRow][toColumn].piece = fromSquare.piece;

    return isKingInCheck(findKing(pieceColour, tempBoard), pieceColour, tempBoard);
};

const getChessPieceFromLetter = (letter: string): ChessPiece | undefined => {
    for (const key in ChessPiece) {
        if (ChessPiece[key as keyof typeof ChessPiece] === letter) {
            return ChessPiece[key as keyof typeof ChessPiece];
        }
    }
    return undefined;
};

const isMoreThanOneSquare: moveBool = (move: IMove) => {
    const fromSquare = move.fromSquare;
    const toSquare = move.toSquare;

    const rowDifference = Math.abs(Math.floor(fromSquare.id / rowValue) - Math.floor(toSquare.id / rowValue));
    const colDifference = Math.abs((fromSquare.id % rowValue) - (toSquare.id % rowValue));

    // Check if the move is more than one square away
    if (rowDifference > 1 || colDifference > 1) {
        return true;
    }

    return false;
};

const determineDirection = (move: Move) => {
    const fromSquare = move.fromSquare;
    const toSquare = move.toSquare;

    //Determine if straight line
    const rowDifference = Math.abs(Math.floor(fromSquare.id / rowValue) - Math.floor(toSquare.id / rowValue));
    const colDifference = Math.abs((fromSquare.id % rowValue) - (toSquare.id % rowValue));

    const isDiagonalMove = rowDifference === colDifference;
    const isVerticalMove = rowDifference > startOfBoardId && colDifference === startOfBoardId;
    const isHorizontalMove = rowDifference === startOfBoardId && colDifference > startOfBoardId; // determines if both fromSquare and toSquare are in same row

    if (isDiagonalMove) {
        return Direction.DIAGONAL;
    }

    if (isVerticalMove) {
        return Direction.VERTICAL;
    }

    if (isHorizontalMove) {
        return Direction.HORIZONTAL;
    }

    return;
};

const isJumpingPiece: moveBool = (move: IMove) => {
    const d = determineDirection(move);

    if (d === Direction.DIAGONAL) {
        return jumpingPieceOnDiagonal(move);
    }

    if (d === Direction.VERTICAL) {
        return jumpingPieceOnStraight(move, Direction.VERTICAL);
    }

    if (d === Direction.HORIZONTAL) {
        return jumpingPieceOnStraight(move, Direction.HORIZONTAL);
    }

    // Will only happen if illegal move. Can me moved over to a new function using the log if (!(isDiagonalMove || isVerticalMove || isHorizontalMove)) return true;
    return true;
};

const jumpingPieceOnDiagonal: moveBool = (move: Move) => {
    const fromSquare = move.fromSquare;
    const toSquare = move.toSquare;

    let startId = Math.min(fromSquare.id, toSquare.id);
    let endId = Math.max(fromSquare.id, toSquare.id);

    const rowDiff = Math.abs(Math.floor(fromSquare.id / rowValue) - Math.floor(toSquare.id / rowValue));
    const colDiff = Math.abs((fromSquare.id % rowValue) - (toSquare.id % rowValue));

    if (rowDiff !== colDiff) {
        // The move is not diagonal
        return false;
    }

    let step = rowDiff === colDiff ? 9 : 7;

    // Check if the move is up and left or down and right
    if (
        (fromSquare.id < toSquare.id && fromSquare.id % rowValue > toSquare.id % rowValue) ||
        (fromSquare.id > toSquare.id && fromSquare.id % rowValue < toSquare.id % rowValue)
    ) {
        step = 7;
    }

    // Start checking from the next square in the direction of the move
    startId += step;

    for (let id = startId; id < endId; id += step) {
        const square = getSquareWithIdWrapper(id);
        if (square.piece !== "e") {
            return true;
        }
    }

    return false;
};

const jumpingPieceOnStraight: (param: Move, direction: Direction) => boolean = (
    move: Move,
    direction: Direction
) => {
    const fromSquare = move.fromSquare;
    const toSquare = move.toSquare;

    let startId = Math.min(fromSquare.id, toSquare.id);
    let endId = Math.max(fromSquare.id, toSquare.id);
    let step;

    if (direction === Direction.HORIZONTAL) {
        step = 1;
    } else {
        step = rowValue;
    }

    // Start checking from the next square in the direction of the move
    startId += step;

    for (let id = startId; id < endId; id += step) {
        const square = getSquareWithIdWrapper(id);
        if (square.piece !== "e") {
            return true;
        }
    }

    return false;
};

const isFriendlyPiece: (friendlyColour: string, toSquareId: number) => boolean = (
    friendlyColour: string,
    toSquareId: number
) => {
    const toPiece: string = getSquareWithIdWrapper(toSquareId).piece;

    if (toPiece === "e") return false;

    return toPiece[startOfBoardId] === friendlyColour;
};

const getAdjacentSquares: (checkedSquareId: number) => IPiece[] | undefined = (
    checkedSquareId: number
) => {
    const upperBound = endOfBoardId;
    const lowerBound = startOfBoardId;
    const adjacentPieces: IPiece[] = [];

    for (const key in AdjacentSquareIdOffsets) {
        const offset = AdjacentSquareIdOffsets[key as keyof typeof AdjacentSquareIdOffsets];
        const moddedId = checkedSquareId + offset;

        if (moddedId > lowerBound && moddedId < upperBound) {
            adjacentPieces.push(getSquareWithIdWrapper(moddedId));
        }
    }

    return adjacentPieces;
};