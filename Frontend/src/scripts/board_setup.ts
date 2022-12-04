const squares: { id: number, colour: number}[] = []

for (let index = 0; index < 63; index++) {
    squares[index] = {id: index, colour: index%2}
}

export { squares };