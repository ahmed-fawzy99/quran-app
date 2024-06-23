<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import Card from "@/Components/Card.vue";
import quran from "../public/quran.json";
import {onMounted, ref, watch} from "vue";
import PauseIcon from "@/Components/Icons/PauseIcon.vue";
import PlayIcon from "@/Components/Icons/PlayIcon.vue";
import LoadingSpinner from "@/Components/Icons/LoadingSpinner.vue";
import DropdownSearch from "@/Components/DropdownSearch.vue";
import {normalizeArabic} from "@/Helpers/normalizeArabic.js";
import ArrowUpIcon from "@/Components/Icons/ArrowUpIcon.vue";
import SearchIcon from "@/Components/Icons/SearchIcon.vue";
import {waitForElement} from "@/Helpers/waitForElement.js";
import {useToast} from "vue-toastification";
import ClipboardIcon from "@/Components/Icons/ClipboardIcon.vue";
import {useI18n} from "vue-i18n";
import {debounce} from "lodash";
import PlayWithCircleIcon from "@/Components/Icons/PlayCircleIcon.vue";
import BookIcon from "@/Components/Icons/BookIcon.vue";
import GenericModal from "@/Components/GenericModal.vue";
import {Modal} from 'flowbite';
import InputLabel from "@/Components/InputLabel.vue";
import SpinnerIcon from "@/Components/Icons/SpinnerIcon.vue";
import XIcon from "@/Components/Icons/XIcon.vue";

const i18n = useI18n();
const contentLoading = ref(false);

const surahSelector = ref(localStorage.getItem('surahSelector') ? parseInt(localStorage.getItem('surahSelector')) : 0);
const reciterSelector = ref(localStorage.getItem('reciterSelector') ?? 'ar.alafasy');
const tafsirSelector = ref(localStorage.getItem('tafsirSelector') ?? 'ar.muyassar');
const tafsirTranslationSwitch = ref(localStorage.getItem('tafsirTranslationSwitch') === 'true' || false); // localStorage doesn't store boolean values

const isLoading = ref(false);
const isPlaying = ref(false);
const circlePercentage = ref(0);
const circleCircumference = 25 * 2 * Math.PI;
const surahSearch = ref('');
const scrollTracker = ref(window.scrollY);
const ayahSearchTerm = ref('');
const ayahSearchResults = ref([]);
const availableReciters = ref([]);
const availableTafsirs = ref([]);
const curSurahTafsir = ref([]);
const showOptionsDropdown = ref(false);
const dropdownPosition = ref({top: 0, left: 0});
const ayahClipboard = ref([]); // [text, number]
const bitrates = ['192', '128', '64', '48', '40', '32'];
let tafsirModal = null;


onMounted(() => {
  fetchAvailableReciters();
  fetchAvailableTafsirs();
  fetchSurahTafsir(tafsirSelector.value);
  window.addEventListener('scroll', () => {
    scrollTracker.value = window.scrollY;
  });
  tafsirModal = new Modal(document.getElementById('tafsir-modal'), {backdropClasses: 'bg-base-900/60 dark:bg-base-900/60 fixed inset-0 z-40'});

});

const searchHandler = debounce(() => {
  if (ayahSearchTerm.value.length > 2) {
    ayahSearchResults.value = ayahSearch(ayahSearchTerm.value);
  }
}, 250)

