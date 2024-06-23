<script setup>

defineProps({
    href: {
        type: String,
        default: "#",
    },
});
</script>

<template>
    <a
        :href="href"
        class="block w-full px-4 py-2 text-left text-sm leading-5 text-base-700 dark:text-base-200 hover:bg-base-100 dark:hover:bg-base-700 focus:outline-none focus:bg-base-100 dark:focus:bg-base-900 transition duration-150 ease-in-out"
    >
        <slot />
    </a>
</template>
