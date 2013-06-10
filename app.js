var express = require('express');
var http = require('http');
var routes = require('./routes');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();

app.configure( function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('secret'));
    app.use(express.session());
    app.use(passport.initialize());
	app.use(passport.session()); 
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/', function(req, res){
	if(!req.session.passport.user) {
		res.redirect('/login');
	} else {
		User.findById(req.session.passport.user, function(err, user) {
			if (err) { return done(err); }
			res.render('index', { nick: user.username, id: user._id });
		});
	}
});

app.get('/login', function(req, res){
  res.render('login')
});

app.get('/register',  function(req, res){
  res.render('register')
});

app.post('/register', function(req, res){
  	var usr = new User();
	usr.username = req.body.username;
	usr.password = req.body.password;
	usr.points = 0;
	usr.save();
	res.redirect('/login');
});

app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login'
}));

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

mongoose.connect('mongodb://localhost/users');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
    id    : ObjectId
  , username     : String
  , password      : String
  , points      : Number
});

UserSchema.methods.validPassword = function( pwd ) {
    return ( this.password === pwd );
};

var User = mongoose.model('User', UserSchema);

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

var server = http.createServer(app).listen(3000);
var io = require('socket.io').listen(server);

var users = {};
var words = ["bed","car","river","beach","sword","lamp"];
var block = false;
var drawingPlayer = '';
var currentWord = '';


io.sockets.on('connection', function(socket) {

	socket.on('sendchat', function(message) {
		if(message===currentWord) {
			socket.emit('rightGuess');
			block = false;
			currentWord = '';
			drawingPlayer = '';
			io.sockets.emit('clearCanvas');
			io.sockets.emit('enableInput');
			io.sockets.emit('updatechat', 'SERVER', socket.username + ' guessed right');
		}
		io.sockets.emit('updatechat', socket.username, message);
	});

	socket.on('adduser', function(username) {
		socket.username = username;
		users[username] = username;
		socket.emit('updatechat', 'SERVER', 'you have connected');
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		io.sockets.emit('updateusers', users);
	});

	socket.on('disconnect', function() {
		if(drawingPlayer===socket.username) {
			block = false;
			drawingPlayer='';
			socket.broadcast.emit('clearCanvas');
		}
		delete users[socket.username];
		io.sockets.emit('updateusers', users);
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has left');
	});
	
	socket.on('mousemove', function (data) {
        socket.broadcast.emit('draw', data);
    });
    
    socket.on('turnRequest', function () {
		if(!block) {
			currentWord = words[Math.floor(Math.random() * words.length)];
			socket.emit('turnStart', currentWord);
			drawingPlayer = socket.username;
			block = true;
		} else {
			socket.emit('turnInProgress');
		}
	});
});
