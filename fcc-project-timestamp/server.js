// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// dateRegex = /(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})/

unixRegex = /^\d+$/

app.get("/api/timestamp/:date", 
(req, res) => {
  if (req.params.date.match(unixRegex)) {
    unix = Number(req.params.date)
    date = new Date(unix);
    utc = date.toUTCString();
    res.json({unix: unix, utc: utc})
  } else if ((new Date(req.params.date))!='Invalid Date') {
    date = new Date(req.params.date);
    utc = date.toUTCString();
    unix = date.getTime();
    res.json({unix: unix, utc: utc})
  } else res.json({ error : "Invalid Date" })
})

app.get("/api/timestamp/", 
  (req, res) => {
    date = new Date(Date.now());
    console.log(date)
    unix = date.getTime();
    utc = date.toUTCString();
    res.json({unix: unix, utc: utc})
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
