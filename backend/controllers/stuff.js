const sharp = require('sharp')
const Book = require('../models/book')
const fs = require('fs')

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book)
    delete bookObject._id
    delete bookObject._userId
    
    // Outil Sharp : traitement de l'image chargée
    const { buffer, originalname } = req.file
    const timestamp = Date.now()
    const name = originalname.split(' ').join('_')
    const ref = `${name}-${timestamp}.webp`
    const path = `./images/${ref}`
    sharp(buffer)
        .resize(450)
        .webp({ lossless: true })
        .toFile(path)
    
    // Création du livre (incluant l'image traitée)
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${ref}`
    })
    
    // Enregistrememt du livre
    book.save()
        .then(() => {
            res.status(201).json({ message: 'Livre enregistré !' })
        })
        .catch((error) => {
            res.status(400).json({ error })
        })
}

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(400).json({ error }))
}

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => res.status(200).json(book))
        .catch((error) => res.status(404).json({ error }))
}

exports.getBestRatedBooks = (req, res, next) => {
    
    // Constitution d'un tableau contenant tous les livres
    let booksArray = []
    Book.find()
        .then(books => {
            for (let book of books) {
                booksArray.push(book)
            }

            // Retenue des 3 livres les mieux notés du tableau
            const bestRatedBooks = booksArray.sort((x, y) => y.averageRating - x.averageRating)
            const threeBestRatedBooks = bestRatedBooks.slice(0, 3)

            // Envoi du nouveau tableau des 3 livres les mieux notés comme réponse à la requête
            res.status(200).json(threeBestRatedBooks)
        })
        .catch((error) => res.status(400).json({ error }))
}

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file
        ? {
              ...JSON.parse(req.body.book),
              imageUrl: `${req.protocol}://${req.get('host')}/images/${
                  req.file.filename
              }`,
          }
        : { ...req.body }

    delete bookObject._userId
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' })
            } else {
                Book.updateOne(
                    { _id: req.params.id },
                    { ...bookObject, _id: req.params.id }
                )
                    .then(() =>
                        res.status(200).json({ message: 'Livre modifié !' })
                    )
                    .catch((error) => res.status(401).json({ error }))
            }
        })
        .catch((error) => {
            res.status(400).json({ error })
        })
}

exports.giveARating = (req, res, next) => {
    const { userId, rating } = req.body

    // Trouver le livre à noter
    Book.findOne({ _id: req.params.id }).then((book) => {
        
        // Vérification de l'identité de l'utilisateur
        if (userId !== req.auth.userId) {
            res.status(400).json({ message: 'Not authorized !' })
        } else {

            // Ajout de la nouvelle notation dans le tableau
            const newRating = {
                userId: userId,
                grade: rating,
            }
            book.ratings.push(newRating)

            // Calcul de la moyenne des notations
            const sumGrades = book.ratings
                .map((rating) => rating.grade)
                .reduce((prev, curr) => prev + curr, 0)
            const floatAverageRating = sumGrades / book.ratings.length
            const averageRating = Math.round(floatAverageRating)
            book.averageRating = averageRating

            // Enregistrement des changements
            book.save()
            .then(() => res.status(200).json(book))
            .catch((error) => res.status(401).json({ error }))
        }
    })
}

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
                                message: 'Livre supprimé !'
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
