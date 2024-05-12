import { connectToRabbitMQ } from '#imports'

export default defineNitroPlugin((nitroApp) => {
	console.log('Starting RabbitMQ plugin...')
	connectToRabbitMQ()
})
