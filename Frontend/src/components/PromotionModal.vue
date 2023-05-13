<script setup lang="ts">
import { getIsPromotionActive } from '@/scripts/state';
import { computed } from 'vue';

const isPromotionActiveComputed = computed(() => getIsPromotionActive());

</script>

<template>
	<div class="promotion-modal" v-if="isPromotionActiveComputed.value">
        
    </div>
</template>

<style scoped>

.promotion-modal {
    width: 90%;
    
    height: 100px;

    border: 1px solid black;
}

 


</style>
