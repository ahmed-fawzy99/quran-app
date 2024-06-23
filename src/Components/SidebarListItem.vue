<script setup>

const props = defineProps({
    itemName: String,
    link: String,
    hasBadge: Boolean,
    badge: String,
    badgeContent: String,
    activeLinksRecursive: Array,
    activeLinks: Array, // ['employees.index, employees.create, etc ]
})

</script>

<template>
    <li>
        <a :href="link"
              class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-primary-300 dark:hover:bg-primary-600 dark:text-gray-100 transition duration-100 ease-in-out"
              :class="{'bg-primary-200 dark:bg-primary-700' :
              activeLinksRecursive ? activeLinksRecursive.some(item => $page.url.includes(item)) :
              activeLinks.includes(route().current())
        }">
            <svg aria-hidden="true"
                 class="flex-shrink-0 w-6 h-6 transition duration-75 text-primary-500 dark:text-gray-100"
                 xmlns="http://www.w3.org/2000/svg">
                <slot/>
            </svg>

            <span class="flex-1 mx-3 whitespace-nowrap text">{{ itemName }}</span>

            <span v-if="hasBadge"
                  :class="{'inline-flex items-center justify-center w-3 h-3 p-3 ml-3 text-sm font-medium text-primary-800 bg-primary-100 rounded-full dark:bg-primary-700 dark:text-gray-300': badge === 'number',
                            'inline-flex items-center justify-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-200 rounded-full dark:bg-primary-700 dark:text-gray-300': badge !== 'number'}">
                {{ badgeContent }}
                </span>
        </a>
    </li>
</template>

<style scoped>

</style>
