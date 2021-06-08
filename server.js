const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Import the mongoose module
var mongoose = require('mongoose');
const moment = require('moment')

//Set up default mongoose connection
var mongoDB = 'mongodb://localhost:27017/local';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: String
});

var exerciseSchema = new Schema({
  description: String,
  duration: String,
  date: String,
  user_id: String,
  d: Date
}
);
var User = mongoose.model('User', userSchema);
var Exercise = mongoose.model('Extercise', exerciseSchema);

app.use(cors())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


/// nije prihvatalo api/users dok nisam stavio id da je string - cudno
app.post('/api/users', function (req, res) {
  var username = req.body.username;

  User.create({ username: username }, function (err, usr) {
    if (err) return handleError(err);
    res.json({ "username": usr.username, "_id": usr._id });
  });

});


app.get('/api/users', function (req, res) {
  User.find({}, function (err, users) {
    if (err) handleError(err);
    res.json(users);
  });

});

app.post('/api/users/:_id/exercises', function (req, res) {
  var id = req.params._id;
  var description = req.body.description;
  var duration = Number(req.body.duration);

  if (req.body.date === '' || !req.body.date)
    today = new Date();
  else today = new Date(req.body.date);

  var date = moment(today).format("ddd MMM D YYYY");

  Exercise.create({ user_id: id, description: description, duration: duration, date: date, d: moment(today) }, function (err, exercise) {
    if (err) return handleError(err);
    User.findById(id, function (err, user) {
      if (err) handleError(err);
      res.json({ "username": user.username, "_id": id, "description": description, "duration": duration, "date": date });
    });
  });

});

app.get('/api/users/:_id/logs', function (req, res) {
  var id = req.params._id;
  var from = req.query.from;
  var to = req.query.to;
  var limit = Number(req.query.limit);

  if (from && from != '') {
    from = new Date(from);
    var dateFrom = moment(from).format("ddd MMM D YYYY");
  }
  else from = new Date('0000-01-01');
  if (to != '' && to) {
    to = new Date(to);
    var dateTo = moment(to).format("ddd MMM D YYYY");
  }
  else to = new Date('9999-01-01')


  User.findById(id, function (err, user) {

    if (err) { console.log("hreska"); handleError(err); }
    /// usr = { ...user };  /// zasto ovo nije htjelo
    Exercise.find(
      {
        user_id: id
        , d: { "$gte": (from), "$lte": (to) }
      }, function (err, exercises) {
        if (err) handleError(err);
        var log = exercises;
        if (Number(limit) > 0) log = log.slice(0, limit);
        res.json({ "_id": user._id, "username": user.username, count: log.length, from: dateFrom, to: dateTo, log: log })

      });
  });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


