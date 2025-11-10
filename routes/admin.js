const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

//Chamando o BD Comentario
require('../models/Comentario')
const Comentario = mongoose.model('comentarios')

//Carregando o helper / Pegando somente a função eAdmin
//Colocar o eAdmin em todas as rotas para especificar que somente o Admin pode usar aquela rota
const { eAdmin } = require('../helpers/conta')

//ROTAS
router.get('/', (req, res) => {
    res.render('admin/index')
})

// Rotas para o Admin --------------

// Listar Comentários
router.get('/comentarios', (req, res) => {
    Comentario.find().lean().sort({date: 'desc'})
    .then((comentarios) => {
        res.render('admin/comentarios', {comentarios})
    })
    .catch((erro) => {
        req.flash('error_msg', 'Erro ao carregar os comentários')
        res.redirect('/admin')
    })
})

// Excluir comentario

router.post("/comentarios/delete/:id", async (req, res) => {
    try {
        
        const {id} = req.params;

        const isDeleted = await Comentario.deleteOne({_id: id});

        if (isDeleted) req.flash("success_msg", "Comentário deletado com sucesso!");

        res.redirect("/admin/comentarios");

    } catch (error) {
        req.flash("error_msg", "Erro ao excluir comentário.");
        res.redirect("/admin/comentarios");
        res.status(500).json({message: "Internal server error."});
    }
});

// Formulário de edição de comentário

router.get("/comentarios/edit/:id", async (req, res) => {
    try {
        const {id} = req.params;

        const comentario = await Comentario.findById(id).lean();

        res.render("admin/editComentario", {comentario});
    } catch (error) {
        res.status(500).json("Internal server error.");
        req.flash("error_msg", error.message);
        req.redirect("/admin/comentarios");
    }
});

router.post("/comentarios/edit/:id", async (req, res) => {

    try {
        const {id} = req.params;
        const {texto} = req.body;
        await Comentario.updateOne({_id: id}, {texto});

        req.flash("success_msg", "Edição bem sucedida");
        res.redirect("/admin/comentarios");

    } catch (error) {
        res.status(500).json({message: error.message});
    }

});


module.exports = router