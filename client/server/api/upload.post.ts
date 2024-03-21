import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

export default defineEventHandler(async (event) => {
	const API_URL = process.env.API_URL || 'localhost'
	const API_PORT = process.env.API_PORT || '5000'

	const body = await readBody(event)
	const imageBase64 = body.image

	const URI = 'http://' + API_URL + ':' + API_PORT + '/detect'

	const response = await $fetch<{
		image: string
		metadata: {
			label: string
			annotatedFileName: string
			numberOfCars: number
			uploadedAt: string
			createdAt: string
		}
	}>(URI, {
		method: 'POST',
		body: { image: imageBase64, label: body.label },
	})

	const filePath = 'data/' + response.metadata.annotatedFileName

	if (!existsSync('data')) mkdirSync('data')

	writeFileSync(filePath, Buffer.from(response.image, 'base64'))

	return response.metadata
})
