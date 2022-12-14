const notEmptyPieces: string[] = [
    "br",
    "bn",
    "bb",
    "bq",
    "bk",
    "bb",
    "bn",
    "br",
    "bp",
    "bp",
    "bp",
    "bp",
    "bp",
    "bp",
    "bp",
    "bp",
    "wp",
    "wp",
    "wp",
    "wp",
    "wp",
    "wp",
    "wp",
    "wp",
    "wr",
    "wn",
    "wb",
    "wq",
    "wk",
    "wb",
    "wn",
    "wr",
];

const numOfNotEmptyPieces: number = 32;

const getNotEmptyPieces = () => {
    return notEmptyPieces;
};

const getNumNotEmptyPieces = () => {
    return numOfNotEmptyPieces;
}


export { getNotEmptyPieces, getNumNotEmptyPieces };
