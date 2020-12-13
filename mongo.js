const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log(
    'Pliease provide the password, name, number as arguments: node mongo.js <password> <name> <number>'
  )
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://admin:${password}@sandbox.jnf1d.mongodb.net/phone-app?retryWrites=true&w=majority`

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
  useCreateIndex: true,
})

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (!name || !number) {
  Person.find({}).then((result) => {
    console.log('phonebook:')
    result.forEach((person) => {
      console.log(person.name, person.number)
    })

    mongoose.connection.close()
  })
} else {
  const person = Person({
    name: name,
    number: number,
  })

  person.save().then(() => {
    console.log('added', name, 'number', number, 'to phonebook')
    mongoose.connection.close()
  })
}
