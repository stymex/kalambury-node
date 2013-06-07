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
