import { connected } from '#imports'

export default defineEventHandler(() => {
	if (connected) {
		return 200
	} else {
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		})
	}
})
