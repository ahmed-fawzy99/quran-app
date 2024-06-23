import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'


import { createI18n } from 'vue-i18n';
import Toast, {POSITION} from "vue-toastification";
import "vue-toastification/dist/index.css";

import ar from '@/Lang/ar.json'
import en from '@/Lang/en.json'


// Locale Stuff
let locale = localStorage.getItem('locale') ;
if (!locale) {
    localStorage.setItem('locale', 'ar');
    locale = 'ar';
}

const numberFormats = {
    'en': {
        currency: {
            style: 'currency', currency: 'USD', notation: 'standard'
        },
        decimal: {
            style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2
        },
        percent: {
            style: 'percent', useGrouping: true
        }
    },
    'ar': {
        currency: {
            style: 'currency', currency: 'EGP', useGrouping: true, currencyDisplay: 'symbol'
        },
        decimal: {
            style: 'decimal', minimumSignificantDigits: 2, maximumSignificantDigits: 2
        },
        percent: {
            style: 'percent', useGrouping: true
        }
    }
}
const i18n = createI18n({
    legacy: false,
    locale: locale,
    fallbackLocale: 'ar',
    numberFormats,
    messages: {
        ar: ar,
        en: en,
    },

});

const toastOptions = {
    position: POSITION.TOP_CENTER,
    hideProgressBar: true,
    timeout: 2000,
};

createApp(App)
    .use(i18n)
    .use(Toast, toastOptions)
    .mount('#app')
