import express from 'express'
import fs from 'fs'
import http from 'http'
import path from 'path'
const PORT = process.env.PORT || 5000

let app = express()
const server = http.Server(app)

app.set('port', PORT)

app.use('/static', express.static(__dirname + '/build/static'))

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'build/index.html'))
})

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
