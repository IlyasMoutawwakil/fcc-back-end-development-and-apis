var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var middleware_static = express.static(__dirname + '/public')

app.use(middleware_static)

var middleware_parse = bodyParser.urlencoded({extended: false})

app.use(middleware_parse)

app.use(function(req, res, next) { 
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next()
  })

app.get('/', (req, res) => res.sendFile(
  __dirname + "/views/index.html"))

app.get('/json', function(req, res) {
  if (process.env.MESSAGE_STYLE=="uppercase") {
  return res.json({ "message": "Hello json".toUpperCase()}) 
  } else {
  return res.json({ "message": "Hello json" })
}})

app.get('/now', 
function(req, res, next) { 
  req.time = new Date().toString() 
  next()
  },
(req, res) => res.send({"time" : req.time}))

app.get('/:word/echo',
(req, res) => res.send({"echo": req.params.word}))

app.get('/name',
(req, res) => res.send({"name": `${req.query.first} ${req.query.last}`}))

app.post('/name',
(req, res) => res.send({"name": `${req.body.first} ${req.body.last}`}))



























module.exports = app;
