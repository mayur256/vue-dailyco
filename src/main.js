import { createApp } from "vue";
import 'sweetalert2/src/sweetalert2.scss'

import App from "./components/App.vue";
import { router } from "./router";
createApp(App)
.use(router)
.mount("#app");
