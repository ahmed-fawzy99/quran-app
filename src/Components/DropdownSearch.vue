<script setup>
import {initDropdowns} from "flowbite";
import {onMounted} from "vue";

const props = defineProps({
    modalId: String,
    btnText: {
        type: String,
        default: "Click Here"
    }
});

onMounted(() => {
    initDropdowns();
});

</script>

<template>
    <button :id="modalId+modalId" :data-dropdown-toggle="modalId" data-dropdown-placement="bottom"
            class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none
            focus:ring-primary-300 font-medium rounded-full text-sm px-5 py-2.5 text-center inline-flex
            items-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
    >
        {{ btnText }}
        <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
             viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="m1 1 4 4 4-4"/>
        </svg>
    </button>

    <!-- Dropdown menu -->
    <div :id="modalId" class="z-10 hidden bg-white rounded-lg shadow w-60 dark:bg-base-700">
        <div class="">
            <label for="input-group-search" class="sr-only">{{ $t("Search") }}</label>
            <div class="relative">
                <div class="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg class="w-4 h-4 text-base-500 dark:text-base-400" aria-hidden="true"
                         xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                </div>
                <slot name="input">

                </slot>
            </div>
        </div>
        <ul class="h-48 px-3 pb-3 overflow-y-auto text-sm text-base-700 dark:text-base-200"
            :aria-labelledby="modalId+modalId">
            <slot name="records"></slot>
        </ul>
    </div>
</template>
