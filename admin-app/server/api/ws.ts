import { Peer } from 'crossws'
import { onWorkDone } from '#imports'

const peers: Peer[] = []

export default defineWebSocketHandler({
	open(peer) {
		console.log('opened WS', peer)
		peers.push(peer)
	},
	close(peer) {
		peers.splice(peers.indexOf(peer), 1)
		console.log('closed WS', peer)
	},
	error(peer, error) {
		console.log('error on WS', peer, error)
	},
})

onWorkDone(() => {
	peers.forEach((peer) => {
		peer.send('Work done!')
	})
})
