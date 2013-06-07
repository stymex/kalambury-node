var socket = io.connect('http://localhost:3000');

socket.on('connect', function(){
  socket.emit('adduser', prompt("What's your name?"));
});

socket.on('updatechat', function (username, data) {
  $('tbody#chat').append('<tr><td>'+ username + '</td><td>' + data + '</td></tr>');
});

socket.on('updateusers', function(data) {
  $('#users').empty();
  $.each(data, function(key, value) {
    $('#users').append('<tr><td>' + key + '</td></tr>');
  });
});

$(document).ready(function(){
  $('#send').click( function() {
    var message = $('#appendedInputButton').val();
    $('#appendedInputButton').val('');
    socket.emit('sendchat', message);
  });
});
