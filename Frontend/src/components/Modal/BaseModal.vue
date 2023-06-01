<script setup lang="ts"></script>

<template>
	<transition name="modal">
		<div class="modal-mask" @click="$emit('close')">
			<div class="modal-wrapper">
				<div class="modal-container" @click.stop>
					<header class="modal-header">
						<slot name="header"></slot>
					</header>
					<section class="modal-body">
						<slot></slot>
					</section>
					<footer class="modal-footer">
						<slot name="footer"></slot>
					</footer>
				</div>
			</div>
		</div>
	</transition>
</template>

<style scoped>
.modal-mask {
	/* your styles here */
}

.modal-wrapper {
	/* your styles here */
}

.modal-container {
	width: 90%;
	/* Matches Board max-width */
	max-width: 1000px;
	height: 150px;

	display: flex;
	justify-content: space-evenly;
	align-items: center;

	background-color: #0a0505;
	border: 1px solid #d1d1d1;
	border-radius: 20px;
	box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);

	padding: 20px;
	margin: 20px auto;
}

.modal-header {
	/* your styles here */
}

.modal-body {
	/* your styles here */
}

.modal-footer {
	/* your styles here */
}
</style>
