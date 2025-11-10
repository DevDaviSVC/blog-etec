const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Comentario = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    text: {
        type: String,
        required: true
    }
}, { timestamps: true })

mongoose.model('comentarios', Comentario)