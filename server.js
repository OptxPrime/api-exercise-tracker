const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

var users = []
var idCounter = 0;

/// nije prihvatalo api/users dok nisam stavio id da je string - cudno
app.post('/api/users', function (req, res) {
  var user = req.body.username;

  var newUser = { "username": user, "_id": String(idCounter++), "log": [], "count": 0 };
  users.push(newUser);
  res.json(newUser);
});

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

app.get('/api/users', function (req, res) {
  //  console.log( users.length );
  //var filteredUsers = users.map( //el=>console.log(el) );
  var filteredUsers = users.map((el) => {
    return { "_id": el._id, "username": el.username }
  });
  res.json(filteredUsers);
});

app.post('/api/users/:_id/exercises', function (req, res) {
  var danas = new Date();
  var description = req.body.description;
  var duration = Number(req.body.duration);
  // console.log('dodajem novi poso')


  ///bitno: imao problem sto nisam stavio ovaj drugi uslov. cak nije radilo ako se stavi undefined. koja je razlika izmedju npr !varijabla, varijabla===undefined i slicno?
  if (req.body.date === '' || !req.body.date)
    today = new Date();
  else today = new Date(req.body.date);
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  var day = today.getDay();

  date = dayNames[day].substr(0, 3) + ' ' + monthNames[Number(mm) - 1].substr(0, 3) + ' ' + dd + ' ' + yyyy;

  console.log(date)

  var id = req.params._id;
  usr = users.find(el => el._id === id);
  var idx = users.indexOf(usr);

  usr = { ...usr, count: usr.count + 1, log: [...usr.log, { "description": description, "duration": duration, "date": date, "d": today }] };
  var o = { "username": usr.username, "_id": usr._id, "description": description, "duration": duration, "date": date };

  users[idx] = usr;
  res.json(o);
});

app.get('/api/users/:_id/logs', function (req, res) {


  var id = req.params._id;
  var from = req.query.from;
  var to = req.query.to;
  var limit = Number(req.query.limit);
  // console.log(limit);
  //var dateFrom, dateTo;
  usr = { ...users.find(el => el._id == id) };
  usr.log = [...usr.log]
  if (from && from != '') {
    from = new Date(from);

    var dd = String(from.getDate()).padStart(2, '0');
    var mm = String(from.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = from.getFullYear();
    var day = from.getDay();

    var dateFrom = dayNames[day].substr(0, 3) + ' ' + monthNames[Number(mm) - 1].substr(0, 3) + ' ' + dd + ' ' + yyyy;
  }
  else from = new Date('0000-01-01');
  if (to != '' && to) {
    console.log("evo")
    console.log(to)
    to = new Date(to);
    var dd = String(to.getDate()).padStart(2, '0');
    var mm = String(to.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = to.getFullYear();
    var day = to.getDay();

    var dateTo = dayNames[day].substr(0, 3) + ' ' + monthNames[Number(mm) - 1].substr(0, 3) + ' ' + dd + ' ' + yyyy;

  }
  else to = new Date('9999-01-01')


  usr.log = usr.log.filter((el) => {

    return (el.d >= from && el.d <= to)
  });
  usr = { ...usr, "from": dateFrom, "to": dateTo };
  if (Number(limit) > 0)
    usr.log = usr.log.slice(0, limit);
  usr.count = usr.log.length;


  res.json(usr);
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


