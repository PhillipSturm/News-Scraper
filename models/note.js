let mongoose = require('mongoose')

let Schema = mongoose.Schema;

let NoteSchema = new Schema({
    text: String
});

let Note = mongoose.model('Note', NoteSchema);

module.exports = Note;