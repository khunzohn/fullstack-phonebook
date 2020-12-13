require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/people')

const app = express()

app.use(express.static('build'))
app.use(express.json())
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      JSON.stringify(req.body),
    ].join(' ')
  })
)
app.use(cors())

app.get('/', (request, response) => {
  response.send('<h1>Hello world</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then((people) => {
    response.json(people)
  })
})

app.get('/info', (request, response) => {
  Person.countDocuments({}, (err, count) => {
    if (err) {
      return response.status(503).end({ error: err })
    } else {
      const info = `Phonebook has info for ${count} people\n\n${new Date()}`
      response.end(info)
    }
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        return response.status(404).json({ error: 'No person found' })
      }
    })
    .catch((err) => next(err))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Person.findOneAndRemove({ _id: id }, (person) => {
    console.log('deleted : ', person)
    response.status(204).end()
  }).catch((err) => next(err))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (!body.name) {
    return response.status(400).json({ error: 'name is missing' })
  }

  if (!body.number) {
    return response.status(400).json({ error: 'number is missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((err) => next(err))
})

app.put('/api/persons/:id', handlePut)

function handlePut(req, res, next) {
  const body = req.body

  const note = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, note, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then((updatedNote) => {
      res.json(updatedNote)
    })
    .catch((err) => next(err))
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'Mulformtted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
