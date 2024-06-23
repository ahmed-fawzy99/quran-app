<template>
    <aside id="separator-sidebar"
           class="fixed top-0 z-40 w-64 h-screen transition-transform ltr:-translate-x-full  ltr:sm:translate-x-0
                                                                      rtl:translate-x-full rtl:sm:-translate-x-0"
           aria-label="Sidebar">
        <div
            class="h-full px-3 py-4 overflow-y-auto border-r flex flex-col shadow-sm
            justify-between bg-amber-50 dark:bg-base-800 dark:border-gray-800">
            <ul class="space-y-2 font-medium mb-4 ">
                <div class="flex flex-row items-center">
                    <div class="bg-primary-400 dark:bg-primary-500 h-px flex-grow"></div>
                    <div class=" px-2">{{ $t("My Services") }}</div>
                    <div class="bg-primary-400 dark:bg-primary-500 h-px flex-grow"></div>
                </div>

                <SidebarListItem :item-name="$t('Dashboard')" :hasBadge="false" link="dashboard"
                                 :active-links="['dashboard']">
                    <RocketIcon/>
                </SidebarListItem>

                <SidebarListItem :item-name="$t('Mushaf')" :hasBadge="false" link="mushaf.show"
                                 :active-links="['mushaf.show']">
                    <BookIcon/>
                </SidebarListItem>

                <SidebarListItem :item-name="$t('Playground')" :hasBadge="false" link="playground"
                                 :active-links="['playground']">
                    <BookIcon/>
                </SidebarListItem>

            </ul>
        </div>
    </aside>
</template>
<script>
import SidebarListItem from "@/Components/SidebarListItem.vue";
import RocketIcon from "@/Components/Icons/RocketIcon.vue";
import BookIcon from "@/Components/Icons/BookIcon.vue";

export default {
    name: 'SideNav',
    components: {BookIcon, RocketIcon, SidebarListItem}
}
</script>
<style>

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

</style>
