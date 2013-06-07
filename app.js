var express = require('express');
var http = require('http');
var routes = require('./routes');
var path = require('path');

var app = express();

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('secret'));
    app.use(express.session());
    //~ app.use(passport.initialize());
	//~ app.use(passport.session()); 
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/register', routes.register);












var server = http.createServer(app).listen(3000);
var io = require('socket.io').listen(server);

var usernames = {};

io.sockets.on('connection', function(socket) {


	socket.on('sendchat', function(data) {
		io.sockets.emit('updatechat', socket.username, data);
	});

	socket.on('adduser', function(username) {
		socket.username = username;
		usernames[username] = username;
		socket.emit('updatechat', 'SERVER', 'you have connected');
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		io.sockets.emit('updateusers', usernames);
	});

	socket.on('disconnect', function() {
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has left');
	});
});
