//PACOTES
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const express = require('express')
const handlebars = require('express-handlebars')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')

//Chamando as Rotas externas
const admin = require('./routes/admin')
const usuarios = require('./routes/usuario')

//Iniciando o Express
const app = express()

//Manipulando pastas
const path = require('path')

//MODELS
require('./models/Comentario')
const Comentario = mongoose.model('comentarios')
const Article = require('./models/Article');

//CONFIGURAÇÕES --------------------------

const {eAdmin, eUser} = require("./helpers/conta.js");

//bodyParser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//HandleBars
app.set('views', path.join(__dirname, 'views'))
app.engine('handlebars', handlebars.engine({ defaultLayout: 'main',
    helpers: {
        eq: (a, b) => a == b
    }
 }))
app.set('view engine', 'handlebars')

//Configurar a pasta pública
app.use(express.static(path.join(__dirname, 'public')))

//Moongose
mongoose.Promise = global.Promise
mongoose
  .connect(
    "mongodb+srv://etecmateriais_db_user:5ZcN0BKa8tyCHphX@blogetec.fmlfuym.mongodb.net/?appName=blogetec"
  )
  .then(() => {
    console.log("Conectado ao Mongo");
  })
  .catch((err) => {
    console.log("Erro: " + err);
  });

//SESSÃO ---------------------------------------------------
//Dados da sessão são armazenados no banco de dados
app.use(session({
    //Chave para Criptografar os cookies da sessão
    secret: 'appcoment',
    //Se a cada requisição tenho que salvar ou não a sessão
    resave: false,
    //Se eu devo ou não salvar sessões anonimas
    saveUninitialized: true,
    //Tempo de duração da sessão (30min)
    cookie: { maxAge: 30 * 60 * 1000 },
}))

//MIDDLEWARE ------------------------------------------------
//Usando o Flash para mandar mensagens
app.use(flash())

//Config passport
require('./config/auth')(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
    // Pegando as informações do usuário logado
    res.locals.user = req.user ? req.user.toObject() : null 

    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
})

//ROTAS -------------------------------------------------------
app.use('/admin', eAdmin, admin);
app.use('/usuarios', usuarios);
app.use('/articles', require('./routes/article.js'));

//Index
app.get('/', async (req, res) => {
    const articles = await Article.find().lean().populate("author");
    res.render('index', {articles});
})

//Contato
app.get('/contato', (req, res) => {
    res.render('contato')
})

//Enviar Contato
app.post('/contato/enviar', (req, res) => {

    //Criando um novo comentário
    const novoComentario = {
        nome: req.body.nome,
        email: req.body.email,
        texto: req.body.texto
    }
    new Comentario(novoComentario).save().then(() => {
        req.flash('success_msg', 'Contato enviado com sucesso!')
        res.redirect('/contato')
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao enviar o contato: ' + err)
        res.redirect('/')
    })
})


//Conexão do Servidor --------------------------------
const PORT = 3000
app.listen(PORT, () => {
    console.log('Servidor Iniciado!')
})