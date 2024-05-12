<script setup lang="ts">
const selectedFile = ref<File | null>(null)
const label = ref<string>('')

const detectedImagePath = ref<string>('')
const submitting = ref(false)
const successfulUpload = ref(false)

const { status, data, send, open, close } = useWebSocket(
	'ws://localhost:3000/api/ws',
	{
		immediate: false,
		onError(ws, event) {
			console.error(event)
		},
		onConnected(ws) {
			console.log('connected')
		},
		onDisconnected(ws, event) {
			console.log('disconnected')
		},
		onMessage(ws, event) {
			const message = JSON.parse(event.data)
			if (message.success) {
				detectedImagePath.value = message.path
				submitting.value = false
				successfulUpload.value = false
				close()
			}
		},
	}
)

const handleFileChange = (event: Event) => {
	selectedFile.value = event.target?.files[0]
}

async function submit() {
	if (!selectedFile.value) {
		return
	}
	const formData = new FormData()
	formData.append('image', selectedFile.value)
	formData.append('label', label.value)
	submitting.value = true

	try {
		const uuid = await $fetch('/api/upload', {
			method: 'POST',
			body: formData,
		})

		open()
		send(uuid)
		successfulUpload.value = true
	} catch (error) {
		console.error(error)
		submitting.value = false
	}
}
</script>
<template>
	<div class="select-none">
		<h1 class="text-2xl font-medium py-4">Upload Service!</h1>
		<form @submit.prevent="submit" class="flex flex-col space-y-2 mb-2">
			<label for="image"></label>
			<input
				accept="image/jpeg"
				type="file"
				:disabled="submitting"
				@change="handleFileChange"
				required
				id="image" />
			<label for="label">label</label>
			<input
				:disabled="submitting"
				required
				v-model="label"
				class="py-1 px-2 border rounded-md w-1/2"
				id="label"
				type="text" />
			<button
				:disabled="submitting"
				class="p-2 bg-green-500 hover:bg-green-700 disabled:bg-gray-500 disabled:hover:bg-gray-500 text-gray-100 font-semibold rounded-md">
				<span v-if="!submitting">Upload</span>
				<span v-else-if="!successfulUpload">Uploading...</span>
				<span v-else-if="successfulUpload"
					>Successful upload! Detecting...</span
				>
			</button>
		</form>
		<img
			class="rounded-md"
			v-if="detectedImagePath"
			alt="detected image"
			:src="detectedImagePath" />
	</div>
</template>
