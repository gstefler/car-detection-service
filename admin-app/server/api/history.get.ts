import { getDetections } from '#imports'

export default defineEventHandler(async () => {
	return await getDetections()
})
