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
    </main>
</template>

<script>

export default {
    name: "PreJoin",
    data() {
        return {
            userName: "",
            roomUrl: "",
        }
    },
    mounted() {
        this.userName = this.$route.query.name;
        this.roomUrl = this.$route.query.roomUrl;

    },
    methods: {
        async initJoin() {
            this.$router.push({ path: '/', query: {
                userName: this.userName,
                roomUrl: this.roomUrl,
                appState: "request_access"
            }});
        }
    }
}
</script>