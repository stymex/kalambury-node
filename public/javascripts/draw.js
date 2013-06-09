$(document).ready(function(){

    var canvas = $('#area');
    var ctx = canvas[0].getContext('2d');

    var drawing = false;

    var clients = {};

    var socket = io.connect('http://localhost:3000');

    socket.on('moving', function (data) {
		if(data.drawing && clients[data.id]){
			drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
		}
        clients[data.id] = data;
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

    var lastEmit = $.now();

    $(document).on('mousemove',function(e){
        if($.now() - lastEmit > 10){
            socket.emit('mousemove',{
                'x': e.pageX,
                'y': e.pageY,
                'drawing': drawing,
                'id': id
            });
            lastEmit = $.now();
        }
        if(drawing){
            drawLine(prev.x, prev.y, e.pageX, e.pageY);
            prev.x = e.pageX;
            prev.y = e.pageY;
        }
    });
    
    var p = $('#area');
    var position = p.position();
    
	$(window).resize(function() {
		position = p.position();
	});

    function drawLine(fromx, fromy, tox, toy){
        ctx.moveTo(fromx - position.left, fromy - position.top);
        ctx.lineTo(tox - position.left, toy - position.top);
        ctx.stroke();
    }
});
