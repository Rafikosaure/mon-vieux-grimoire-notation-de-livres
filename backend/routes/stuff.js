const express = require('express')
const stuffCtrl = require('../controllers/stuff')
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/', auth, stuffCtrl.createBook)


// router.get((req, res, next) => {
//     console.log('Requête reçue !')
//     next()
// })

// router.put((req, res, next) => {
//     res.json({ message: 'Votre requête a bien été reçue !' })
//     next()
// })

// router.delete((req, res, next) => {
//     console.log('Réponse envoyée avec succès !')
// })

module.exports = router