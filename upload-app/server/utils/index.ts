import amqp from 'amqplib/callback_api.js'

const RMQ_USER = 'user'
const RMQ_PASS = 'password'

const rabbitUrl = `amqp://${RMQ_USER}:${RMQ_PASS}@rabbitmq:5672`

const queue = 'image-upload'
const exchange = 'work-done'

const maxRetries = 8
let retryCount = 0

let connection: amqp.Connection | null = null
let channel: amqp.Channel | null = null
let connected = false

let workDoneCallback: ((msg: string) => void) | null = null

function onWorkDone(callback: (msg: string) => void) {
	workDoneCallback = callback
}

console.log('RabbitMQ loading...')

function connectToRabbitMQ() {
	if (connected) return
	if (retryCount >= maxRetries) {
		console.error('Maximum retries reached. Exiting...')
		process.exit(1)
	}

	amqp.connect(rabbitUrl, function (error0, conn) {
		if (error0) {
			console.error('Failed to connect to AMQP server:', error0.message)
			console.log('Retrying in 5 seconds...')
			retryCount++
			setTimeout(connectToRabbitMQ, 5000)
		} else {
			connected = true
			connection = conn
			console.log('Connected to AMQP server.')
			conn.createChannel(function (error1, ch) {
				if (error1) {
					throw error1
				}

				ch.assertQueue(queue, {
					durable: false,
				})

				ch.assertExchange(exchange, 'fanout', {
					durable: false,
				})

				ch.assertQueue(
					'',
					{
						exclusive: true,
					},
					function (error2, q) {
						if (error2) {
							throw error2
						}

						ch.bindQueue(q.queue, exchange, '')
						ch.consume(
							q.queue,
							function (msg) {
								if (msg?.content) {
									const message = msg.content.toString()
									if (workDoneCallback) {
										console.log('Work done:', message)
										workDoneCallback(message)
									}
								}
							},
							{
								noAck: true,
							}
						)
					}
				)

				channel = ch
			})
		}
	})
}

const sendToQueue = (message: string) => {
	if (channel) {
		channel.sendToQueue(queue, Buffer.from(message))
	} else {
		console.error('Channel is not ready yet.')
	}
}

export { sendToQueue, onWorkDone, connectToRabbitMQ, connected }
