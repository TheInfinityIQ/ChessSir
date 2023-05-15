<script setup lang="ts">
import { computed } from 'vue';
import PieceModalComponent from './PieceModalComponent.vue';
import { useGameStore } from '../scripts/state'
const store = useGameStore();
const promotionPieces = ['q', 'n', 'r', 'b'];
</script>

<template>
	<aside v-if="store.isPromotionActive" class="promotion-modal">
		<PieceModalComponent v-for="pieceType in promotionPieces" :piece="store.pawnPromotionColour + pieceType"></PieceModalComponent>
	</aside>
</template>

<style scoped>
.promotion-modal {
	width: 90%;
	/* Matches Board max-width */
	max-width: 1000px;
	height: 150px;

	display: flex;
	justify-content: space-evenly;
	align-items: center;

	background-color: #f7f7f7;
	border: 1px solid #d1d1d1;
	border-radius: 20px;
	box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);

	padding: 20px;
	margin: 20px auto;
}
</style>
