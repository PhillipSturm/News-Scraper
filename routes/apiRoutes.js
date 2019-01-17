let db = require('../models');
let axios = require('axios');
let cheerio = require('cheerio');
let ObjectId = require('mongodb').ObjectId;

module.exports = app => {
    app.get('/api/scrape', (req, res) => {
        axios.get('https://apnews.com/').then(response => {
            let $ = cheerio.load(response.data)
            $('div.FeedCard').each((i, element) => {
                let article = {}
                article.title = $(element).find('a.headline').text()
                article.summary = $(element).find('div.content').text()
                article.url = 'https://apnews.com' + $(element).find('a.headline').attr('href')
                db.Article.create(article).then(dbArticle => {
                    console.log(dbArticle)
                }).catch(err => {
                    res.end('Error Creating Articles and Adding to Database')
                    console.log(err)
                })
            })
        }).catch(err => {
            res.end('Error When Scraping For Articles')
            console.log(err)
        })
    })

    app.get('/api/articles', (req, res) => {
        db.Article.find({saved: false}).sort({
            dateCreated: -1
        }).then(articles => {
            console.log('Articles Found')
            res.json(articles)
        }).catch(err => {
            res.end('Database Error Retreiving All Articles')
            console.log(err)
        })
    })

    app.post('/api/save/:id', (req, res) => {
        db.Article.findByIdAndUpdate(req.params.id, {
            $set: {
                saved: true
            }
        }).then(data => {
            console.log('Article has been saved.')
            res.json(data);
        }).catch(err => {
            res.end('Database Error')
            console.log(err);
        })
    });

    app.post('/api/unsave/:id', (req, res) => {
        db.Article.findByIdAndUpdate(req.params.id, {
            $set: {
                saved: false
            }
        }).then(data => {
            console.log('Article has been unsaved.')
            res.json(data);
        }).catch(err => {
            res.end('Database Error')
            console.log(err);
        })
    });

    app.post('/api/delete/:id', (req, res) => {
        db.Article.findOneAndDelete(req.params.id).then(data => {
            console.log('Article Successfully Deleted.')
            res.json(data);
        }).catch(err => {
            res.end('Database Error')
            console.log(err);
        })
    });

    app.get('/api/notes/:id', (req, res) => {
        db.Article.findById(req.params.id).populate('notes').then(article => {
            console.log('Article Found')
            res.json(article)
        }).catch(err => {
            res.end('Database Error Finding An Article')
            console.log(err)
        })
    })

    app.post('/api/note/:id', (req, res) => {
        db.Note.create({
            text: req.body.text
        }).then(dbNote => {
            console.log('Note created');
            res.json(dbNote);
            return db.Article.findByIdAndUpdate(req.params.id, {
                $push: {
                    notes: dbNote._id
                }
            })
        }).then(dbArticle => {
            console.log('Note Successfully Added');
            // res.json(dbArticle);
        }).catch(err => {
            res.end('Database Error')
            console.log(err)
        })
    });

    app.post("/api/delete/:note_id/:article_id", (req, res) => {
        // Use the note id to find and delete it
        db.Note.findByIdAndRemove(req.params.note_id).then(dbNote => {
            console.log('Deleting note.')
            console.log(dbNote)
            console.log(dbNote._id)
            return db.Article.findByIdAndUpdate(req.params.article_id, {
                $pull: {
                    notes: dbNote._id
                }
            }).then(dbArticle => {
                console.log('Note Removed.')
                res.json('Note Deleted')
            }).catch(err => {
                console.log(err)
                res.end('Database Error')
            })
        })
    })

    app.get('/api/saved-articles', (req, res) => {
        db.Article.find({saved: true}).sort({
            dateCreated: -1
        }).then(articles => {
            console.log('Saved Articles Found')
            res.json(articles)
        }).catch(err => {
            res.end('Database Error Retreiving Saved Articles')
            console.log(err)
        })
    })
}