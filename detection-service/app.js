require('@tensorflow/tfjs')
const cocoSsd = require('@tensorflow-models/coco-ssd')
const fs = require('fs')
const jpeg = require('jpeg-js')
const { createCanvas } = require('canvas')
const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const redis = require('redis')

const isDev = process.env.NODE_ENV !== 'prod'

const client = redis.createClient({
	url: isDev ? 'redis://localhost:6379' : 'redis://db:6379',
})

const PORT = 5000

const app = express()

if (!fs.existsSync('content')) {
	fs.mkdirSync('content')
}

app.use(bodyParser.json())
app.use('/content', express.static('content'))

client.connect().then(() => {
	console.log('Redis Client Connected')
})
client.on('error', (err) => console.log('Redis Client Error', err))

const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'content')
	}, filename: function(req, file, cb) {
		const ext = file.originalname.split('.').pop()
		const uniqueFileName = uuidv4() + '.' + ext
		cb(null, uniqueFileName)
	},
})
const upload = multer({ storage: storage })

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
	next()
})

app.post('/detect', async (req, res) => {
	if (!req.body.image) {
		return res.status(400).send('No image data provided.')
	}

	const uploadedAt = new Date().toISOString()

	const base64Image = req.body.image.split(';base64,').pop()
	const imageBuffer = Buffer.from(base64Image, 'base64')

	const rawImageData = jpeg.decode(imageBuffer, {
		useTArray: true,
	})

	const model = await cocoSsd.load()
	let predictions = await model.detect(rawImageData)
	const createdAt = new Date().toISOString()

	predictions = predictions.filter(p => p.class === 'car')
	const numberOfCars = predictions.length

	const canvas = createCanvas(rawImageData.width, rawImageData.height)
	const ctx = canvas.getContext('2d')
	const imageDataCanvas = ctx.createImageData(rawImageData.width, rawImageData.height)
	imageDataCanvas.data.set(rawImageData.data)
	ctx.putImageData(imageDataCanvas, 0, 0)
	ctx.strokeStyle = 'red'
	ctx.lineWidth = 3

	predictions.forEach(p => {
		ctx.beginPath()
		ctx.rect(p.bbox[0], p.bbox[1], p.bbox[2], p.bbox[3])
		ctx.stroke()
	})

	const buffer = canvas.toBuffer('image/jpeg')
	const imageName = uuidv4() + '.jpg'

	fs.writeFileSync(`./content/${imageName}`, buffer)

	const imageData = {
		annotatedFileName: imageName,
		numberOfCars,
		uploadedAt: uploadedAt, // uploadedAt is now equivalent to createdAt
		createdAt,
	}

	await client.set(imageName, JSON.stringify(imageData))

	res.status(201).send(imageData)
})

app.listen(PORT, () => {
	console.log(`service on ${PORT}`)
})