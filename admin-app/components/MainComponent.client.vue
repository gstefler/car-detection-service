<script setup lang="ts">
const { data: history, refresh } = await useFetch('/api/history')

useWebSocket('ws://localhost:4000/api/ws', {
	immediate: true,
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
		refresh()
	},
})
</script>
<template>
	<div class="space-y-2">
		<h1 class="text-2xl px-2 py-1 font-semibold">HISTORY</h1>
		<table>
			<tr>
				<th class="px-2 py-1">Label</th>
				<th class="px-2 py-1">Number of cars</th>
			</tr>
			<tr v-for="entry in history">
				<td class="px-2 py-1">{{ entry.label }}</td>
				<td class="px-2 py-1">{{ entry.numberOfCars }}</td>
			</tr>
		</table>
	</div>
</template>
