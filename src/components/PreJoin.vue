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
                            <option selected>Open this select menu</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                        </select>
                    </div>
                </div>

                <div class="row mb-4">
                    <div class="col-md-12">
                        <label for="exampleFormControlInput1" class="form-label">Speaker</label>
                        <select class="form-select" aria-label="Default select example">
                            <option selected>Open this select menu</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                        </select>
                    </div>
                </div>

                <div class="row mb-4">
                    <div class="col-md-12">
                        <label for="exampleFormControlInput1" class="form-label">Camera</label>
                        <select class="form-select" aria-label="Default select example">
                            <option selected>Open this select menu</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
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
            this.$router.push({
                path: '/', query: {
                    userName: this.userName,
                    roomUrl: this.roomUrl,
                    appState: "request_access"
                }
            });
        }
    }
}
</script>