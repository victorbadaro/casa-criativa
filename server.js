const express = require('express')
const methodOverride = require('method-override')
const server = express()

const db = require('./db')

server.use(express.static('public'))

server.use(express.urlencoded({ extended: true }))

server.use(methodOverride('_method'))

const nunjucks = require('nunjucks')
nunjucks.configure('views', {
    express: server,
    noCache: true
})

server.get('/', function(req, res) {
    db.all(`SELECT * FROM ideas`, function(err, rows) {
        if (err) {
            console.log(err)
            return res.send('Erro no banco de dados!')
        }
        
        const reversedIdeas = [...rows].reverse()
        let lastIdeas = []
        for (idea of reversedIdeas) {
            if (lastIdeas.length < 2) {
                lastIdeas.push(idea)
            }
        }
    
        return res.render('index.html', { ideas: lastIdeas })
    })
})

server.get('/ideas', function(req, res) {
    db.all(`SELECT * FROM ideas`, function(err, rows) {
        if (err) {
            console.log(err)
            return res.send('Erro no banco de dados!')
        }

        const reversedIdeas = [...rows].reverse()
        return res.render('ideas.html', { ideas: reversedIdeas })
    })
})

server.post('/', function(req, res) {
    const query = `
        INSERT INTO ideas(
            image,
            title,
            category,
            description,
            link
        ) VALUES (?, ?, ?, ?, ?);
    `

    const values = [
        req.body.image,
        req.body.title,
        req.body.category,
        req.body.description,
        req.body.link
    ]

    db.run(query, values, function(err) {
        if (err) {
            console.log(err)
            return res.send('Erro no banco de dados!')
        }

        return res.redirect('/ideas')
    })
})

server.delete('/', function(req, res) {
    const { id } = req.body
    db.run(`DELETE FROM ideas WHERE id = ?`, [id], function(err) {
        if (err) {
            console.log(err)
            return res.send('Erro no banco de dados!')
        }

        return res.redirect('/ideas')
    })
})

server.listen(3000)