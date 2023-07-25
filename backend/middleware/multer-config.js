const multer = require('multer')

// Enregistrement de l'image chargée dans la mémoire
const storage = multer.memoryStorage()

// Fonction de filtrage du fichier chargé selon son extension
const multerFilter = (req, file, callback) => {
    console.log(file.mimetype)
    if (
        file.mimetype.split('/')[1] !== 'jpg' &&
        file.mimetype.split('/')[1] !== 'jpeg' &&
        file.mimetype.split('/')[1] !== 'png'
    ) {
        callback(new Error('Fichier non-conforme !'), false)
    } else {
        callback(null, true)
    }
}

module.exports = multer({ storage: storage, fileFilter: multerFilter }).single(
    'image'
)
