<template>
  <!-- <app-header /> -->
  
  <home-screen v-if="appState === 'idle'" :join-call="joinCall" />
  <call-tile
    v-else-if="appState === 'incall'"
    :leave-call="leaveCall"
    :name="name"
    :room-url="roomUrl"
    :token="token"
  />
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
      // this.appState = "incall";
    },
    // Reset app state to return to the home screen after leaving call
    leaveCall() {
      this.appState = "idle";
    },

    joinwithToken(token) {
        this.token = token;
        this.appState = "incall";
    },

    joinWithoutToken() {
        alert("Joining without token")
        this.appState = "incall";
    }
  },
};
</script>

<style>
#app {
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