function ayahSearch(term) {
  const regex = new RegExp(normalizeArabic(term), 'g');
  let matches = [];
  const surahs = quran['data']['surahs'];

  for (const surah of surahs) {
    let surahName = surah['name'];
    let surahNumber = surah['number']; // could be inferred from ayah number, but this is more efficient performance-wise
    for (const ayah of surah['ayahs']) {
      if (normalizeArabic(ayah['text']).match(regex)) {
        matches.push([surahName, ayah['text'], ayah['numberInSurah'], surahNumber, ayah['number']]); // ayah['number'] for jumping to ayah
        if (matches.length >= 10) {
          return matches;
        }
      }
    }
  }
  return matches;
}
watch(ayahSearchTerm, searchHandler);
watch(surahSelector, () => {
  curBestBitrate = null;
  localStorage.setItem('surahSelector', surahSelector.value);
  fetchSurahTafsir(tafsirSelector.value);
});
watch(reciterSelector, () => {
  curBestBitrate = null;
  localStorage.setItem('reciterSelector', reciterSelector.value);
});
watch(tafsirSelector, () => {
  fetchSurahTafsir(tafsirSelector.value);
  localStorage.setItem('tafsirSelector', tafsirSelector.value);
});
watch(tafsirTranslationSwitch, () => {
  localStorage.setItem('tafsirTranslationSwitch', tafsirTranslationSwitch.value);
});

function formatTime(seconds) {
  if (!seconds) {
    return "0:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function selectSurah(surahNumber) {
  surahSelector.value = surahNumber - 1;
  document.getElementById("surah-selector" + "surah-selector").click();
}

function togglePlay() {
  const audioElem = document.getElementById("audio-player");
  if (audioElem.src && !audioElem.paused) {
    audioElem.pause();
    isPlaying.value = false;
  } else if (audioElem.src && audioElem.paused) {
    audioElem.play();
    isPlaying.value = true;
  }
}

let curBestBitrate = null;
async function fetchAyahSrc(ayahNumber) {
  if (curBestBitrate){
    return `https://cdn.islamic.network/quran/audio/${curBestBitrate}/${reciterSelector.value}/${ayahNumber}.mp3`
  }
  for (const bitrate of bitrates) {
    let url = `https://cdn.islamic.network/quran/audio/${bitrate}/${reciterSelector.value}/${ayahNumber}.mp3`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        curBestBitrate = bitrate;
        return(url);
      }
    } catch (err) {
      console.log(err);
    }
  }
  useToast().error(i18n.t('Failed to fetch Ayah Audio'));
}

async function playAyah(ayahNumber = null) {
  const audioElem = document.getElementById("audio-player");
  if (!ayahNumber) {
    return;
  }
  audioElem.src = await fetchAyahSrc(ayahNumber);
  const durationElement = document.getElementById("ayah-duration");

  return new Promise((resolve, reject) => {
    isLoading.value = true;
    audioElem.load();
    audioElem.addEventListener("canplay", function () {
      circlePercentage.value = 0; // fix the circle percentage ui bug
      isLoading.value = false;
      audioElem.play();
      isPlaying.value = true;

      audioElem.addEventListener("timeupdate", function () {
        circlePercentage.value = (audioElem.currentTime / audioElem.duration) * 100;
        durationElement.textContent = formatTime(audioElem.currentTime) + ' / ' + (formatTime(audioElem.duration));
      });

      audioElem.addEventListener("error", function (err) {
        useToast().error(i18n.t('Failed to Play Ayah: ') + err);
        reject(err);
      });
      audioElem.addEventListener("ended", function () {
        isPlaying.value = false;
        circlePercentage.value = 0;
        resolve();
      });
    });
  });
}

async function playSurah() {
  let curReciter = reciterSelector.value; // to prevent a bug in surah recitation in case the reciter was changed
  const ayahs = quran['data']['surahs'].find(surah => surah.number === surahSelector.value + 1)['ayahs'];
  for (const ayah of ayahs) {
    if (curReciter !== reciterSelector.value) {
      return;
    }
    toggleAyahHighlight(ayah.number);
    await playAyah(ayah.number);
    toggleAyahHighlight(ayah.number);
  }
}

function toggleAyahHighlight(ayahNumber) {
  waitForElement(ayahNumber).then((el) => {
    el.classList.toggle("bg-amber-300");
    el.classList.toggle("dark:bg-amber-800");
    el.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
  });
}

function scrollToTop() {
  window.scrollTo({top: 0, behavior: 'smooth'});
}

