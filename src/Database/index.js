const sqlite3 = require('sqlite3');
const express = require('express');
const axios = require('axios');
const { response } = require('express');

const dbRouter = express.Router({
    mergeParams: true
})

var db = new sqlite3.Database('./src/Database/database.db');

function initDB() {
    db.serialize(function () {
        db.run(`CREATE TABLE IF NOT EXISTS posts(
            id INTEGER PRIMARY KEY,
            userId INTEGER,
            title TEXT,
            body TEXT
            )`);
        db.run(`CREATE TABLE IF NOT EXISTS comments(
            id INTEGER PRIMARY KEY,
            postId INTEGER,
            name TEXT,
            email TEXT,
            body TEXT
        )`)
    })
    axios.get("https://jsonplaceholder.typicode.com/posts")
        .then(response => {
            let posts = response.data;
            posts.forEach(post => {
                db.run('INSERT INTO posts(id, userId, title, body) VALUES(?, ?, ?, ?)', [post.id, post.userId, post.title, post.body], error => {
                    if (error) {
                        if (error.errno === 19) {
                            // console.log("Duplicate. Already exists")
                        }
                        else console.log("Error inserting posts into the Database");
                    }
                });

            })
        })
        .catch(error => {
            console.log(error)
        })
    axios.get("https://jsonplaceholder.typicode.com/comments")
        .then(response => {
            let comments = response.data;
            comments.forEach(comment => {
                db.run('INSERT INTO comments(id, postId, name, email, body) VALUES(?, ?, ?, ?, ?)', [comment.id, comment.postId, comment.name, comment.email, comment.body], error => {
                    if (error) {
                        if (error.errno === 19) {
                            // console.log("Duplicate. Already exists")
                        }
                        else console.log("Error inserting posts into the Database");
                    }
                });
            });
        })
}

dbRouter.get("/posts", async (_, response, __) => {
    db.all("SELECT * FROM posts", (error, rows) => {
        if (error) {
            response.status(500).send("Error from the database");
            return;
        }
        rows.sort((a, b) => {
            if (a.id == 0) return 1;
            if (b.id == 0) return -1;
            return a.id - b.id;
        })
        response.send(rows);
    })
})

dbRouter.get("/comments", async (_, response, __) => {
    db.all("SELECT * FROM comments", (error, rows) => {
        if (error) {
            response.status(500).send("Error from the database");
            return;
        }
        rows.sort((a, b) => {
            if (a.id == 0) return 1;
            if (b.id == 0) return -1;
            return a.id - b.id;
        })
        response.send(rows);
    })
})

dbRouter.get("/comment", (request, response, _) => {
    if (request.query.postId) {
        db.all("SELECT * FROM comments WHERE postId = " + request.query.postId, (error, rows) => {
            if (error) {
                response.status(500).send("Error from the database");
                return;
            }
            rows.sort((a, b) => {
                if (a.id == 0) return 1;
                if (b.id == 0) return -1;
                return a.id - b.id;
            })
            response.send(rows);
        })
    }
    else
        response.status(404).send();
})

dbRouter.post("/post", async (request, response, _) => {
    let post = request.body;
    // db.serialize(function () {
    db.run("REPLACE INTO posts (id, userId, title, body) VALUES(?, ?, ?, ?)", [post.id, post.userId, post.title, post.body], (error) => {
        if (error) {
            if (error.errno === 19) {
                response.status(409).send();
                return;
            }
        }
        else {
            response.status(201).send(post);
        }
    });

})

dbRouter.post("/deletePost", async (request, response, _) => {
    let post = request.body;
    db.run("DELETE FROM posts WHERE id = ?", [post.id], (error) => {
        if (error) {
            console.log(error)
        }
        response.status(202).send();
    })
})

dbRouter.post("/comment", async (request, response, _) => {
    let comment = request.body;
    // db.serialize(function () {
    db.run("REPLACE INTO comments (id, postId, name, email, body) VALUES(?, ?, ?, ?, ?)", [comment.id, comment.postId, comment.name, comment.email, comment.body], (error) => {
        if (error) {
            if (error.errno === 19) {
                response.status(409).send();
                return;
            }
        }
        else {
            response.status(201).send(comment);
        }
    });

})



module.exports = {
    initDB,
    dbRouter
}
