import { chownSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'

export default defineEventHandler(async (event) => {
	const API_URL = process.env.API_URL || 'localhost'
	const API_PORT = process.env.API_PORT || '5000'

	const body = await readBody(event)
	const imageBase64 = body.image

	const URI = 'http://' + API_URL + ':' + API_PORT + '/detect'

	const response = await $fetch(URI, {
		method: 'POST',
		body: JSON.stringify({ image: imageBase64 }),
	})

	// @ts-ignore
	const annotatedFileName = response['annotatedFileName']

	const downloadURI =
		'http://' + API_URL + ':' + API_PORT + '/content/' + annotatedFileName

	const fileBuffer = await $fetch(downloadURI, {
		method: 'GET',
		responseType: 'arrayBuffer',
	})
	const filePath = 'data/' + annotatedFileName

	if (!existsSync('data')) mkdirSync('data')

	// @ts-ignore
	writeFileSync(filePath, Buffer.from(fileBuffer))

	return response
})
