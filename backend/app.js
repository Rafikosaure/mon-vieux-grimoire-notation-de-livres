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

/** Connexion à la base de données MongoDB */
mongoose
    .connect(
        `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster-monvieuxgrimoir.betoteu.mongodb.net/?retryWrites=true&w=majority`,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'))

/** Gestion des erreurs CORS */
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

/** Application d'un rate-limit */
app.use(
    rateLimit({
        windowMs: 60 * 1000,
        max: 100,
        message: 'Vous avez atteint la limite de 100 requêtes par minute !',
        headers: true,
    })
)

/** Configuration de Helmet */
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
)

/** Ici : les routeurs de l'application */
app.use('/api/auth', userRoutes)
app.use('/api/books', stuffRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')))

module.exports = app
