$(document).ready(function(){

    var canvas = $('#area');
    var ctx = canvas[0].getContext('2d');

    var drawing = false;
    var turn = false;

    var clients = {};

    var socket = io.connect(window.location.hostname);

    socket.on('draw', function (data) {
		if(data.drawing && clients[data.id]){
			drawLineEmit(clients[data.id].x, clients[data.id].y, data.x, data.y);
		}
        clients[data.id] = data;
    });
    
    socket.on('turnStart', function (word) {
		$('#info p').text('You draw: ' + word);
		$('#info').fadeIn('slow').delay(3000).fadeOut('slow');
		turn = true;
		$("#appendedInputButton").prop('disabled', true);
    });
    
    socket.on('clearCanvas', function (word) {
		ctx.beginPath();
		ctx.clearRect(0, 0, 450, 400);
    });
    
    socket.on('enableInput', function (word) {
		$("#appendedInputButton").prop('disabled', false);
		turn = false;
    });
    
    socket.on('turnInProgress', function () {
		$('#error p').text('Turn is in progress, please wait');
		$('#error').fadeIn('slow').delay(3000).fadeOut('slow'); ;
    });
    
    socket.on('rightGuess', function () {
		$('#success p').text('That\'s it congratulations');
		$('#success').fadeIn('slow').delay(3000).fadeOut('slow');
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
    
    var p = $('#area');
    var position = p.position();
    
	$(window).on('resize', function() {
		position = p.position();
		console.log(position.left);
		console.log(position.top);
	});

    $('#area').on('mousemove',function(e){
		if(turn){
			socket.emit('mousemove',{
				'x': e.pageX - position.left,
				'y': e.pageY - position.top,
				'drawing': drawing,
				'id': id
			});
		}
        if(turn && drawing){
            drawLineLocal(prev.x, prev.y, e.pageX, e.pageY);
            prev.x = e.pageX;
            prev.y = e.pageY;
        }
    });

    var drawLineEmit = function (fromx, fromy, tox, toy) {
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.stroke();
    }
    
    var drawLineLocal = function (fromx, fromy, tox, toy) {
        ctx.moveTo(fromx - position.left, fromy - position.top);
        ctx.lineTo(tox - position.left, toy - position.top);
        ctx.stroke();
    }
    
    $('#drw').click(function() {
      socket.emit('turnRequest');
    });
    
});
