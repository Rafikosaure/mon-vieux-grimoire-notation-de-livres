const express = require('express')
const stuffCtrl = require('../controllers/stuff')
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')
const router = express.Router()

router.post('/', auth, multer, stuffCtrl.createBook)
router.get('/', stuffCtrl.getAllBooks)
router.get('/:id', stuffCtrl.getOneBook)
router.put('/:id', auth, multer, stuffCtrl.modifyBook)
router.delete('/:id', auth, stuffCtrl.deleteOneBook)

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