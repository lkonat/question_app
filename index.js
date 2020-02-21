const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const fs = require("fs");
// io.use((socket, next) => {
//   let token = socket.handshake.query.token;
//   if (isValid(socket)) {
//     return next();
//   }
//   return next(new Error('authentication error'));
// });

// function isValid(socket){
//   let token = socket.handshake.query.token;
//   let othot_user = getCookie(socket.handshake.headers.cookie,"_oauth2_username");
//   if(othot_user && othot_user.length>0){
//     //console.log("IT's OTHOT USER",token, othot_user);
//     return true;
//   }else if (token===credentials.socket_io_token) {
//     //console.log("othot process",token, othot_user);
//     return true;
//   }else {
//     //console.log("NOt OTHOT USER",token, othot_user);
//     return false;
//   }
// }

const quizz_database = require('./public/databaseControler.js').controler;
quizz_database.load("./public/quizzes.db",function(db){
  if(db){
    quizz_database.prepare({create:true}).then((good)=>{
      if(good){

      }
    }).catch((err)=>{
      console.log("could not load quizz_database",err);
    });
  }else {
    console.log("could not load quizz_database");
  }
});
io.sockets.on('connection', function (socket) {
  socket.emit('greeting',{message:"welcome"});
  socket.on('disconnect', function () { });
  socket.on('custom_event', function (data) {
    io.sockets.emit("custom_event_res","custom_event");
  });
});

const handlebars = require('express-handlebars').create({defaultLayout:"main"});
app.engine("handlebars",handlebars.engine);
app.set("view engine","handlebars");
app.set('port', process.env.PORT || 3000);
app.use('/',express.static(path.resolve(__dirname+`/public`)));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(require('cookie-parser')("wjdnjkwbdjwbdjbwjdbwjdk"));
app.use(require('express-session')({ resave:false,saveUninitialized:false,secret:"wjdnjkwbdjwbdjbwjdbwjdk"}));
// app.use(function( req, res, next){
// //   console.log("User:",getCookie(req.headers.cookie,'user'));
//   res.cookie('user', `lkonat`);
//   res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
//   next();
// });

app.get('/', function(req, res) {
    res.render('home');
});
app.get('/lab', function(req, res) {
  res.render('tests', {layout: 'main2'});
});
app.get('/lab2', function(req, res) {
  res.render('lab2', {layout: 'main2'});
});
app.get('/canvas', function(req, res) {
  res.render('canvas', {layout: 'main2'});
});
app.get('/learning', function(req, res) {
  res.render('learning', {layout: 'main2'});
});
app.get('/room', function(req, res) {
  res.render('myLabMain', {layout: 'myLab'});
});
app.get('/room/home', function(req, res) {
  res.render('myLabMain', {layout: 'myLab'});
});
// app.get('/backend', function(req, res) {
//    res.render('home', {layout: 'backend'});
// });



function getCookie(cookie,name) {
  var value = "; " + cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

app.post("/add-quiz",function(req,res){ 
  let actor_id = req.body.actor_id;
  let name = req.body.name;
  console.log(req.body);
  quizz_database.createQuiz({
    actor_id:actor_id,
    name:name
  }).then((outcome)=>{
    res.send(outcome);
  });
});
app.post("/get-quizes",function(req,res){ 
  quizz_database.getQuizes().then((outcome)=>{
    res.send(outcome);
  });
});
app.post("/update-question",function(req,res){ 
  let question_id = req.body.question_id;
  let question = req.body.question;
  let answers = req.body.answers;
  let correct_answer = req.body.correct_answer;
  let topic = req.body.topic;
  let time_in_seconds = req.body.time_in_seconds;
  quizz_database.updateOneQuestion({
    question_id:question_id,
    question:question,
    answers:answers,
    correct_answer :correct_answer,
    topic:topic,
    time_in_seconds :time_in_seconds
  }).then((outcome)=>{
    res.send(outcome);
  });
});
app.post("/delete-question",function(req,res){ 
  let question_id = req.body.question_id;
  quizz_database.deleteOneQuestion({
    question_id:question_id
  }).then((outcome)=>{
    res.send(outcome);
  });
});
app.post("/delete-quiz",function(req,res){ 
  let quiz_id = req.body.quiz_id;
  quizz_database.deleteQuiz({
    quiz_id:quiz_id
  }).then((outcome)=>{
    res.send(outcome);
  });
});

app.post("/get-one-quiz",function(req,res){ 
  let quiz_id = req.body.quiz_id;
  quizz_database.getOneQuiz({
    quiz_id:quiz_id
  }).then((outcome)=>{
    res.send(outcome);
  });
});
app.post("/get-one-question",function(req,res){ 
  let question_id = req.body.question_id;
  quizz_database.getOneQuestion({
    question_id:question_id
  }).then((outcome)=>{
    res.send(outcome);
  });
});

app.post("/get-json",function(req,res){ 
  let path = req.body.path;
  if(path){
    fs.readFile(path,(err, data)=>{
      if(err){
        res.send({err:err.toString()});
      }else{
        try {
          let result = JSON.parse(data);
          res.send({ok:result});
        } catch (e) {
          res.send({err:'error occured when parsing'});
        }
      }
    });
  }else{
    res.send({err:'no path'});
  }
});

app.post("/add-quiz-question",function(req,res){ 
   let quiz_id = req.body.quiz_id;
   let  question = req.body.question;
   let  answers = req.body.answers;
   let  correct_answer = req.body.correct_answer;
   let  topic = req.body.topic;
   let  time_in_seconds = req.body.time_in_seconds;
  quizz_database.addQuestionToQuiz({
    quiz_id:quiz_id,
    question:question,
    answers:answers,
    correct_answer:correct_answer,
    topic:topic,
    time_in_seconds:time_in_seconds
  }).then((outcome)=>{
    res.send(outcome);
  });;
});


app.post("/run-query",function(req,res){ 
  let path = req.body.path;
  let query = req.body.query;
  let db = new sqlite3.Database(path,(err)=>{
    if(err){
      res.send(err.toString());
    }else {
      db.all(query,(err,rows)=>{
        if(err){
          return res.send(err.toString());
        }else {
          return res.send({ok:rows});
        }
      });
    }
  });
});

//section Error
app.use(function(req, res){
  res.status(404);
  res.render("404");
});
//custom 500 page
app.use(function(err, req, res, next){
  console.log("Err stack: ",err.stack);
  res.status(500);
  res.render("500");
});

server.listen(app.get("port"), function(){
  console.log("Express started on port "+app.get("port"));
});
