var app = require('express').createServer().listen(3000);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});