function jumpToAyah(surahNumber, ayahNumber) {
  surahSelector.value = surahNumber;
  ayahSearchTerm.value = '';
  ayahSearchResults.value = [];

  // Highlight the ayah for a few seconds
  waitForElement(ayahNumber).then((el) => {
    el.classList.add("dark:bg-amber-800", "bg-amber-300");
    el.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
    setTimeout(function () {
      el.classList.remove("dark:bg-amber-800", "bg-amber-300");
    }, 6000);
  });
}

function toggleOptionsDropdown(event, ayahText = null, number = null) {
  showOptionsDropdown.value = !showOptionsDropdown.value;
  if (showOptionsDropdown.value) {
    dropdownPosition.value = {
      top: event.clientY + window.pageYOffset + 10,
      left: event.clientX + window.pageXOffset + 10
    };
  }
  if (ayahText || number) {
    ayahClipboard.value = [ayahText, number];
  }
}

function toggleSavedAyah(ayah) {
  waitForElement(ayah).then((el) => {
    el.classList.toggle("bg-red-400");
    el.classList.toggle("dark:bg-red-800");
  });

}

function findSurahByAyahNumber(ayahNumber) {
  for (const surah of quran['data']['surahs']) {
    for (const ayah of surah['ayahs']) {
      if (ayah['number'] === ayahNumber) {
        return surah['number'] - 1;
      }
    }
  }
  return -1;
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(ayahClipboard.value[0]);
    useToast().info(i18n.t('Ayah copied to clipboard!'), {rtl: true});
  } catch (err) {
    useToast().error(i18n.t('Failed to copy Ayah to clipboard: ' + err));
  }
}
async function tafsirAyah(ayahNumber) {
  try {
    contentLoading.value = true;
    const response = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/editions/${tafsirSelector.value}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    document.getElementById("tafsir-modal-header").textContent = data['data'][0].edition.name;
    document.getElementById("tafsir-surah-name").textContent = normalizeArabic(data['data'][0].surah.name, false)
        + ' - ' + i18n.t('Ayah') + ' ' + data['data'][0].numberInSurah.toLocaleString(i18n.locale.value === 'ar' ? 'ar-EG' : 'en');
    document.getElementById("tafsir-ayah").textContent = ayahClipboard.value[0];
    document.getElementById("tafsir-content").textContent = data['data'][0].text;
    contentLoading.value = false;
    tafsirModal.show();
  } catch (err) {
    useToast().error(i18n.t('Failed to fetch Tafsir: ' + err));
    throw err;
  }
}

async function fetchAvailableReciters() {
  try {
    const response = await fetch('https://api.alquran.cloud/v1/edition/format/audio');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    availableReciters.value = data['data'];
  } catch (err) {
    useToast().error(i18n.t('Failed to fetch Reciters: ' + err));
    throw err;
  }
}

async function fetchAvailableTafsirs() {
  try {
    const response = await fetch('https://api.alquran.cloud/v1/edition');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    availableTafsirs.value = data['data'].filter(item => !['quran', 'versebyverse'].includes(item.type) && item.format === 'text')
        .sort((a,b) => a.language === i18n.locale.value ? -1 : 0);
  } catch (err) {
    useToast().error(i18n.t('Failed to fetch Tafsir Editions: ' + err));
    throw err;
  }
}

async function fetchSurahTafsir(tafsirId){
  try {
    contentLoading.value = true;
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahSelector.value + 1}/${tafsirId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    curSurahTafsir.value = data['data']
    contentLoading.value = false;
  } catch (err) {
    useToast().error(i18n.t('Failed to fetch Surah\'s Tafseer: ' + err));
    throw err;
  }
}


document.addEventListener('click', (event) => {
  if (!(event.target.tagName === 'P') &&      // if the click is not on an ayah
      (!(event.target.tagName === 'SPAN')) &&
      showOptionsDropdown.value) {
    showOptionsDropdown.value = false;
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === "Escape" && showOptionsDropdown.value) {
    showOptionsDropdown.value = false;
  } else if (event.key === " " && event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
    event.preventDefault(); // prevent scrolling on spacebar
    togglePlay();
  }
});

