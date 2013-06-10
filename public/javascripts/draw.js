$(document).ready(function(){

    var canvas = $('#area');
    var ctx = canvas[0].getContext('2d');

    var drawing = false;
    var turn = false;

    var clients = {};

    var socket = io.connect('http://localhost:3000');

    socket.on('draw', function (data) {
		if(data.drawing && clients[data.id]){
			drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
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

    $(document).on('mousemove',function(e){
		if(turn){
			socket.emit('mousemove',{
				'x': e.pageX,
				'y': e.pageY,
				'drawing': drawing,
				'id': id
			});
		}
        if(turn && drawing){
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
    
});


//~ $(function(){
//~ 
    //~ // The URL of your web server (the port is set in app.js)
    //~ var url = 'http://localhost:3000';
//~ 
    //~ var doc = $(document),
        //~ canvas = $('#area'),
        //~ ctx = canvas[0].getContext('2d');
//~ 
    //~ // A flag for drawing activity
    //~ var drawing = false;
//~ 
    //~ var clients = {};
//~ 
//~ 
    //~ var socket = io.connect(url);
//~ 
    //~ socket.on('draw', function (data) {
//~ 
        //~ // Is the user drawing?
        //~ if(data.drawing && clients[data.id]){
//~ 
            //~ // Draw a line on the canvas. clients[data.id] holds
            //~ // the previous position of this user's mouse pointer
//~ 
            //~ drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
        //~ }
//~ 
        //~ // Saving the current client state
        //~ clients[data.id] = data;
        //~ clients[data.id].updated = $.now();
    //~ });
//~ 
    //~ var prev = {};
//~ 
    //~ canvas.on('mousedown',function(e){
        //~ e.preventDefault();
        //~ drawing = true;
        //~ prev.x = e.pageX;
        //~ prev.y = e.pageY;
    //~ });
//~ 
    //~ doc.bind('mouseup mouseleave',function(){
        //~ drawing = false;
    //~ });
//~ 
    //~ doc.on('mousemove',function(e){
        	//~ socket.emit('mousemove',{
                //~ 'x': e.pageX,
                //~ 'y': e.pageY,
                //~ 'drawing': drawing,
                //~ 'id': id
            //~ });
        //~ 
        //~ if(drawing){
            //~ drawLine(prev.x, prev.y, e.pageX, e.pageY);
            //~ prev.x = e.pageX;
            //~ prev.y = e.pageY;
        //~ }
    //~ });
//~ 
    //~ var p = $('#area');
    //~ var position = p.position();
    //~ 
	//~ $(window).on('resize', function() {
		//~ position = p.position();
	//~ });
//~ 
    //~ var drawLine = function (fromx, fromy, tox, toy) {
        //~ ctx.moveTo(fromx - position.left, fromy - position.top);
        //~ ctx.lineTo(tox - position.left, toy - position.top);
        //~ ctx.stroke();
    //~ }
//~ 
//~ });
