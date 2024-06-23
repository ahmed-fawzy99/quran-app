<script setup>

import {initModals} from "flowbite";
import {onMounted} from "vue";


const props = defineProps({
    title: String,
    modalId: String,
    modalHeader: String,
    customFooter: {
        type: Boolean,
        default: false
    },
    footerActionName: {
        type: String,
        default: 'Close'
    },
    hasCancel: {
        type: Boolean,
        default: false
    },
    customTrigger: {
        type: Boolean,
        default: false
    },
});

onMounted(() => {
    if (!props.customTrigger)
        initModals();
});
</script>

<template>
    <!-- Modal toggle -->
    <a v-if="!customTrigger" :data-modal-target="modalId" :data-modal-toggle="modalId"
       class="cursor-pointer text-xs font-medium text-primary-600 dark:text-primary-500 hover:underline">
        {{ title }}
    </a>
    <!-- Main modal -->
    <transition name="modal">
        <div :id="modalId" tabindex="-1" aria-hidden="true"
             class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4
             overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div class="relative w-full max-w-2xl max-h-full">
                <!-- Modal content -->
                <div class="relative bg-white rounded-lg shadow dark:bg-base-800">
                    <!-- Modal header -->
                    <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-base-600 ">
                        <h3 class="text-xl text-base-900 dark:text-white" :id="modalId+'-header'">
                            {{ modalHeader }}
                        </h3>
                        <button type="button"
                                class="text-base-400 bg-transparent hover:bg-base-200 hover:text-base-900 rounded-lg
                                text-sm p-1.5 ltr:ml-auto rtl:mr-auto inline-flex items-center dark:hover:bg-base-600 dark:hover:text-white
                                float-start"
                                :data-modal-hide="modalId">
                            <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                      clip-rule="evenodd"></path>
                            </svg>
                            <span class="sr-only">{{ $t("Close modal") }}</span>
                        </button>
                    </div>
                    <!-- Modal body -->
                    <div class="p-6 space-y-6">
                        <slot/>
                    </div>
                    <!-- Modal footer -->
                    <div
                        class="flex items-center p-6 space-x-2 rtl:space-x-reverse border-t border-base-200 rounded-b dark:border-base-600">
                        <div v-if="customFooter">
                            <slot name="customFooter"></slot>
                        </div>
                        <div v-else>
                            <button :data-modal-hide="modalId" type="button"
                                    class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-700 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                                {{ footerActionName }}
                            </button>
                            <button v-show="hasCancel" :data-modal-hide="modalId" type="button"
                                    class="text-base-500 bg-white hover:bg-base-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg border border-base-200 text-sm font-medium px-5 py-2.5 hover:text-base-900 focus:z-10 dark:bg-base-700 dark:text-base-300 dark:border-base-500 dark:hover:text-white dark:hover:bg-base-600 dark:focus:ring-base-600">
                                {{ $t("Cancel") }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>

</template>
<style scoped>
.modal-enter-active, .modal-leave-active {
    transition: opacity 0.5s;
}
.modal-enter, .modal-leave-to /* .modal-leave-active in <2.1.8 */ {
    opacity: 0;
}
</style>
