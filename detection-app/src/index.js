import '@tensorflow/tfjs'
import { load } from '@tensorflow-models/coco-ssd'
import { decode } from 'jpeg-js'
import amqp from 'amqplib/callback_api.js'
import express from 'express'
import { drawReactangles } from './helpers/index.js'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { init, insertDetection } from './db/index.js'
import path from 'path'

const RMQ_USER = 'user'
const RMQ_PASS = 'password'

let connected = false
const maxRetries = 10
let retryCount = 0

let connection = null

init()

const queue = 'image-upload'
const exchange = 'work-done'

if (!existsSync('images')) {
    mkdirSync('images')
}

const rabbitUrl = `amqp://${RMQ_USER}:${RMQ_PASS}@rabbitmq:5672`

function connectToRabbitMQ() {
    if (retryCount >= maxRetries) {
        console.error('Maximum retries reached. Stopping reconnection attempts.');
        process.exit(1)
    }

    amqp.connect(rabbitUrl, function (error, conn) {
        if (error) {
            console.error('Failed to connect to AMQP server:', error.message)
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
                    durable: false
                })

                ch.assertExchange(exchange, 'fanout', {
                    durable: false
                })

                ch.prefetch(1)

                ch.consume(queue, async (msg) => {
                    if (msg !== null) {
                        const recievedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
                        const messageObject = JSON.parse(msg.content.toString())
                        const imagePath = path.join('images', messageObject.id + '.' + messageObject.extension)
                        const numberOfCars = await detect(imagePath)
                        const metadata = {
                            id: messageObject.id,
                            label: messageObject.label,
                            numberOfCars,
                            annotatedFileName: imagePath,
                            uploadedAt: recievedAt,
                            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        }
                        await insertDetection(metadata)
                        ch.publish(exchange, '', Buffer.from(messageObject.id))
                        ch.ack(msg)
                    }
                }, {
                    noAck: false
                })
            })
        }
    })
}

connectToRabbitMQ()

async function detect(sourceImage) {
    const rawJpeg = readFileSync(sourceImage)
    const rawImageData = decode(rawJpeg, { useTArray: true })
    const model = await load()
    let predictions = await model.detect(rawImageData)
    predictions = predictions.filter(p => p.class === 'car')

    const buffer = drawReactangles(rawImageData, predictions)

    writeFileSync(sourceImage, buffer)

    return predictions.length
}

const app = express()

app.get('/healthz', (req, res) => {
    if (connected) {
        res.status(200).send('OK')
    } else {
        res.status(500).send('Not connected to RabbitMQ')
    }
})

app.listen(80, () => {
    console.log('detection service running on port 80')
})