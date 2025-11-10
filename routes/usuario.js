const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
// npm i --save bcryptjs 
const bcrypt = require('bcryptjs')
const passport = require('passport')

require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

//Carregando o helper / Pegando somente a função eUser
//Colocar o eUser em todas as rotas para especificar que somente o Usuário Logado pode usar aquela rota
const { eUser } = require('../helpers/conta')

//ROTAS
router.get('/registro', (req, res) => {
    res.render('usuarios/registro')
})

//Registrando o Usuário
router.post('/registro/cad', (req, res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: 'Nome inválido' })
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: 'Email inválido' })
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: 'Senha inválido' })
    }

    if (req.body.senha.length < 4) {
        erros.push({ texto: 'Senha muito curta' })
    }

    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: 'As senhas são diferentes' })
    }

    if (erros.length > 0) {
        res.render('usuarios/registro', { erros: erros })
    } else {
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash('error_msg', 'Já existe uma conta com este e-mail')
                res.redirect('/usuarios/registro')
            } else {

                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    cep: req.body.cep,
                    logradouro: req.body.logradouro,
                    complemento: req.body.complemento,
                    bairro: req.body.bairro,
                    localidade: req.body.localidade,
                    uf: req.body.uf,
                    numero: req.body.numero,
                    senha: req.body.senha,
                    eAdmin: 0
                })

                // Criptografando senha (Hash)
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (err, hash) => {
                        if (err) {
                            req.flash('error_msg', 'Houve um erro ao salvar o usuário')
                            res.redirect('/')
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash('success_msg', 'Cadastro realizado com sucesso!')
                            res.redirect('/')
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao criar o usuário')
                        })
                    })
                })

            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        })
    }
})

//Login
router.get('/login', (req, res) => {
    res.render('usuarios/login')
})

//Autenticando o usuário
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true,
    })(req, res, next)
})

//Logout
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err) }
        res.redirect('/')
    })
})

//Informações da conta
router.get('/conta', eUser, (req, res) => {
    res.render('usuarios/conta')
})

//Editando os dados da conta
router.post('/conta/edit', eUser, (req, res) => {
    Usuario.findOne({ _id: req.body.id }).then((usuario) => {
        usuario.nome = req.body.nome
        usuario.email = req.body.email
        usuario.cep = req.body.cep
        usuario.logradouro = req.body.logradouro
        usuario.complemento = req.body.complemento
        usuario.bairro = req.body.bairro
        usuario.cidade = req.body.cidade
        usuario.uf = req.body.uf
        usuario.numero = req.body.numero

        usuario.save().then(() => {
            req.flash('success_msg', 'Conta editada com sucesso!')
            res.redirect('/')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar as edições da conta')
            res.redirect('/')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao editar a conta')
        res.redirect('/')
    })
})

module.exports = router