<script setup>

defineProps({
    vl: {
        type: Boolean,
        default: false,
    },
})
</script>

<template>
  <div class="bg-amber-50 p-4 mb-4 dark:bg-neutral-800 shadow-sm rounded-lg min-w-screen">
    <div :class="{'h-full flex flex-col items-center justify-center': vl}">
        <slot />
    </div>
  </div>
</template>
