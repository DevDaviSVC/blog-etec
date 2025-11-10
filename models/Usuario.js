const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Usuario = new Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cep: {
        type: Number,
        required: true
    },
    logradouro: {
        type: String,
        required: true
    },
    complemento: {
        type: String,
    },
    bairro: {
        type: String,
        required: true
    },
    localidade: {
        type: String,
        required: true
    },
    uf: {
        type: String,
        required: true
    },
    numero: {
        type: Number,
        required: true
    },
    senha: {
        type: String,
        required: true
    },

    // Quando o valor for 1, quer dizer que o usuário é um admin. Quando for 0, vai ser usuário comum.
    //eAdmin: 0
    eAdmin: {
        type: Number,
        default: 0
    },
})

mongoose.model('usuarios', Usuario)

