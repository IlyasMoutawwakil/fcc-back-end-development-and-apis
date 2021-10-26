require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
let bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;


app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (err) {
    console.log(err)
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

/* Create the schema for storing our URLs */
let urlSchema = new mongoose.Schema({
  original: { type: String, required: true },
  short: Number
});

/* Create a model using above schema */
let Url = mongoose.model('URL', urlSchema);
let response = {};

app.post("/api/shorturl/new", bodyParser.urlencoded({ extended: false }), (req, res) => {
  let inputUrl = req.body['url'];
  if (!isValidHttpUrl(inputUrl)) {
    res.json({ error: 'invalid url' });
    return;
  }
  response['original_url'] = inputUrl;
  let inputShort = 1;
  Url.findOne({})
    .sort({ short: 'desc' })
    .exec((err, result) => {
      if (!err && result != undefined) {
        inputShort = result.short + 1;
      }
      if (!err) {
        Url.findOneAndUpdate(
          { original: inputUrl },
          { original: inputUrl, short: inputShort },
          { new: true, upsert: true },
          (err, savedUrl) => {
            if (!err) {
              response['short_url'] = savedUrl.short;
              res.json(response);
            }
          }
        );
      }
    });
});

app.get('/api/shorturl/:input', (req, res) => {
  let inputShort = req.params.input;
  Url.findOne({short: inputShort}, (err, result) => {
    if( !err && result != undefined ){
      res.redirect(result.original);
    }
    else{
      res.json("URL not found");
    }
  });
});