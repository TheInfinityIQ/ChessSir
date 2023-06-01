<script setup lang="ts">
import type { FunctionalComponent, HTMLAttributes, VNodeProps } from 'vue';
import { PlayCircleIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
	icon: FunctionalComponent<HTMLAttributes & VNodeProps>;
	label: string;
}>();
</script>

<template>
	<div class='w-full h-10 border flex text-center'>
		<PlayCircleIcon class="h-full"/>
		<p class="flex justify-start items-center w-full h-full">{{ label }}</p>
	</div>
</template>

<style scoped></style>
