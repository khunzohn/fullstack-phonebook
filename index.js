const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.static('build'))
app.use(express.json())
app.use(morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req,res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res), 'ms',
        JSON.stringify(req.body)
    ].join(' ')
}))

app.use(cors())

let persons = [
    {
      id: 1,
      name: "Arto Hella",
      number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "040-123456"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "040-123456"
    },
    {
        id: 4,
        name: "Mary Poppendic",
        number: "040-123456"
      }
  ]

app.get('/',(request,response) => {
    response.send('<h1>Hello world</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const entry = persons.length
    const info = `Phonebook has info for ${entry} people\n\n${new Date()}`
    response.end(info)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)

    const person = persons.find(note => note.id === id)
    if(person) {
        response.json(person)
    } else {
        response.status(404).end("No person found")
    }
})
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)

    persons = persons.filter(note => note.id != id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    if(!body.name) {
        return response.status(400).json({ error: "name is missing"})
    }

    if(!body.number) {
        return response.status(400).json({ error: "number is missing"})
    }

    const existingPerson = persons.find(p => {
        return p.name === body.name
    })

    if(existingPerson != null) {
        return response.status(400).json({ error: "name must be unique"})
    }

    const nextId = Math.floor(Math.random() * 10000000)

    const person = {
        id: nextId,
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)

    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})