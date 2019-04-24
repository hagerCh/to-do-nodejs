const express = require('express');
const bodyparser = require('body-parser');
const mongodb = require('mongodb');
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectID;
const app = express();
app.use(bodyparser.json());


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
   
const connection = (closure) => {
    return mongodb.MongoClient.connect('mongodb://localhost:27017', (err, client) => {
        if (err) throw err;
        let db = client.db('toDoList');
        closure(db);
    })
}

app.post('/register', (req, res) => {
    connection(async (db) => {
        const user = await db.collection('users').insertOne(req.body);
        res.send("Successfully inserted!");
    })
})

app.post('/login', (req, res) => {
    connection(async (db) => {
        const result = await db.collection('users').findOne({ "email": req.body.email });
        console.log(result)
        if (!result) {
            res.send({ message: 'user not found' })
        }
        if (result.password !== req.body.password) {
            res.send({ message: 'wrong password' })
        }
        
        result.toDoList = '';
        result.password = '';
        res.send({ message: 'ok', token: jwt.sign({data: result}, 'my_secret_pass') });
    })
})


app.get('/users', (req, res) => {
    connection(async (db) => {
        const result = await db.collection('users').find().toArray();
        res.send({ data: result })
    })
})

app.get('/id/:id', (req, res) => {
    connection(async (db) => {
        const result = await db.collection('users').findOne({ "_id": ObjectId(req.params.id) });
        res.send({ data: result })
    })
})

app.post('/addToDo/:id', (req, res) => {
    connection(async (db) => {
        const result = await db.collection('users').update({ "_id": ObjectId(req.params.id) }, { $push: { toDoList: req.body } });
        res.send({ data: result })
    })
})

app.post('/deleteToDo/:id', (req, res) => {
    connection(async (db) => {
        const result = await db.collection('users').update({ "_id": ObjectId(req.params.id) }, { $pull: { toDoList: req.body } });
        res.send({ data: result })
    })
})

app.post('/updateToDo/:id/:index', (req, res) => {
    connection(async (db) => {
        var i = req.params.index;
        const result = await db.collection('users').update({ "_id": ObjectId(req.params.id) }, { $set: { ['toDoList.' + i]: req.body } });
        res.send({ data: result })
    })
})

app.listen(3000, (err) => {
    if (err) throw err;
    console.log('the server is running on port 3000');
})