const multer = require('multer')

// *************** Méthode 1: Enregistrement dans diskStorage() ***************

// const MIME_TYPES = {
//     'image/jpg': 'jpg',
//     'image/jpeg': 'jpg',
//     'image/png': 'png'
// }

// const storage = multer.diskStorage({
//     destination: (req, file, callback) => {
//         callback(null, 'images')
//     },
//     filename: (req, file, callback) => {
//         const name = file.originalname.split(' ').join('_')
//         const extension = MIME_TYPES[file.mimetype]
//         callback(null, name + Date.now() + '.' + extension)
//     }
// })

// *************** Méthode 2: Enregistrement dans memoryStorage() ***************

const storage = multer.memoryStorage()

const multerFilter = (req, file, callback) => {
    console.log(file.mimetype)
    if (file.mimetype.split('/')[1] !== 'jpg' && file.mimetype.split('/')[1] !== 'jpeg' && file.mimetype.split('/')[1] !== 'png') {
        callback(new Error('Fichier non-conforme !'), false)
    } else {
        callback(null, true)
    }
}

module.exports = multer({ storage: storage, fileFilter: multerFilter }).single('image')
