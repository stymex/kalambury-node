$(document).ready(function(){
	var socket = io.connect('http://localhost:3000');

	socket.on('connect', function(){
	  socket.emit('adduser', nick);
	});

	socket.on('updatechat', function (username, data) {
	  $('tbody#chat').prepend('<tr><td>'+ username + '</td><td>' + data + '</td></tr>');
	  $('tbody#chat tr').eq(12).remove();
	});

	socket.on('updateusers', function(data) {
	  $('#users').empty();
	  $.each(data, function(key, value) {
		$('#users').append('<tr><td>' + value + '</td></tr>');
	  });
	});

	$('#send').click( function() {
		var message = $('#appendedInputButton').val();
		$('#appendedInputButton').val('');
		socket.emit('sendchat', message);
	});
});
