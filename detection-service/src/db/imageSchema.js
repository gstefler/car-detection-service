import { Repository, Schema } from 'redis-om'
import client from './client.js'

const uploadedImageSchema = new Schema('uploadedImage', {
    label: { type: 'string' },
    numberOfCars: { type: 'number' },
    annotatedFileName: { type: 'string' },
    uploadedAt: { type: 'date' },
    createdAt: { type: 'date' }
})

export default new Repository(uploadedImageSchema, client)