//PACOTES
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const express = require('express')
const handlebars = require('express-handlebars')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
require('dotenv').config();

//Chamando as Rotas externas
const usuarios = require('./routes/usuario')

//Iniciando o Express
const app = express()

//Manipulando pastas
const path = require('path')

//MODELS
const Article = require('./models/Article');

//CONFIGURAÇÕES --------------------------

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
    process.env.MONGO_URL
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
app.use('/usuarios', usuarios);
app.use('/articles', require('./routes/article.js'));

//Index
app.get('/', async (req, res) => {
    const articles = await Article.find().lean().populate("author");
    const isUser = req.user ? true : false;
    res.render('index', {articles, isUser});
})

//Conexão do Servidor --------------------------------
const PORT = 3000
app.listen(PORT, () => {
    console.log('Servidor Iniciado!')
})