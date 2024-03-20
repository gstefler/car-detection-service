import { join } from 'node:path'
import { existsSync, createReadStream } from 'node:fs'

export default defineEventHandler(async (event) => {
	const base = 'data'
	// @ts-ignore
	const filePath = join(base, event.context.params.name)

	if (!existsSync(filePath)) throw createError({
		statusCode: 404,
		statusMessage: 'not found',
	})

	// @ts-ignore
	return  sendStream(event, createReadStream(filePath));
})
