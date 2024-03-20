<script setup lang="ts">
const API_URL = useRuntimeConfig().public.API_URL

const selectedFile = ref<File | null>(null)

const handleFileChange = (event: Event) => {
	selectedFile.value = event.target?.files[0]
}

const submitting = ref(false)

const responseData = ref<any>(null)

async function submit() {
	if (!selectedFile.value) {
		alert('Please select a file first.')
		return
	}

	const formData = new FormData()
	formData.append('image', selectedFile.value)

	submitting.value = true

	try {
		responseData.value = await $fetch(API_URL + 'detect', {
			method: 'POST',
			body: formData,
		})
	} catch (error) {
		console.error(error)
	} finally {
		submitting.value = false
	}

	console.log(responseData.value)
}
</script>

<template>
	<div class="w-full min-h-screen py-8 bg-purple-50 select-none">
		<Html lang="en" />
		<main class="max-w-lg mx-auto space-y-4">
			<h1 class="text-4xl text-center pb-16">AI car detector</h1>
			<form :class="{
				'opacity-50 cursor-not-allowed': submitting,
				'pointer-events-none': submitting,
			}" @submit.prevent="submit" class="space-y-4" enctype="multipart/form-data">
				<div class="flex flex-col space-y-2">
					<label for="image">To get started, select an image</label>
					<input
						:disabled="submitting"
						@change="handleFileChange"
						accept="image/jpeg" type="file" name="image" id="image"
						class="p-2 border border-gray-500 border-dashed rounded-md" />
					<span class="text-sm text-gray-500">Supported formats: .jpg .jpeg</span>
				</div>
				<button
					v-if="selectedFile"
					:disabled="submitting"
					class="w-full text-neutral-800 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-800 p-2 border transition-all flex items-center justify-center hover:space-x-4 space-x-2 rounded-md border-gray-500 hover:bg-neutral-800 hover:text-purple-50">
					<span v-if="submitting">processing...</span>
					<span v-else>detect</span>
				</button>
			</form>
			<div v-if="responseData">
				<h2>{{ responseData.numberOfCars }} car(s) detected!</h2>
				<img alt="detected-car" class="rounded-md w-full" :src="API_URL + 'uploads/' + responseData.annotatedFileName">
			</div>
		</main>
	</div>
</template>
