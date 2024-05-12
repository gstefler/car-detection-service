import amqp from 'amqplib/callback_api.js'
import mariadb from 'mariadb'

const pool = mariadb.createPool({
	host: 'mariadb',
	user: 'root',
	password: 'password',
	connectionLimit: 5,
	database: 'history',
})

async function getDetections() {
	let conn
	try {
		conn = await pool.getConnection()
		const rows = await conn.query('SELECT * FROM detections')
		return rows
	} catch (err) {
		throw err
	} finally {
		if (conn) conn.end()
	}
}

const RMQ_USER = 'user'
const RMQ_PASS = 'password'

const rabbitUrl = `amqp://${RMQ_USER}:${RMQ_PASS}@localhost:5672`

const exchange = 'work-done'

const maxRetries = 8
let retryCount = 0

let channel: amqp.Channel | null = null
let connected = false

let workDoneCallback: VoidFunction | null = null

function onWorkDone(callback: VoidFunction) {
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
			console.log('Connected to AMQP server.')
			conn.createChannel(function (error1, ch) {
				if (error1) {
					throw error1
				}

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
							function (_) {
								if (workDoneCallback) {
									console.log(
										'Work done recieved on admin service'
									)
									workDoneCallback()
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

export { onWorkDone, connectToRabbitMQ, connected, getDetections }
