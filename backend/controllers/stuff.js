const sharp = require('sharp')
const Book = require('../models/Book')
const fs = require('fs')

/** Crée un nouveau livre dans la base de données */
exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book)
    delete bookObject._id
    delete bookObject._userId

    /** Traitement de l'image mémorisée avec le module sharp */
    const { buffer, originalname } = req.file
    const timestamp = Date.now()
    const name = originalname.split(' ').join('_')
    const ref = `${name}-${timestamp}.webp`
    const path = `./images/${ref}`
    sharp(buffer).resize(450).webp().toFile(path)

    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        // imageUrl: `${req.protocol}://${req.get('host')}/images/${ref}`,
        imageUrl: `${process.env.SERVER_ENDPOINT}/images/${ref}`
    })

    book.save()
        .then(() => {
            res.status(201).json({ message: 'Livre enregistré !' })
        })
        .catch((error) => {
            res.status(400).json({ error })
        })
}

/** Affiche dans la page d'accueil tous les livres enregistrés */
exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(400).json({ error }))
}

/** Affiche les données d'un livre précis */
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => res.status(200).json(book))
        .catch((error) => res.status(404).json({ error }))
}

/** Affiche les trois livres les mieux notés */
exports.getBestRatedBooks = (req, res, next) => {
    let booksArray = []
    Book.find()
        .then((books) => {
            for (let book of books) {
                booksArray.push(book)
            }

            const bestRatedBooks = booksArray.sort(
                (x, y) => y.averageRating - x.averageRating
            )
            const threeBestRatedBooks = bestRatedBooks.slice(0, 3)

            res.status(200).json(threeBestRatedBooks)
        })
        .catch((error) => res.status(400).json({ error }))
}

/** Modifie et enregistre les modifications appliquées à un livre */
exports.modifyBook = (req, res, next) => {
    let bookObject = {}
    /** Deux possibilités : la requête contient un fichier image ou non */
    if (req.file) {
        /** Traitement de l'image avec le module sharp */
        const { buffer, originalname } = req.file
        const timestamp = Date.now()
        const name = originalname.split(' ').join('_')
        const ref = `${name}-${timestamp}.webp`
        const path = `./images/${ref}`
        sharp(buffer).resize(450).webp().toFile(path)

        bookObject = {
            ...JSON.parse(req.body.book),
            // imageUrl: `${req.protocol}://${req.get('host')}/images/${ref}`,
            imageUrl: `${process.env.SERVER_ENDPOINT}/images/${ref}`
        }
    } else {
        bookObject = { ...req.body }
    }

    delete bookObject._userId
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message: 'Unauthorized request !' })
            } else {
                Book.updateOne(
                    { _id: req.params.id },
                    { ...bookObject, _id: req.params.id }
                )
                    .then(() => {
                        /** Dans le cas d'une mise à jour avec une nouvelle
                         * image : suppression de l'image remplacée */
                        if (req.file) {
                            const filename = book.imageUrl.split('/images/')[1]
                            fs.unlink(`images/${filename}`, (err) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log('Image obsolète supprimée !')
                                }
                            })
                        }
                        res.status(200).json({ message: 'Livre modifié !' })
                    })
                    .catch((error) => res.status(401).json({ error }))
            }
        })
        .catch((error) => {
            res.status(400).json({ error })
        })
}

/** Attribue une note à un livre et met à jour sa note moyenne */
exports.giveARating = (req, res, next) => {
    const { userId, rating } = req.body

    Book.findOne({ _id: req.params.id }).then((book) => {
        if (userId !== req.auth.userId) {
            res.status(400).json({ message: 'Not authorized !' })
        } else {
            const newRating = {
                userId: userId,
                grade: rating,
            }
            book.ratings.push(newRating)

            const sumGrades = book.ratings
                .map((rating) => rating.grade)
                .reduce((prev, curr) => prev + curr, 0)
            const floatAverageRating = sumGrades / book.ratings.length
            const averageRating = Math.round(floatAverageRating)
            book.averageRating = averageRating

            book.save()
                .then(() => res.status(200).json(book))
                .catch((error) => res.status(401).json({ error }))
        }
    })
}

/** Supprime un livre de la base de données */
exports.deleteOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' })
            } else {
                const filename = book.imageUrl.split('/images/')[1]
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => {
                            res.status(200).json({
                                message: 'Livre supprimé !',
                            })
                        })
                        .catch((error) => res.status(401).json({ error }))
                })
            }
        })
        .catch((error) => {
            res.status(500).json({ error })
        })
}