<script setup lang="ts">
import SideMenuItem from './SideMenuItem.vue';
import type { FunctionalComponent, HTMLAttributes, VNodeProps } from 'vue';
declare const PlayCircleIcon: FunctionalComponent<HTMLAttributes & VNodeProps>;
declare const ArrowPathRoundedSquareIcon: FunctionalComponent<HTMLAttributes & VNodeProps>;
declare const UserPlusIcon: FunctionalComponent<HTMLAttributes & VNodeProps>;

const menuItems: {
	id: number;
	icon: string;
	label: string;
}[] = [
	{ id: 1, icon: 'PlayCircleIcon', label: 'Play' },
	{ id: 2, icon: 'ArrowPathRoundedSquareIcon', label: 'Enable Flip' },
	{ id: 2, icon: 'UserPlusIcon', label: 'Toggle Modal' },
];
</script>

<template>
	<aside class="w-full h-full">
        <h1>menu options</h1>
		<SideMenuItem v-for="item in menuItems" :key="item.id" :icon="item.icon" :label="item.icon" />
	</aside>
</template>

<style scoped></style>
