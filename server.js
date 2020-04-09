import express from 'express'
import fs from 'fs'
import http from 'http'
import path from 'path'
import cors from 'cors'
import DEFAULT_CARDS from './taboo-cards.json'
const PORT = process.env.PORT || 5000

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

let cards = DEFAULT_CARDS.map((c, idx) => {
    return Object.assign({}, c, {
        used: false,
        id: idx
    })
})

let app = express()
const server = http.Server(app)

app.set('port', PORT)

app.use('/static', express.static(__dirname + '/build/static'))
app.use(cors())
app.use(express.json())

app.post('/api/cards/shuffle', (req, res) => {
    console.log('POST /api/cards/shuffle')
    try {
        cards = shuffle(cards)
        cards = cards.map((c) => {
            return Object.assign({}, c, {
                used: false
            })
        })
        console.log('cards =', cards)
        res.json({cards})
    } catch (err) {
        console.error(err)
        res.status(500).json({error: err})
    }

})

app.post('/api/cards/:id', (req, res) => {
    console.log(`PATCH /api/cards/${req.params.id}`)
    try {
        const {used} = req.body
        if (used !== true) throw("Patches can only be for used true")
        const {id} = req.params
        console.log('id =', id)
        const idx = cards.findIndex((c) => c.id == id)
        if (idx === -1) throw("Could not find card to update")
        cards[idx] = Object.assign({}, cards[idx], req.body)
        console.log(`cards[${idx}] =`, cards[idx])
        res.json({updated_card: cards[idx]})
    } catch (err) {
        console.error(err)
        res.status(500).json({error: err})
    }
})

app.get('/api/cards', (req, res) => {
    console.log('GET /api/cards')
    try {
        const unused_cards = cards.filter((c) => !c.used)
        res.status(200).json({cards: unused_cards})
    } catch (err) {
        console.error(err)
        res.status(500).json({error: err})
    }
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build/index.html'))
})

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
