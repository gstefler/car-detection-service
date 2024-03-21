import { createClient } from "redis"

const client = createClient({
    url: process.env.NODE_ENV !== 'prod' ? 'redis://localhost:6377' : 'redis://db:6379',
})
client.on('error', (err) => console.log('Redis Client Error', err))
client.connect().then(() => {
    console.log('Redis Client Connected')
})

export default client