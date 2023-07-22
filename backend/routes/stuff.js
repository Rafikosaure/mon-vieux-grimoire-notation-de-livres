const express = require('express')
const stuffCtrl = require('../controllers/stuff')
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')
const router = express.Router()

router.get('/bestrating', stuffCtrl.getBestRatedBooks)
router.post('/', auth, multer, stuffCtrl.createBook)
router.get('/', stuffCtrl.getAllBooks)
router.get('/:id', stuffCtrl.getOneBook)
router.put('/:id', auth, multer, stuffCtrl.modifyBook)
router.post('/:id/rating', auth, stuffCtrl.giveARating)
router.delete('/:id', auth, stuffCtrl.deleteOneBook)

module.exports = router
