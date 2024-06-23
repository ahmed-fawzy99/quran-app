<script setup>
import {onMounted, ref} from 'vue';
import Dropdown from '@/Components/Dropdown.vue';
import DropdownLink from '@/Components/DropdownLink.vue';
import {useDark, useToggle} from "@vueuse/core";
import {useI18n} from 'vue-i18n'

const { t, locale } = useI18n({ useScope: 'global' })
const showingNavigationDropdown = ref(false);
const isDark = useDark();
const toggleDark = useToggle(isDark);

const locales = {
    'en': ['English','🇺🇸'],
    'ar': ['العربية', '🇵🇸'],
};

onMounted(() => {
    if (localStorage.getItem('locale')) {
        switchLocale(localStorage.getItem('locale'));
    }
});

function switchLocale(newLocale){
    locale.value = newLocale;
    localStorage.setItem('locale', newLocale);
    document.documentElement.setAttribute('dir', newLocale === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLocale);
}

</script>

<template>


    <div>
        <div>
            <div class="min-h-screen bg-white dark:bg-base-900">
                <nav class=" border-b border-gray-300 dark:border-gray-600">
                    <!-- Primary Navigation Menu -->
                    <div class="mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex justify-between h-16">
                            <div class="flex">
                                <div class="block my-auto space-x-8 rtl:space-x-reverse sm:-my-px sm:flex">
                                    <slot name="tabs"></slot>
                                </div>
                            </div>
                            <div class="hidden sm:flex sm:items-center sm:ml-6">
                                <!-- Dark mode Switcher & Settings Dropdown -->
                                <button
                                    @click="toggleDark()"
                                    class="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700
                                    focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700
                                    rounded-lg text-sm p-2.5"
                                >
                                    <svg
                                        id="theme-toggle-dark-icon"
                                        class="w-5 h-5"
                                        :class="isDark ? 'block' : 'hidden'"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
                                        ></path>
                                    </svg>
                                    <svg
                                        id="theme-toggle-light-icon"
                                        class="w-5 h-5"
                                        :class="isDark ? 'hidden' : 'block'"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                        ></path>
                                    </svg>
                                </button>

                                <div class="relative !flex">
                                    <Dropdown align="right" width="48">
                                        <template #trigger>
                                        <span class="inline-flex rounded-md">
                                            <button

                                                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                            >
                                                {{ locales[$i18n.locale][0] }}
                                                <span class="mx-2">{{ locales[$i18n.locale][1]}}</span>
                                            </button>
                                        </span>
                                        </template>

                                        <template #content>
                                            <DropdownLink v-for="locale in Object.keys(locales).filter((locale) => locale !== $i18n.locale)"
                                                          @click="switchLocale(locale)">
                                                <span class="mx-2">{{ locales[locale][1]}}</span>
                                                {{ locales[locale][0] }}
                                            </DropdownLink>
                                        </template>
                                    </Dropdown>
                                </div>
                            </div>

                            <!-- Hamburger -->
                            <div class="-mr-2 flex items-center sm:hidden">
                                <button
                                    @click="showingNavigationDropdown = !showingNavigationDropdown"
                                    class="inline-flex items-center justify-center p-2 rounded-md text-gray-400
                                    hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100
                                    focus:text-gray-500 transition duration-150 ease-in-out"
                                >
                                    <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                        <path
                                            :class="{
                                            hidden: showingNavigationDropdown,
                                            'inline-flex': !showingNavigationDropdown,
                                        }"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            :class="{
                                            hidden: !showingNavigationDropdown,
                                            'inline-flex': showingNavigationDropdown,
                                        }"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Responsive Navigation Menu -->
                    <div
                        :class="{ block: showingNavigationDropdown, hidden: !showingNavigationDropdown }"
                        class="sm:hidden"
                    >

                        <Dropdown align="right" width="48">
                            <template #trigger>
                                        <span class="inline-flex rounded-md">
                                            <button

                                                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                            >
                                                <span></span>
<!--                                                {{ 'locales[$i18n.locale][1] + "  " + locales[$i18n.locale][0]' }}-->
                                            </button>
                                        </span>
                            </template>

                            <template #content>
                                <DropdownLink v-for="locale in Object.keys(locales).filter((locale) => $i18n.locale)"
                                              @click="switchLocale(locale)">
<!--                                    {{ locales[locale][1] + "  " + locales[locale][0]  }}-->
                                </DropdownLink>
                            </template>
                        </Dropdown>
                    </div>
                </nav>

                <!-- Page Content -->
                <main class="mx-4 md:mx-0 py-6  sm:px-6 lg:px-6">
                    <slot/>
                </main>
            </div>
        </div>
    </div>

</template>

<style>

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}



</style>


