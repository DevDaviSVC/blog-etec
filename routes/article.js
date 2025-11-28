const express = require("express");
const router = express.Router();

const Article = require("../models/Article");

// Página de criação de artigo

router.get("/create", (req, res) => {
  res.render("usuarios/createArtigo");
});

// Página artigo específico

router.get("/:id", async (req, res) => {
  try {
    
    const { id } = req.params;
    const article = await Article.findById(id).lean().populate("author");

    if (!article) {
      req.flash("error_msg", "Artigo não encontrado.");
      res.redirect("/");
    }

    const isAuthor = req.user && req.user._id.toString() === article.author._id.toString();

    res.render("usuarios/artigo", {article, isAuthor});

  } catch (error) {
    req.flash("error_msg", "Houve algum erro");
    res.redirect("/");
  }
});

// Página de edição de artigo

router.get("/edit/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const article = await Article.findById(id).lean();
    res.render("usuarios/editArtigo", {article});
  } catch (error) {
    req.flash("error_msg", "Erro ao carregar dados do artigo.");
    res.render("/");
  }
});

// POST: Usuário cria um artigo

router.post("/create", async (req, res) => {
  try {
    const { _id: authorId } = req.user
    const { title, content } = req.body;

    await Article.create({ title, text: content, author: authorId });

    req.flash("success_msg", "Artigo criado com sucesso!");
    res.redirect("/");
  } catch (error) {
    req.flash("error_msg", "Erro ao carregar dados do artigo.");
    res.render("/");
  }
});

router.post("/edit/:id", async (req, res) => {
  try {
    const { id: articleId } = req.params;

    const { _id: userId } = req.user;
    const { title, text } = req.body;
    const article = await Article.findById(articleId);
    console.log(article);

    if (article.author.toString() != userId) {
      return res.status(403).json({ message: "Ação não permitida" });
    }

    await Article.findByIdAndUpdate(articleId, { title, text });

    req.flash("success_msg", "Artigo atualizado com sucesso!");
    res.redirect("/");
  } catch (error) {
    req.flash("error_msg", "Erro ao carregar dados do artigo.");
    res.redirect("/");
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    const { id: articleId } = req.params;

    const { _id: userId } = req.user;
    const article = await Article.findById(articleId);

    if (article.author.toString() != userId) {
      return res.status(403).json({ message: "Ação não permitida" });
    }

    await Article.findByIdAndDelete(articleId);

    req.flash("success_msg", "Artigo deletado com sucesso!");
    res.redirect("/");
  } catch (error) {
    req.flash("error_msg", "Erro ao carregar dados do artigo.");
    res.render("/");
  }
});

module.exports = router;
