<template>
    <main class="container-fluid mt-4 d-flex justify-content-center">

        <div class="card w-50">
            <div class="card-img-top">

            </div>
            <div class="card-body">

                <div class="row mb-4">
                    <div class="col-md-12">
                        <label for="exampleFormControlInput1" class="form-label">Name</label>
                        <input type="text" class="form-control" id="exampleFormControlInput1"
                            placeholder="name@example.com" v-model="userName" />
                    </div>
                </div>

                <div class="row mb-4">
                    <div class="col-md-12">
                        <label for="exampleFormControlInput1" class="form-label">Mic</label>
                        <select class="form-select" aria-label="Default select example">
                            <option
                                v-for="mic in audioIn"
                                :key="mic.deviceId"
                                :value="mic.deviceId"
                                @change="updateMic"
                            >
                                {{ mic.label }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="row mb-4">
                    <div class="col-md-12">
                        <label for="exampleFormControlInput1" class="form-label">Speaker</label>
                        <select class="form-select" aria-label="Default select example">
                            <option
                                v-for="speaker in audioOut"
                                :key="speaker.deviceId"
                                :value="speaker.deviceId"
                                @change="updateSpeaker"
                            >
                                {{ speaker.label }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="row mb-4">
                    <div class="col-md-12">
                        <label for="exampleFormControlInput1" class="form-label">Camera</label>
                        <select class="form-select" aria-label="Default select example">
                            <option
                                v-for="camera in videoIn"
                                :key="camera.deviceId"
                                :value="camera.deviceId"
                                @change="updateCamera"
                            >
                                {{ camera.label }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-12">
                        <button type="button" class="btn btn-primary" @click="initJoin">Request to
                            Join</button>
                    </div>
                </div>

            </div>
        </div>
    </main>
</template>

<script>
import daily from "@daily-co/daily-js";

export default {
    name: "PreJoin",
    data() {
        return {
            userName: "",
            roomUrl: "",
            callObject: null,
            audioIn: [],
            audioOut: [],
            videoIn: []
        }
    },
    mounted() {
        this.userName = this.$route.query.name;
        this.roomUrl = this.$route.query.roomUrl;

        // Create instance of Daily call object
        const co = daily.createCallObject();
        // Assign in data obj for future reference
        this.callObject = co;

        this.setupPrejoinScreen();
    },
    methods: {
        async initJoin() {
            this.$router.push({
                path: '/', query: {
                    userName: this.userName,
                    roomUrl: this.roomUrl,
                    appState: "request_access"
                }
            });
        },

        async getDevices() {
            try {
                const audioIn = [];
                const audioOut = [];
                const videoIn = [];
                const devicesArr = await this.callObject.enumerateDevices();
                
                for (const d of (devicesArr?.devices ?? [])) {
                    if (d?.kind === 'audioinput') {
                        audioIn.push(d);
                    } else if (d?.kind === 'audiooutput') {
                        audioOut.push(d);
                    } else if (d?.kind === 'videoinput') {
                        videoIn.push(d);
                    }
                }

                this.audioIn = audioIn;
                this.audioOut = audioOut;
                this.videoIn = videoIn;
            } catch (error) {
                // handle error
                console.log(error)
            }
        },

        setupPrejoinScreen() {
            this.getDevices();
        },

        updateMic(e) {
            this.callObject.setInputDevicesAsync({ audioDeviceId: e.target.value });
        },

        updateSpeaker(e) {
            this.callObject.setOutputDevice({ audioDeviceId: e.target.value });
        },

        updateCamera(e) {
            this.callObject.setInputDevicesAsync({ videoDeviceId: e.target.value });
        }
    }
}
</script>