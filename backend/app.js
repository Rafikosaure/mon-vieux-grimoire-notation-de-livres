const express = require('express')
const app = express()
app.use(express.json())
const mongoose = require('mongoose')

mongoose
    .connect(
        'mongodb+srv://rafikbensadi:PaaOckOm0obzGWgQ@cluster-monvieuxgrimoir.betoteu.mongodb.net/?retryWrites=true&w=majority',
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

app.use((req, res, next) => {
    console.log('Requête reçue !')
    next()
})

app.use((req, res, next) => {
    res.status(201)
    next()
})

app.use((req, res, next) => {
    res.json({ message: 'Votre requête a bien été reçue !' })
    next()
})

app.use((req, res, next) => {
    console.log('Réponse envoyée avec succès !')
})

module.exports = app
