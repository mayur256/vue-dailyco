<template>
    <main class="container mt-4">
        <div class="row">
            <div class="col-md-8">
                <label for="exampleFormControlInput1" class="form-label">Name</label>
                <input type="text" class="form-control" id="exampleFormControlInput1" placeholder="name@example.com"
                    v-model="userName" />
            </div>

            <div class="col-md-4"><button type="button" class="btn btn-primary" @click="initJoin">Request to
                    Join</button></div>
        </div>

        <div v-if="isWaiting" class="d-flex mt-4">
            <h5>Waiting for room owner to let you in!...</h5>
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
            isWaiting: false
        }
    },
    mounted() {
        this.userName = this.$route.query.name;
        this.roomUrl = this.$route.query.roomUrl;

        const option = {
            url: this.roomUrl
        };

        // Create instance of Daily call object
        const co = daily.createCallObject(option);
        // Assign in data obj for future reference
        this.callObject = co;

    },
    methods: {
        async initJoin() {
            try {
                if (!this.callObject) return;

                await this.callObject.leave();
                await this.callObject.join({ userName: this.userName });
                this.isWaiting = true;
                
                const { access } = this.callObject.accessState();
                
                if (access?.level === "lobby") {
                const { granted } = await this.callObject.requestAccess({
                    name: this.userName,
                    access: {
                        level: 'full',
                    },
                });

                if (granted) {
                    this.waiting = false;
                    console.log('👋 Access granted');
                } else {
                    console.log('❌ Access denied');
                }
            }
            } catch (error) {
                console.log({ error })
            }
        }
    }
}
</script>