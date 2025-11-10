const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Article = require('../models/Article');

// POST: Usuário cria um artigo

router.post("/create", async (req, res) => {
    try {
        const { title, text, authorId } = req.body;

        const article = await Article.create({title, text, author: authorId});

        res.status(200).json(article);
        

    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

router.put("/edit/:id", async (req, res) => {
    try {

        const { id: articleId } = req.params;

        const {userId, title, text} = req.body;
        const article = await Article.findById(articleId);
        console.log(article);
        

        if (article.author != userId) {
            return res.status(403).json({ message: "Ação não permitida" });
        }

        await Article.findByIdAndUpdate(articleId, {title, text});

        req.flash('success_msg', 'Artigo atualizado com sucesso!');
        res.redirect("/");


    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id: articleId } = req.params;

    const { userId } = req.body;
    const article = await Article.findById(articleId);

    if (article.author != userId) {
      return res.status(403).json({ message: "Ação não permitida" });
    }

    await Article.findByIdAndDelete(articleId);

    req.flash("success_msg", "Artigo deletado com sucesso!");
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;