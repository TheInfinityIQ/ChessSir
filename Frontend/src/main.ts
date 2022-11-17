import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import reset from "./assets/reset.css"
import main from "./assets/main.css"


const app = createApp(App)

app.use(router)

app.mount('#app')
