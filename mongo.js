const mongoose = require('mongoose')

if(process.argv.length < 3) {
    console.log('Pliease provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://read-write:%{password}@sandbox.jnf1d.mongodb.net/note-app?retryWrites=true&w=majority`

mongoose.connect(url, { userNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true, useCreateIndex: true})

const noteSchema = new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

const note = Note({
    content: 'HTML is easy',
    date: new Date(),
    important: true,
})

note.save().then(result => {
    console.log('Note saved!')
    mongoose.connection.close()
})