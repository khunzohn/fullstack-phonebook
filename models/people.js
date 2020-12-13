const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const url = process.env.DB_URL

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
  useCreateIndex: true,
})

const personScheme = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    unique: true,
    required: true,
  },
  number: {
    type: String,
    minlength: 8,
    required: true,
  },
})

personScheme.plugin(uniqueValidator)

personScheme.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personScheme)
