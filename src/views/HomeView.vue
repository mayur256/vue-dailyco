<script setup lang="ts">
// Imports
import { useRouter } from 'vue-router';

const router = useRouter();

const handleFormSubmit = (event: Event) => {
    const form = (event.target as HTMLFormElement);
    const name = (form.elements as any).name.value || "";
    

    router.push({
        path: "video-room",
        query: { name }
    })
}

</script>

<template>
    <main class="container mt-4">
        <p>Enter name to enter the room</p>
        <form @submit.prevent="handleFormSubmit">
            <div class="mb-3">
                <label for="exampleInputEmail1" class="form-label">Name</label>
                <input type="text" class="form-control" name="name" required>
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
        </form>
    </main>
</template>
