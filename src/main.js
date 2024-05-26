import { createApp } from "vue";
import 'sweetalert2/src/sweetalert2.scss'
import daily from "@daily-co/daily-js";
import App from "./components/App.vue";
import { router } from "./router";

window.dailyCo = daily.createCallObject();

createApp(App)
.use(router)
.mount("#app");
