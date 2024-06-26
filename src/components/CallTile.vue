<template>
    <main>
        <!-- loading is true when the call is in the "joining-meeting" meeting state -->
        <template v-if="loading">
            <div class="loading-spinner">
                <loading-tile />

                <div v-if="appState === 'request_access'">
                    <h5 style="color:white">Waiting for access!</h5>
                </div>
            </div>
        </template>

        <template v-else>
            <div class="wrapper">
                <template v-if="error">
                    <p class="error-text">{{ error }}</p>
                    <!-- refreshing will leave the call and reset the app state -->
                    <button class="error-button" @click="leaveAndCleanUp">Refresh</button>
                </template>

                <template v-if="showPermissionsError">
                    <permissions-error-msg :reset="leaveAndCleanUp" />
                </template>

                <template v-else>
                    <div :class="screen ? 'tile-container' : 'tile-container full-height'">
                        <template v-if="screen">
                            <screenshare-tile :participant="screen" />
                        </template>

                        <div v-if="participants" class="participants-container">
                            <template v-for="p in participants" :key="p.session_id">
                                <video-tile :participant="p" :handle-video-click="handleVideoClick"
                                    :handle-audio-click="handleAudioClick"
                                    :handle-screenshare-click="handleScreenshareClick" :leave-call="leaveAndCleanUp"
                                    :disable-screen-share="screen && !screen?.local" />
                            </template>

                            <template v-if="count === 1">
                                <waiting-card :url="roomUrl" />
                            </template>
                        </div>
                    </div>
                </template>

                <chat-tile :send-message="sendMessage" :messages="messages" />
            </div>
        </template>
    </main>
</template>

<script>
import daily from "@daily-co/daily-js";
import Swal from 'sweetalert2/dist/sweetalert2.js'


import WaitingCard from "./WaitingCard.vue";
import ChatTile from "./ChatTile.vue";
import VideoTile from "./VideoTile.vue";
import ScreenshareTile from "./ScreenshareTile.vue";
import LoadingTile from "./LoadingTile.vue";
import PermissionsErrorMsg from "./PermissionsErrorMsg.vue";



