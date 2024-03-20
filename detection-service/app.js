require('@tensorflow/tfjs')
const cocoSsd = require('@tensorflow-models/coco-ssd')
const fs = require('fs')
const jpeg = require('jpeg-js')
const { createCanvas, loadImage } = require('canvas')
const express = require('express')
const bodyParser = require('body-parser')
const WebSocket = require('ws')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const redis = require('redis')
const client = redis.createClient({
	url: 'redis://db:6379'
})

const PORT = 5000
const WS_PORT = 5001

const app = express()

if (!fs.existsSync('uploads')) {
	fs.mkdirSync('uploads')
}

app.use(bodyParser.json())
app.use('/uploads', express.static('uploads'))

client.connect().then(() => {
	console.log('Redis Client Connected')
})
client.on('error', (err) => console.log('Redis Client Error', err))

const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'uploads')
	},
	filename: function(req, file, cb) {
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

app.post('/detect', upload.single('image'), async (req, res) => {
	if (!req.file) {
		return res.status(400).send('No file uploaded.')
	}

	const uploadedAt = new Date().toISOString()
	const fileName = req.file.filename
	const image = fs.readFileSync(`./uploads/${fileName}`)
	const rawImageData = jpeg.decode(image, {
		useTArray: true
	})

	const model = await cocoSsd.load()

	let predictions = await model.detect(rawImageData)
	const createdAt = new Date().toISOString()

	const canvas = createCanvas(rawImageData.width, rawImageData.height)
	const ctx = canvas.getContext('2d')

	const imageDataCanvas = ctx.createImageData(rawImageData.width, rawImageData.height)
	imageDataCanvas.data.set(rawImageData.data)

	ctx.putImageData(imageDataCanvas, 0, 0)

	ctx.strokeStyle = 'red'
	ctx.lineWidth = 3

	predictions = predictions.filter(p => p.class === 'car')
	const numberOfCars = predictions.length

	predictions.forEach(p => {
		ctx.beginPath()
		ctx.rect(p.bbox[0], p.bbox[1], p.bbox[2], p.bbox[3])
		ctx.stroke()
	})


	const buffer = canvas.toBuffer('image/jpeg')
	const imageName = uuidv4() + '.jpg'

	fs.writeFileSync(`./uploads/${imageName}`, buffer)

	const imageData = {
		originalFileName: fileName,
		annotatedFileName: imageName,
		numberOfCars,
		uploadedAt,
		createdAt
	}

	client.set(imageName, JSON.stringify(imageData))

	res.status(201).send(imageData)
})

app.listen(PORT, () => {
	console.log(`service on ${PORT}`)
})


// const image = fs.readFileSync('./image.jpg')
// const rawImageData = jpeg.decode(image, {
// 	useTArray: true
// })

// async function main() {
// 	const model = await cocoSsd.load()
// 	const predictions = await model.detect(rawImageData)
//
// 	const canvas = createCanvas(rawImageData.width, rawImageData.height)
// 	const ctx = canvas.getContext('2d')
//
// 	const imageDataCanvas = ctx.createImageData(rawImageData.width, rawImageData.height)
// 	imageDataCanvas.data.set(rawImageData.data)
//
// 	ctx.putImageData(imageDataCanvas, 0, 0)
//
// 	ctx.strokeStyle = 'red'
// 	ctx.lineWidth = 3
//
// 	predictions.filter(p => p.class === 'car').forEach(p => {
// 		ctx.beginPath()
// 		ctx.rect(p.bbox[0], p.bbox[1], p.bbox[2], p.bbox[3])
// 		ctx.stroke()
// 	})
//
// 	const buffer = canvas.toBuffer('image/jpeg')
//
// 	if (!fs.existsSync('out')) {
// 		fs.mkdirSync('out')
// 	}
//
// 	fs.writeFileSync('out/image.jpg', buffer)
//
// 	console.log(predictions)
// }
//
// main()