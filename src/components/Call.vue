<template>
    <!-- <app-header /> -->

    <main id="call-app">
        <home-screen v-if="appState === 'idle'" :join-call="joinCall" />
        <call-tile
            v-else-if="['incall', 'request_access'].includes(appState)"
            :leave-call="leaveCall"
            :name="name"
            :room-url="roomUrl"
            :token="token"
            :app-state="appState"
            :update-app-state="updateAppState"
        />
    </main>
</template>

<script>
import CallTile from "./CallTile.vue";
import AppHeader from "./AppHeader.vue";
import HomeScreen from "./HomeScreen.vue";

export default {
    name: "Call",
    components: {
        CallTile,
        AppHeader,
        HomeScreen,
    },
    data() {
        return {
            appState: "idle",
            name: "Guest",
            roomUrl: null,
            token: ""
        };
    },

    mounted() {
        const query = this.$route.query;
        if (query.userName) this.name = query.userName;
        if (query.roomUrl) this.roomUrl = query.roomUrl;
        if (query.appState) this.appState = query.appState;
    },
    methods: {
        /**
         * Set name and URL values entered in Home.vue form in data obj
         */
        joinCall(name, url) {
            this.name = name;
            this.roomUrl = url;
            const parsedUrl = new URL(url)
            const searchParams = new URLSearchParams(parsedUrl.search);
            if (searchParams.has("t")) {
                this.joinwithToken(searchParams.get("t"))
            } else {
                this.joinWithoutToken();
            }
            
        },
        // Reset app state to return to the home screen after leaving call
        leaveCall() {
            this.appState = "idle";
            this.$router.replace({ query: null })
        },

        joinwithToken(token) {
            this.token = token;
            this.appState = "incall";
        },

        joinWithoutToken() {
            alert("Joining without token")
            this.$router.push(`/pre-join?name=${this.name}&roomUrl=${this.roomUrl}`)
        },

        updateAppState(state) {
            this.appState = state;
        }
    },
};
</script>

<style>
#call-app {
    font-family: Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow-x: hidden;
    background-color: #121a24;
}

a {
    text-decoration: none;
    color: #2c3e50;
    display: flex;
    align-items: center;
}

body {
    margin: 0;
}
</style>
