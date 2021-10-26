const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true })

var Schema = mongoose.Schema
var userSchema = new Schema({
  userName: String
})
var logSchema = new Schema({
  userId: String,
  description: String,
  duration: Number,
  date: Date
})

var User = mongoose.model('User', userSchema)
var UserLog = mongoose.model('UserLog', logSchema)
var ObjectId = mongoose.Types.ObjectId

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// Not found middleware
// app.use((req, res, next) => {
//  return next({status: 404, message: 'not found'})
// })

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

//FCC Project
app.post('/api/exercise/new-user', function(req, res) {
  console.log('test')
  User.findOne({userName: req.body.username}, function(err, data) {
    if (err) {
      return res.send('error, unable to search database')
    }
    else if (data == null) {
      var newUser = new User ({userName: req.body.username})
      newUser.save(function(err) {
        if (err) {
          return res.send('error, unable to save record')
        }
        else {
          User.findOne({userName: req.body.username}, function(err, data) {
            if (err) {
              return res.send('error')
            }
            return res.send({ID: data._id, Username: data.userName})
          })
        }
      })
    }
    else {
      return res.send('username already taken')
    }
  })
})

app.post('/api/exercise/add', function(req, res) {
  if (req.body.description == '') {
    return res.send('description is required')
  }
  if (req.body.duration == '') {
    return res.send('duration is required')
  }
  if (!ObjectId.isValid(req.body.userId)) {
    return res.send('invalid id')
  }
  User.findById(req.body.userId, function(err, data) {
    if (err) {
      return res.send('error')
    }
    else if (data == null) {
      return res.send('user does not exist')
    }
    else {
      UserLog.findOne({userId: req.body.userId,
                    description: req.body.description,
                    duration: req.body.duration,
                    date: req.body.date}, function(err, data) {
        if (err) {
          return res.send('error, unable to search database')
        }
        else if (data == null) {
          var actualDate;
          if (req.body.date == '') {
            actualDate = new Date()
          }
          else {
            actualDate = new Date(req.body.date)
          }
          var newUserLog = new UserLog({userId: req.body.userId,
                                        description: req.body.description,
                                        duration: req.body.duration,
                                        date: actualDate})
          newUserLog.save(function(err) {
            if (err) {
              return res.send('error, unable to save record')
            }
            else {
              User.findOne({_id: req.body.userId}, function(err, data) {
                return res.send({userName: data.userName,
                               userId: req.body.userId,
                               description: req.body.description,
                               duration: req.body.duration,
                               date: actualDate.toUTCString().slice(0,16)})
              })
            }
          })
        }
        else {
          return res.send('log already exists')
        }
      })
    }
  })
})

app.get('/api/exercise/users', function(req, res) {
  User.find({}, function(err, data) {
    return res.send(data)
  })
})

app.get('/api/exercise/log?', function(req, res) {
  User.findById(req.query.userId, function(err, data) {
    if (err) {
      return res.send('error')
    }
    else if (data != null) {
      var username = data.userName
      var fromDate = new Date(req.query.from) //'Invalid Date' if not date format
      var toDate = new Date(req.query.to)     //'Invalid Date' if not date format
      var limit = parseInt(req.query.limit)   //Nan if not integer
      
      if (fromDate == 'Invalid Date') {
        fromDate = -8640000000000000
        var fromBool = true
      }
      if (toDate == 'Invalid Date') {
        toDate = 8640000000000000
        var toBool = true
      }
      // console.log(fromDate, toDate)
      UserLog.find({userId: req.query.userId})
             .where('date').gt(fromDate).lt(toDate)
             .limit((limit == NaN) ? '':limit)
             .sort('-date')
             .exec(function(err, data) {
                    console.log(data)
                    if (err) {
                      return res.send('error')
                    }
                    else {
                      var logArr = []
                      for (let i = 0; i < data.length; i++) {
                        logArr.push({description: data[i].description,
                                     duration: data[i].duration,
                                     date: data[i].date.toUTCString().slice(0, 16)})
                      }
                      return res.send({_id: req.query.userId,
                                       username: username,
                                       from: ((fromBool)?'NA':fromDate.toUTCString().slice(0,16)),
                                       to: ((toBool)?'NA':toDate.toUTCString().slice(0,16)),
                                       count: data.length,
                                       log: [...logArr]})
                    }
                  })
    }
    else {
      return res.send('invalid id')
    }
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})