</script>

<template>
  <Head :title="$t('Mushaf')"/>


  <Transition>
    <div v-if="contentLoading" class="fixed z-50 w-screen h-screen bg-base-900/80 transition ease-in-out duration-100">
      <XIcon class="m-4 scale-150 float-end cursor-pointer" @click="contentLoading = false"/>
      <SpinnerIcon class="absolute top-1/2 left-1/2 scale-150"/>
    </div>
  </Transition>
  <AuthenticatedLayout>
    <div>
      <!--Options Dropdown-->
      <TransitionGroup name="slide">
        <div v-if="showOptionsDropdown" id="options-dropdown"
             :style="{ top: dropdownPosition.top + 'px', left: dropdownPosition.left + 'px' }"
             class="z-50 absolute rounded-lg bg-white divide-y divide-base-100  shadow w-44 dark:bg-base-700">
          <ul class="py-2 text-sm text-base-700 dark:text-base-200">
            <li>
              <div @click="copyToClipboard"
                   class="flex items-center text-center p-1 hover:bg-base-100 dark:hover:bg-base-600
                                        dark:hover:text-white cursor-pointer w-full">
                <ClipboardIcon class="rtl:mr-1 ltr:ml-1"/>

                <span class="w-full text-center">{{ $t("Copy to Clipboard") }}</span>
              </div>
            </li>
            <li>
              <div @click="showOptionsDropdown = !showOptionsDropdown; tafsirAyah(ayahClipboard[1])"
                   class="flex items-center p-1 text-center hover:bg-base-100 dark:hover:bg-base-600
                                        dark:hover:text-white cursor-pointer w-full">
                <BookIcon class="rtl:mr-1.5 ltr:ml-1.5"/>
                <span class="w-full text-center">{{ $t("Ayah Interpretation") }}</span>
              </div>
            </li>
            <li>
              <div @click="showOptionsDropdown = !showOptionsDropdown; playAyah(ayahClipboard[1])"
                   class="flex items-center text-center hover:bg-base-100 dark:hover:bg-base-600
                                        dark:hover:text-white cursor-pointer w-full">
                <playIcon class="scale-75 rtl:mr-1.5 ltr:ml-1.5"/>
                <span class="w-full text-center">{{ $t("Listen To Ayah") }}</span>
              </div>
            </li>
          </ul>
        </div>
      </TransitionGroup>

      <!--Tafsir Modal-->
      <GenericModal
          custom-trigger
          custom-footer
          modalId="tafsir-modal"
          :footerActionName="$t('Close')"
      >
        <div class="flex flex-col gap-8 text-center p-1">
          <!--Surah Name-->
          <h1 id="tafsir-surah-name" class="text-3xl">Surah Name</h1>
          <hr class="h-px bg-base-200 border-0 dark:bg-base-700">
          <!-- Ayah -->
          <h3 class="text-xl font-kitab inline" dir="rtl">&#xFD3F; <span id="tafsir-ayah">Ayah</span> &#xFD3E;
          </h3>
          <!--Tafseer-->
          <p id="tafsir-content"
             class="text-lg p-4 rounded-2xl bg-base-100 dark:bg-base-900 text-justify [text-align-last:center]">
            Tafseer</p>
        </div>
        <template #customFooter>
          <button type="button" @click="tafsirModal.hide()"
                  class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-700 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
            {{ $t('Close') }}
          </button>
        </template>
      </GenericModal>
    </div>

    <!--Ayah Search-->
    <Card>
      <h1 class="text-2xl mb-4">{{ $t('Search for Ayah') }}</h1>
      <label for="default-search"
             class="mb-2 text-sm font-medium text-base-900 sr-only dark:text-white">{{ $t('Search') }}
      </label>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <SearchIcon/>
        </div>
        <input type="search" id="default-search" v-model="ayahSearchTerm"
               class="block w-full p-4 pl-10 text-sm text-base-900 border border-base-300 rounded-lg
                               bg-base-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-base-700 dark:border-base-600
                               dark:placeholder-base-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
               :placeholder="$t('Enter Ayah Here..')" required>
      </div>
      <div v-if="ayahSearchTerm.length > 0">
        <ul v-if="ayahSearchResults.length > 0"
            class="py-2 text-sm text-base-700 dark:text-base-200 bg-base-50 dark:bg-base-900 shadow-md rounded-lg">
          <li v-for="ayah in ayahSearchResults"
              class="block px-4 py-2 hover:bg-primary-100 dark:hover:bg-base-700 dark:hover:text-white font-kitab cursor-pointer">
            <p @click="jumpToAyah(ayah[3] - 1, ayah[4]) /*(surah number - ayah global number)*/">
              {{ ayah[0] }} - {{ ayah[1] }} - #{{ ayah[2].toLocaleString('ar').toLocaleString('ar-EG') }}
            </p>
          </li>
        </ul>
        <p v-else
           class="py-2 text-sm font-bold text-primary-600  dark:text-base-200 bg-base-50 dark:bg-base-800 shadow-md rounded-lg px-4">
          {{ $t('No results') }}</p>
      </div>
    </Card>


    <!--Mushaf Options-->
    <Card>
      <h1 class="text-2xl mb-4">{{ $t('Mushaf and Recitation Options') }}</h1>
      <div class="flex flex-row h-full w-full justify-between items-center text-center ">
        <!-- Reciter -->
        <div class="border-base-400 dark:border-base-900 w-full min-h-16 p-2">
          <InputLabel for="reciter-id" :value="$t('Reciter')"/>
          <select id="reciter-id" class="bg-base-50 border border-base-300 text-base-900 text-sm rounded-lg
                            focus:ring-primary-500 focus:border-primary-500 block w-full dark:bg-base-700 dark:border-base-600
                            dark:placeholder-base-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  v-model="reciterSelector"
          >
            <option value="">{{ $t('Choose an Reciter') }}</option>
            <option v-for="reciter in availableReciters" :key="reciter.identifier"
                    :value="reciter.identifier">
              {{
                '[' + $t(reciter.language) + '] ' + (i18n.locale.value === 'ar' ? reciter.name : reciter.englishName)
              }}
            </option>
          </select>
        </div>

        <!-- Tafsir -->
        <div class="border-base-400 dark:border-base-900 w-full min-h-16 p-2">
          <InputLabel for="tafsir-id" :value="$t('Tafsir')"/>
          <select id="tafsir-id" class="bg-base-50 border border-base-300 text-base-900 text-sm rounded-lg
                            focus:ring-primary-500 focus:border-primary-500 block w-full dark:bg-base-700 dark:border-base-600
                            dark:placeholder-base-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  v-model="tafsirSelector"
          >
            <option value="">{{ $t('Choose a Tafsir') }}</option>
            <option v-for="tafsir in availableTafsirs" :key="tafsir.identifier" :value="tafsir.identifier">
              {{
                '[' + $t(tafsir.language) + '] ' + (i18n.locale.value === 'ar' ? tafsir.name : tafsir.englishName)
              }}
            </option>
          </select>
        </div>

        <div class="border-base-400 dark:border-base-900 w-full min-h-16 p-2">
          <div class="flex flex-row h-full">
            <div class="w-full h-full">
              <InputLabel for="taf-tar-switch" :value="$t('Show Tafsir / Translation under Ayahs')"/>
              <ul class="items-center w-full text-sm font-medium text-base-900 bg-white border border-base-200 rounded-lg
                            lg:flex dark:bg-base-700 dark:border-base-600 dark:text-white h-full">
                <li class="w-full border-b border-base-200 sm:border-b-0 sm:border-r dark:border-base-600 ">
                  <div class="flex items-center pl-1">
                    <input id="horizontal-list-radio-on" type="radio" :value="true"
                           v-model="tafsirTranslationSwitch" name="list-radio"
                           class="w-4 h-4 text-primary-600 bg-base-100 border-base-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-base-700 dark:focus:ring-offset-base-700 focus:ring-2 dark:bg-base-600 dark:border-base-500 ltr:ml-8 rtl:mr-8">
                    <label for="horizontal-list-radio-on"
                           class="w-full py-2 ml-2 text-sm font-medium text-base-900 dark:text-base-300">{{ $t('On') }}</label>
                  </div>
                </li>
                <li class="w-full border-b border-base-200 sm:border-b-0 sm:border-r dark:border-base-600 ">
                  <div class="flex items-center pl-1">
                    <input id="horizontal-list-radio-off" type="radio" :value="false"
                           v-model="tafsirTranslationSwitch" name="list-radio"
                           class="w-4 h-4 text-primary-600 bg-base-100 border-base-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-base-700 dark:focus:ring-offset-base-700 focus:ring-2 dark:bg-base-600 dark:border-base-500 ltr:ml-8 rtl:mr-8">
                    <label for="horizontal-list-radio-off"
                           class="w-full py-2 ml-2 text-sm font-medium text-base-900 dark:text-base-300">{{ $t('Off') }}</label>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!--Main Mushaf-->
    <Card class="font-kitab !mb-24">
      <!--Surah Info-->
      <div class="text-center">
        <h1 class="font-bold text-5xl p-4">
          {{ quran['data']['surahs'][surahSelector]['name'] }}
        </h1>
        <span>
                    {{
            $t("Ayah Details", {
              englishName: quran['data']['surahs'][surahSelector]['englishName'],
              englishNameTranslation: quran['data']['surahs'][surahSelector]['englishNameTranslation'],
              ayahsCount: quran['data']['surahs'][surahSelector]['ayahs'].length.toLocaleString($i18n.locale),
              revelationType: $t(`revelationTypes.${quran['data']['surahs'][surahSelector]['revelationType']}`),
            })
          }}
                </span>
        <hr class="h-px my-4 bg-base-200 border-0 dark:bg-base-700">
      </div>

      <!-- Ayat El Surah -->
      <div class="text-center text-3xl leading-loose">
        <TransitionGroup>
          <p
              v-for="ayah in quran['data']['surahs'][surahSelector]['ayahs']" :key="ayah.numberInSurah"
              :id="ayah.number"
              class="rounded-2xl hover:bg-primary-300 dark:hover:bg-primary-700
                               hover:cursor-pointer transition ease-linear duration-200"
              dir="rtl"
              @click="toggleOptionsDropdown($event, ayah.text, ayah.number)"
          >
            {{ ayah.text + ' &#xFD3F;' + ayah.numberInSurah.toLocaleString('ar-EG') + '&#xFD3E;' }}

            <span class="block text-lg mb-4 text-primary-900 dark:text-primary-200 font-rubik " v-if="tafsirTranslationSwitch && curSurahTafsir?.ayahs?.length > 0">
                            {{curSurahTafsir.ayahs[ayah.numberInSurah - 1].text}}
                        </span>
          </p>
        </TransitionGroup>
      </div>
    </Card>


    <!--Sticky Info Bar-->
    <div class="flex justify-center">
      <div class="fixed bottom-8 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 h-16 bg-amber-400 rounded-full text-center shadow-md">
        <div class="flex items-center justify-between mx-3 h-full" dir="ltr">
          <!--Media Player-->
          <audio id="audio-player"></audio>
          <div class="flex items-center gap-2">
            <div id="media-player" @click="togglePlay"
                 class="inline-flex items-center justify-center rounded-full ring-1 ring-slate-900/5 shadow-md cursor-pointer">
              <svg height="50" width="50" xmlns="http://www.w3.org/2000/svg" class="overflow-visible">
                <circle
                    id="ayah-audio-percentage"
                    class="text-base-300 fill-white dark:fill-slate-100 stroke-base-500 transition-all duration-500 ease-linear"
                    stroke-width="3"
                    stroke="currentColor"
                    fill="transparent"
                    stroke-linecap="round"
                    r="25"
                    cx="25"
                    cy="25"
                    :stroke-dasharray="circleCircumference"
                    :stroke-dashoffset="circleCircumference - circlePercentage / 100 * circleCircumference"
                />
                <foreignObject x="10" y="10" width="30" height="30" class="overflow-visible">
                  <LoadingSpinner v-if="isLoading"/>
                  <div v-else>
                    <PauseIcon class="text-slate-900 dark:text-slate-700" v-if="isPlaying"/>
                    <PlayIcon class="text-slate-900 dark:text-slate-700" v-else/>
                  </div>
                </foreignObject>
              </svg>
            </div>
            <span v-show="isLoading">Loading Ayah...</span>
            <span v-show="!isLoading" id="ayah-duration">0:00 / 0:00</span>
          </div>

          <!--Surah Selector-->
          <button :id="2" @click="playSurah()"
                  class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none
                     focus:ring-primary-300 font-medium rounded-full text-sm lg:px-3 lg:py-2.5 sm:p-1.5 text-center inline-flex
                     items-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
          >
            <PlayWithCircleIcon v-if="i18n.locale.value === 'en'" class="mr-1"/>
            {{ $t("Play Full Surah") }}
            <PlayWithCircleIcon v-if="i18n.locale.value === 'ar'" class="ml-1"/>
          </button>

          <DropdownSearch
              modal-id="surah-selector"
              :btnText="$t('Select Surah') + ' - ' +
                              (i18n.locale.value === 'ar' ?
                                normalizeArabic(quran['data']['surahs'][surahSelector]['name'], false) :
                                quran['data']['surahs'][surahSelector]['englishName'])"
          >
            <template #input>
              <input v-model="surahSearch" type="text" id="input-group-search"
                     class="block w-full lg:p-2 sm:p-1.5 text-sm text-base-900 border border-base-300 rounded-lg
                                  bg-base-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-base-600
                                  dark:border-base-500 dark:placeholder-base-400 dark:text-white
                                  dark:focus:ring-primary-500 dark:focus:border-primary-500"
                     :placeholder="$t('Search for a surah')">
            </template>

            <template #records>
              <li v-for="surah in quran['data']['surahs']
                            .map(surah => ({name: surah.name, englishName: surah.englishName, number:surah.number}))
                            .filter((surah) => (normalizeArabic(surah.name).indexOf(normalizeArabic(surahSearch))) !== -1
                            || (surah.englishName.toLowerCase().indexOf(surahSearch.toLowerCase())) !== -1)"
                  class="flex items-center rounded hover:bg-base-100 dark:hover:bg-base-600" dir="rtl">
                <p @click="selectSurah(surah.number)"
                   class="w-full py-2 text-xl font-medium text-base-900 rounded dark:text-base-300 cursor-pointer font-kitab">
                  {{ surah.name }} - {{ surah.englishName }}</p>
              </li>
            </template>
          </DropdownSearch>
        </div>
      </div>
    </div>


    <!--Scroll to Top Button-->
    <TransitionGroup>
      <div class="fixed bottom-8 ltr:ml-6 rtl:mr-6 bg-primary-500 w-fit h-fit p-2 rounded-full shadow-md cursor-pointer
                    hover:bg-primary-400 transition ease-in-out duration-200"
           id="scroll-to-top-btn"
           @click="scrollToTop"
           v-if="scrollTracker > 250"
      >
        <ArrowUpIcon/>
      </div>
    </TransitionGroup>

  </AuthenticatedLayout>
</template>

<style scoped>
.slide-enter-active {
  transition: all 0.1s ease-in-out;
}

.slide-leave-active {
  transition: all 0.1s linear;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