export default {
    name: "CallTile",
    components: {
        VideoTile,
        WaitingCard,
        ChatTile,
        ScreenshareTile,
        LoadingTile,
        PermissionsErrorMsg,
    },
    props: ["leaveCall", "name", "roomUrl", "token", "appState", "updateAppState"],
    data() {
        return {
            callObject: null,
            participants: null,
            count: 0,
            messages: [],
            error: false,
            loading: false,
            showPermissionsError: false,
            screen: null,
        };
    },
    async mounted() {
        const option = {
            url: this.roomUrl,
            userName: this.name
        };

        if (this.token) option.token = this.token;

        // Assign in data obj for future reference
        this.callObject = window.dailyCo;

        // Join the call with the name set in the Home.vue form
        this.callObject.join(option);

        // Add call and participant event handler
        // Visit https://docs.daily.co/reference/daily-js/events for more event info
        this.callObject.on("joining-meeting", this.handleJoiningMeeting)
            .on("joined-meeting", this.updateParticpants)
            .on("participant-joined", this.updateParticpants)
            .on("participant-updated", this.updateParticpants)
            .on("participant-left", this.updateParticpants)
            .on("error", this.handleError)
            // camera-error = device permissions issue
            .on("camera-error", this.handleDeviceError)
            // app-message handles receiving remote chat messages
            .on("app-message", this.updateMessages)
            .on("waiting-participant-added", this.handleWaitingParticipants)
            .on("waiting-participant-updated", this.handleWaitingParticipants);
    },
    unmounted() {
        if (!this.callObject) return;
        // Clean-up event handlers
        this.callObject
            .off("joining-meeting", this.handleJoiningMeeting)
            .off("joined-meeting", this.updateParticpants)
            .off("participant-joined", this.updateParticpants)
            .off("participant-updated", this.updateParticpants)
            .off("participant-left", this.updateParticpants)
            .off("error", this.handleError)
            .off("camera-error", this.handleDeviceError)
            .off("app-message", this.updateMessages)
            .off("waiting-participant-added", this.handleWaitingParticipants)
            .off("waiting-participant-updated", this.handleWaitingParticipants);
    },
    methods: {
        /**
         * This is called any time a participant update registers.
         * In large calls, this should be optimized to avoid re-renders.
         * For example, track-started and track-stopped can be used
         * to register only video/audio/screen track changes.
         */
        async updateParticpants(e) {
            console.log("[EVENT] ", e);
            if (!this.callObject) return;

            const roomMeta = await this.checkRoomMeta();
            
            const privateRoomAccess = this.appState === "request_access" && roomMeta?.privacy === "private";
            
            if (privateRoomAccess) {
                this.loading = true;
                this.requestRoomAccess();
            }

            const p = this.callObject.participants();
            this.count = Object.values(p).length;
            this.participants = Object.values(p);

            const screen = this.participants.filter((p) => p.screenVideoTrack);
            if (screen?.length && !this.screen) {
                console.log("[SCREEN]", screen);
                this.screen = screen[0];
            } else if (!screen?.length && this.screen) {
                this.screen = null;
            }

            if (!privateRoomAccess) this.loading = false;
        },
        // Add chat message to local message array
        updateMessages(e) {
            console.log("[MESSAGE] ", e.data);
            this.messages.push(e?.data);
        },
        // Show local error in UI when daily-js reports an error
        handleError(e) {
            console.log("[ERROR] ", e);
            this.error = e?.errorMsg;
            this.loading = false;
        },
        // Temporary show loading view while joining the call
        handleJoiningMeeting() {
            this.loading = true;
        },
        // Toggle local microphone in use (on/off)
        handleAudioClick() {
            const audioOn = this.callObject.localAudio();
            this.callObject.setLocalAudio(!audioOn);
        },
        // Toggle local camera in use (on/off)
        handleVideoClick() {
            const videoOn = this.callObject.localVideo();
            this.callObject.setLocalVideo(!videoOn);
        },
        // Show permissions error in UI to alert local participant
        handleDeviceError() {
            this.showPermissionsError = true;
        },
        // Toggle screen share
        handleScreenshareClick() {
            if (this.screen?.local) {
                this.callObject.stopScreenShare();
                this.screen = null;
            } else {
                this.callObject.startScreenShare();
            }
        },
        /**
         * Send broadcast message to all remote call participants.
         * The local participant updates their own message history
         * because they do no receive an app-message Daily event for their
         * own messages.
         */
        sendMessage(text) {
            // Attach the local participant's username to the message to be displayed in ChatTile.vue
            const local = this.callObject.participants().local;
            const message = { message: text, name: local?.user_name || "Guest" };
            this.messages.push(message);
            this.callObject.sendAppMessage(message, "*");
        },
        // leave call, destroy call object, and reset local state values
        leaveAndCleanUp() {
            if (this.screen?.local) {
                this.callObject.stopScreenShare();
            }
            this.callObject.leave().then(() => {
                this.callObject.destroy();

                this.participantWithScreenshare = null;
                this.screen = null;
                this.leaveCall();
            });
        },

        async handleWaitingParticipants(event) {
            // console.log({ waiting: event })
            const waitingParticipants = Object.values(this.callObject.waitingParticipants());
            if (waitingParticipants.length > 0) {
                const result = await Swal.fire({
                    position: "top-end",
                    title: `${waitingParticipants[0].name} wants to join the call`,
                    allowOutsideClick: false,
                    showDenyButton: true,
                    confirmButtonText: "Allow",
                    denyButtonText: "Deny"
                });

                if (result.isConfirmed) {
                    this.grantRoomAccess(waitingParticipants[0].id)
                } else {
                    this.denyRoomAccess(waitingParticipants[0].id)
                }
            }
        },

        grantRoomAccess(id) {
            this.callObject.updateWaitingParticipant(id, { grantRequestedAccess: true })
        },

        denyRoomAccess(id) {
            this.callObject.updateWaitingParticipant(id, { grantRequestedAccess: false })
        },

        async checkRoomMeta() {
            try {
                this.loading = true;
                const room = await this.callObject.room();
                
                const responseJson = await fetch(`${import.meta.env.VITE_DAILY_API_DOMAIN}/rooms/${room.name}`, {
                    headers: {
                        authorization: `Bearer ${import.meta.env.VITE_DAILY_API_KEY}`
                    }
                });
                return await responseJson.json();
                
            } finally {
                this.loading = false
            }
        },

        async requestRoomAccess() {
            try {
                const { access } = await this.callObject.accessState();
                console.log({ access })
                if (access?.level === "lobby") {
                    const { granted } = await this.callObject.requestAccess({
                        name: this.name,
                        access: {
                            level: 'full',
                        },
                    });

                    if (granted) {
                        this.loading = false;
                        this.updateAppState("incall");
                        console.log('👋 Access granted');
                    } else {
                        console.log('❌ Access denied');
                    }
                }
            } catch {

            }
        }
    },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Ropa+Sans&display=swap");

main {
    font-family: "Ropa Sans", sans-serif;
    background-color: #121a24;
    height: 100%;
    position: relative;
}

.wrapper {
    max-width: 1200px;
    margin: auto;
    padding: 0 16px;
    height: 100%;
}

.loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.tile-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.participants-container {
    display: flex;
    margin: 0 -20px;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    width: 100%;
    background-color: #121a24;
    height: inherit;
}

p {
    color: white;
}

.error-text {
    color: #e71115;
}

.full-height {
    height: 100%;
}

.error-button {
    color: #fff;
    background-color: #121a24;
    border: none;
    font-size: 12px;
    border: 1px solid #2b3f56;
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
}
</style>
