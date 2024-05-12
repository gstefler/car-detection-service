import type { Peer } from 'crossws'
import { onWorkDone } from '#imports'

const peers = new Map<Peer, string>()

export default defineWebSocketHandler({
	open(peer) {
		console.log('opened WS', peer)
		peers.set(peer, '')
	},
	message(peer, message) {
		const value = peers.get(peer)
		if (value === '') {
			const messageText = message.text()
			peers.set(peer, messageText)
		} else {
			console.log('received message from WS', peer.id, message.text())
		}
	},
	close(peer) {
		peers.delete(peer)
		console.log('closed WS', peer)
	},
	error(peer, error) {
		console.log('error on WS', peer, error)
	},
})

onWorkDone((message: string) => {
	console.log('Work done:', message)
	peers.forEach((value, peer) => {
		console.log(value)
		if (value === message) {
			peer.send(
				JSON.stringify({
					success: true,
					path: `http://localhost:5000/${message}.jpg`,
				})
			)
		}
	})
})
