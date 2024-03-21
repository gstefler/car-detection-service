import '@tensorflow/tfjs'
import { load } from '@tensorflow-models/coco-ssd'
import { decode } from 'jpeg-js'
import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { drawReactangles } from './helpers/drawReactangles.js'
import repository from './db/imageSchema.js'

const PORT = 5000

const app = express()

app.use((_, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
	next()
})

app.use(express.json({
	limit: '2mb'
}))

app.post('/detect', async (req, res) => {
	if (!req.body.image) {
		return res.status(400).send('No image data provided.')
	} else if (!req.body.label) {
		return res.status(400).send('No label provided.')
	}

	const uploadedAt = new Date().toISOString()

	const base64Image = req.body.image.split(';base64,').pop()
	const imageBuffer = Buffer.from(base64Image, 'base64')

	const rawImageData = decode(imageBuffer, {
		useTArray: true,
	})

	const model = await load()
	let predictions = await model.detect(rawImageData)
	const createdAt = new Date().toISOString()

	predictions = predictions.filter(p => p.class === 'car')
	const numberOfCars = predictions.length

	const buffer = drawReactangles(rawImageData, predictions)

	const imageName = uuidv4() + '.jpg'

	const metadata = {
		label: req.body.label,
		annotatedFileName: imageName,
		numberOfCars,
		uploadedAt,
		createdAt,
	}

	await repository.save(metadata)

	res.status(201).send({
		image: buffer.toString('base64'),
		metadata,
	})
})

app.listen(PORT, () => {
	console.log(`service on ${PORT}`)
})