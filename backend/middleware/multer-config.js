const multer = require('multer')

/** Enregistrement en mémoire de l'image chargée */
const storage = multer.memoryStorage()

/** Filtrage du fichier chargé par son extension */
const multerFilter = (req, file, callback) => {
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
