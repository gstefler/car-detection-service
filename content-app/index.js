const express = require('express')
const app = express()
const port = 80

app.use(express.static('images'))

app.listen(port, () => {
    console.log(`Content service listening at http://localhost:${port}`)
})