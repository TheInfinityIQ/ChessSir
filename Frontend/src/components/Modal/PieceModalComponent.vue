<script setup lang="ts">
import { commitPawnPromotionToBoard } from '@/scripts/board';
import { useGameStore } from '@/scripts/state';
import { Piece } from '@/scripts/types';
const store = useGameStore();

const props = defineProps({
	piece: String,
});

function promotePiece() {
	if (!props.piece) {
		console.log(`props.piece is undefined in promotePiece function in PieceModalComponent`);
		return;
	}

	const promotedPiece = new Piece(store.specialContainer.pieceToPromote.id, props.piece, store.specialContainer.pieceToPromote.colour);

	store.specialContainer.selectedPiece = promotedPiece;
	store.specialContainer.pieceToPromote = promotedPiece;
	commitPawnPromotionToBoard(store.specialContainer.moveToPromote);
}
</script>

<template>
	<div class="piece-promotion-container">
		<div :class="props.piece" class="modal-piece" @click="promotePiece"></div>
	</div>
</template>

<style scoped>
.piece-promotion-container {
	width: 60%;
	min-width: 80px;
	max-width: 125px;
	aspect-ratio: 1 / 1;

	display: flex;
	justify-content: center;
	align-items: center;

	background-color: #f7f7f7;
	border: 1px solid #d1d1d1;
	border-radius: 20px;
	box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);

	cursor: pointer;
	transition: all 0.3s ease-in-out;
}

.piece-promotion-container:hover {
	transform: scale(1.1);
	box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-piece {
	width: 70%;
	height: 70%;
	background-size: contain;
	background-repeat: no-repeat;
	background-position: center;
}
</style>
