import { writeFileSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { sendToQueue } from '#imports'

export default defineEventHandler(async (event) => {
	const formData = await readMultipartFormData(event)
	const image = formData?.filter((file) => file.name === 'image')[0]
	const label = formData?.filter((file) => file.name === 'label')[0]

	if (!image || !label) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Bad Request',
		})
	}

	const imageId = uuidv4()
	const imageExtension = image.filename?.split('.').pop()
	const imagePath = path.join('images', `${imageId}.${imageExtension}`)

	try {
		writeFileSync(imagePath, image.data)
		const labelValue = label.data.toString()
		console.log('Image saved, sending to queue...')
		sendToQueue(
			JSON.stringify({
				id: imageId,
				label: labelValue,
				extension: imageExtension,
			})
		)
	} catch (error) {
		console.error(error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		})
	}

	return imageId
})
