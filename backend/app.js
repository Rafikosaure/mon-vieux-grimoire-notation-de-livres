const express = require('express')
const app = express()
app.use(express.json())
const mongoose = require('mongoose')
const stuffRoutes = require('./routes/stuff')
const userRoutes = require('./routes/user')
const path = require('path')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

mongoose
    .connect(
        `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster-monvieuxgrimoir.betoteu.mongodb.net/?retryWrites=true&w=majority`,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
    )
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    )
    next()
})

app.use(
    rateLimit({
        windowMs: 60 * 1000, // période d'une minute
        max: 100, // nombre de requêtes qu'un utilisateur peut faire dans la période définie
        message: 'Vous avez atteint la limite de 100 requêtes par minutes !', // message que l'utilisateur reçoit lorsque la limite est atteinte
        headers: true, // indique qu'il faut ajouter le nombre de requêtes totales, le nombre de requêtes restantes ainsi que la période d'atteinte avant la prochaine requêtes dans le cas d'une limitation dans les entêtes des réponses
    })
)
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use('/api/auth', userRoutes)
app.use('/api/books', stuffRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')))

module.exports = app
