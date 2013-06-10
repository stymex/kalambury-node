$(document).ready(function(){

    var canvas = $('#area');
    var ctx = canvas[0].getContext('2d');

    var drawing = false;
    var turn = false;

    var clients = {};

    var socket = io.connect('http://localhost:3000');

    socket.on('draw', function (data) {
		if(clients[data.id]){
			drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
		}
        clients[data.id] = data;
    });
    
    socket.on('turnStart', function (word) {
		$('#info p').text('You draw: ' + word);
		$('#info').fadeIn('slow');
		turn = true;
    });
    
    socket.on('clearCanvas', function (word) {
		ctx.beginPath();
		ctx.clearRect(0, 0, 450, 400);
    });
    
    socket.on('turnInProgress', function (word) {
		$('#error p').text('Turn is in progress, please wait');
		$('#error').fadeIn('slow');
    });

    var prev = {};

    canvas.on('mousedown',function(e){
        e.preventDefault();
        drawing = true;
        prev.x = e.pageX;
        prev.y = e.pageY;
    });

    $(document).bind('mouseup mouseleave',function(){
        drawing = false;
    });

    $(document).on('mousemove',function(e){
        if(turn && drawing){
			socket.emit('mousemove',{
				'x': e.pageX,
				'y': e.pageY,
				'id': id
			});
            drawLine(prev.x, prev.y, e.pageX, e.pageY);
            prev.x = e.pageX;
            prev.y = e.pageY;
        }
    });
    
    var p = $('#area');
    var position = p.position();
    
	$(window).on('resize', function() {
		position = p.position();
	});

    var drawLine = function (fromx, fromy, tox, toy) {
        ctx.moveTo(fromx - position.left, fromy - position.top);
        ctx.lineTo(tox - position.left, toy - position.top);
        ctx.stroke();
    }
    
    $('#drw').click(function() {
      socket.emit('turnRequest');
    });
    
    $('.info').click(function() {
		$('#info').fadeOut('slow');
    });
    
    $('.error').click(function() {
		$('#error').fadeOut('slow');
    });
    
    $('.success').click(function() {
		$('#success').fadeOut('slow');
    });
    
    
});
