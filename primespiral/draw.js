/*
 *  $Id: draw.js 192 2011-12-07 17:29:54Z fukuhara $
 */

onload = function() {
	init();
};

ps = {};

ps.Data = {};
ps.Data.MAX_NUM = 10000;

ps.Config = {};

ps.Config.MAGNIFY_LEVEL = 4;
ps.Config.RECTANGLE_SIZE = 3;

ps.Cache = {};
ps.Cache.Round = [];

ps.Pause = true;

ps.count = 0;
ps.canvas = null;

function init() {
	ps.canvas = $("canvas#canvassample");

	var width = ps.canvas.width();
	var height = ps.canvas.height();
	ps.MOVE_TO_ZERO = $M([ [ width / 2 ], [ height / 2 ] ]);
	var temp = Math.sqrt(3) / 2;
	ps.ROTATE_MATRIX = $M([ [ 0.5, temp * (-1) ], [ temp, 0.5 ] ]);

	ps.XY_HONEYCOMB_MATRIX = $M([ [ 1, -0.5 ], [ 0, temp ] ]);

	for ( var i = 0; i < ps.Data.MAX_NUM; i++) {
		ps.Cache.Round.push(3 * ((i * i) + i));
	}
	$("#startOrPause").click(ps.startOrPause);
	$("#reset").click(ps.reset);

	ps.reset();
}

ps.reset = function() {
	ps.Pause = true;
	ps.count = 0;
	var ctx = ps.canvas[0].getContext('2d');
	var width = ps.canvas.width();
	var height = ps.canvas.height();
	ctx.fillStyle = "#ffffff";
	ctx.strokeStyle = "#ffffff";
	ctx.fillRect(0, 0, width, height);

	ctx.fillStyle = "#FF0000";
	ctx.strokeStyle = "#FF0000";
	
	var size = ps.Config.RECTANGLE_SIZE;
	ctx.fillRect(ps.MOVE_TO_ZERO.e(1, 1), ps.MOVE_TO_ZERO.e(2, 1), size, size);

	$("#startOrPause").val("start");
}

ps.startOrPause = function() {
	if (ps.Pause) {
		ps.Pause = false;
		ps.draw();
		$("#startOrPause").val("pause");
	} else {
		ps.Pause = true;
		$("#startOrPause").val("start");
	}
}
ps.draw = function() {
	if (ps.Pause) {
		return;
	}
	if (primeArray[ps.count] < ps.Data.MAX_NUM) {
		ps.drawOne(primeArray[ps.count]);
		ps.count++;
		setTimeout(ps.draw, 4);
	}
}
ps.drawOne = function(i) {
	var mag = ps.Config.MAGNIFY_LEVEL;
	if (ps.Pause) {
		return;
	}
	var ctx = ps.canvas[0].getContext('2d');
	ctx.fillStyle = "#000000";
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
	var point = new ps.PointInHoneycomb(i);
	var point2D = point.toPosition();
	point2D.setElements([ point2D.e(1, 1), -1 * point2D.e(2, 1) ]);
	point2D.setElements([ mag * point2D.e(1, 1), mag * point2D.e(2, 1) ]);
	point2D = point2D.add(ps.MOVE_TO_ZERO);

	var x = point2D.e(1, 1);
	var y = point2D.e(2, 1);
	var size = ps.Config.RECTANGLE_SIZE;
	ctx.fillRect(x, y, size, size);
}

ps.PointInHoneycomb = function(number) {
	this._init.apply(this, arguments);
}
ps.PointInHoneycomb.prototype = {
	plane : null,
	round : null,
	step : null,

	_init : function(number) {
		var base = 0;
		for ( var i = 1; i < ps.Cache.Round.length ; i++) {
			var prev = ps.Cache.Round[i - 1];
			var next = ps.Cache.Round[i];
			if (prev < number && number <= next) {
				base = prev;
				this.round = i;
				break;
			}
		}

		var target = number - base;
		this.plane = parseInt(target / this.round);
		this.step = target % this.round;
		if (this.plane == 0) {
			this.plane = 6;
		}
	},
	toPosition : function() {

		var result = Matrix.I(2);
		for ( var i = 1; i < this.plane; i++) {
			result = result.multiply(ps.ROTATE_MATRIX);
		}

		var thisPosition = $M([ [ this.round ], [ this.step ] ]);

		result = result.multiply(ps.XY_HONEYCOMB_MATRIX).multiply(thisPosition);
		return result;
	}
}
