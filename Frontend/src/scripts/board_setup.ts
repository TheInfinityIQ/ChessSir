const squares: { id: number; colour: number }[] = [];

let startLightRow = true;

for (let count = 0; count < 64; count++) {
    startLightRow = (count / 8) % 2 < 1;
    if (startLightRow) {
        squares[count] = { id: count, colour: count % 2 };
    } else {
        squares[count] = { id: count, colour: ((count % 2) + 1) % 2 };
    }
}

export { squares };
