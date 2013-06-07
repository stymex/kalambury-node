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

var server = http.createServer(app).listen(3000);
var io = require('socket.io').listen(server);

var usernames = {};

io.sockets.on('connection', function(socket) {

	// when the client emits sendchat, this listens and executes
	socket.on('sendchat', function(data) {
		// tell the client to execute updatechat with 2 paramaters
		io.sockets.emit('updatechat', socket.username, data);
	});

	// when the client emits adduser this listen and executes
	socket.on('adduser', function(username) {
		// we store the username in the socket session for this client
		socket.username = username;
		// add username to global list
		usernames[username] = username;
		// echo to client that they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected');
		// echo globally that a person has connected
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		// update the list of users in chat,client side
		io.sockets.emit('updateusers', usernames);
	});

	// when the user disconnects
	socket.on('disconnect', function() {
		// remove username from global list
		delete usernames[socket.username];
		// update list of users in chat client side
		io.sockets.emit('updateusers', usernames);
		// echo globally that the user has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has left');
	});
});
