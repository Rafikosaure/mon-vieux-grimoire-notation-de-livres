const Book = require('../models/book')



exports.createBook = (req, res, next) => {
    res.status(201).json({ message: "Requête aboutie !" })
    next()
}