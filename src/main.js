import './assets/main.css'

import {createApp} from 'vue'
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import {createVuetify} from 'vuetify'
import {aliases, mdi} from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {getAnalytics} from "firebase/analytics";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Initialize Firebase
getAnalytics(initializeApp({
    apiKey: "AIzaSyA-B_KqFuFBUPSFw2XDT9IiteNC9WMmC1M",
    authDomain: "solar-calculator-bdff4.firebaseapp.com",
    projectId: "solar-calculator-bdff4",
    storageBucket: "solar-calculator-bdff4.appspot.com",
    messagingSenderId: "207789509799",
    appId: "1:207789509799:web:395fecac0aff7696985f82",
    measurementId: "G-041HGMYF2S"
}));

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi
        }
    }
})

const app = createApp(App)

app.use(router)
app.use(vuetify)

app.mount('#app')
