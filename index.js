require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/people')

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

app.get('/',(request,response) => {
    response.send('<h1>Hello world</h1>')
})


app.get('/api/persons', (request, response) => {
    Person.find({}).then(people => {
        response.json(people)
    })
})

app.get('/info', (request, response) => {
    const entry = Person.find({}).count
    const info = `Phonebook has info for ${entry} people\n\n${new Date()}`
    response.end(info)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)

    Person.findById(id)
        .then(person => {
            if(person) {
                response.json(person)
            } else {
                response.status(404).json({ error: "No person found"})
            }
        })
        .catch(err => {
            console.log(err)
            response.status(400).json({ error: `Mulformed Id ${id}`})
        })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id

    Person.findOneAndRemove({_id:id},person => {
        console.log("deleted : ", person)
        response.status(204).end()
    })
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    if(!body.name) {
        return response.status(400).json({ error: "name is missing"})
    }

    if(!body.number) {
        return response.status(400).json({ error: "number is missing"})
    }

    Person.find({name:body.name}).then( result => {
        console.log("Existing name found", result)
        if(result.length > 0) {
            return response.status(400).json({ error: "name must be unique"})
        } else {
            const person = new Person(
                {
                    name: body.name,
                    number: body.number
                }
            )
        
            person.save().then(savedPerson => {
                response.json(savedPerson)
            })
        }
    })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})