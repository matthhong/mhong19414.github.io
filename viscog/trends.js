var width = 500,
    height = 500;

var showArrows = false;
var showDots = true;
var showLabels = false;
var showGrid = false;
var smoothLines = true;

var disconnected = false;
var cheatMode = true;

var study = false;

var clockwise = true;

// fraction of lines with arrows
var ARROW_FRACTION = .2;

var randomizeRightChart = false;

var initialDiamond = [{"date":"9/1/1980","value1":5,"value2":5},{"date":"1/1/1981","value1":5,"value2":6.11111111111111},{"date":"5/2/1981","value1":3.8888888888888895,"value2":5},{"date":"9/1/1981","value1":5,"value2":3.888888888888889},{"date":"1/1/1982","value1":6.111111111111112,"value2":5}];

var interactDALC = true;
var interactConnected = true;

var DAGRIDSIZE = height/9;

var GENERATEDATASETS = true;

var PADX = 40;
var PADY = 20;

var commonScales = false;

var leftChart;
var rightChart;

// these are just for the CSCK, so the two can communicate when points are moved.
var globalDALC, globalCS;

var currentDataSet;

var pointsToDraw;

var timeScale = d3.time.scale()
	.range([10, width-10]);

var xScale = d3.scale.linear()
	.range([width, 0]);

var yScale = d3.scale.linear()
	.range([height, 0]);

var draggedIndex = -1,
	draggingBlue = true,
    selectedIndex = -1;

function makeConnected(connectedScatterSelector, interactive, dataPoints) {

	var connected = {
		svg: null,
		background: null,
		foreground: null,
		points: dataPoints,
		isConnected: true
	};

	// Draw lines
	connected.lineDA = d3.svg.line() 
		.x(function(d) { return width-xScale(d.value1); })
		.y(function(d) { return yScale(d.value2); })
		.interpolate(smoothLines?'cardinal':'linear');

	// Remove existing svg
	d3.select(connectedScatterSelector).select('svg').remove();

	// Padding for overflowing features
	connected.svg = d3.select(connectedScatterSelector).append('svg')
		.attr('width', width+1.5*PADX)
		.attr('height', height+2*PADY)
		.attr('tabindex', 2);

	connected.background = connected.svg.append('g');

	connected.background.append('path')
		.attr('class', 'cheat')
		.attr('transform', 'translate('+PADX+' '+PADY+')')
		.style('display', cheatMode?'inline':'none');
//		.datum(connected.points);

	connected.foreground = connected.svg.append('g')
		.attr('transform', 'translate('+PADX+' '+PADY+')');

	// marker triangle from http://www.w3.org/TR/SVG/painting.html#Markers
	connected.foreground.append('defs')
		.append('marker')
			.attr('id', 'arrow')
			.attr('viewBox', '0 0 10 6')
			.attr('refX', 10)
			.attr('refY', 3)
			.attr('markerUnits', 'strokeWidth')
			.attr('markerWidth', 8)
			.attr('markerHeight', 5)
			.attr('orient', 'auto')
			.attr('stroke', 'white')
			.attr('fill', 'purple')
			.append('polygon')
				.attr('points', '0,0 10,3 0,6');

	connected.foreground.append('rect')
		.attr('width', width)
		.attr('height', height);

	connected.foreground.append('path')
		.datum(connected.points)
		.attr('d', connected.lineDA)
		.attr('class', 'line');

	if (interactive) {
		connected.foreground
			.on('mousemove', function() {
				mousemoveCS(connected);
			})
			.on('mouseup', mouseup);
	}

	connected.redraw = function(recreate) {
		redrawConnected(connected, recreate);
	}

	connected.toggleSmooth = function() {
		if (smoothLines) {
			connected.lineDA.interpolate('cardinal');
		} else {
			connected.lineDA.interpolate('linear');
		}
	}

	connected.toggleCheatMode = function() {
		if (cheatMode) {
			connected.background.select('path.cheat').style('display', 'inline');
		} else {
			connected.background.select('path.cheat').style('display', 'none');
		}
	}

	connected.toggleGrid = function() {
		if (showGrid) {
			connected.background.selectAll('line.grid1')
				.data(d3.range(-width, width, DAGRIDSIZE))
				.enter().append('line')
					.attr('class', 'grid1')
					.attr('x1', function(d) { return d>0?PADX+width:PADX+width+d; })
					.attr('y1', function(d) { return d>0?PADY+d:PADY; })
					.attr('x2', function(d) { return d>0?PADX+d:PADX; })
					.attr('y2', function(d) { return d>0?PADY+height:PADY+height+d; });

			connected.background.selectAll('line.grid2')
				.data(d3.range(-width, width, DAGRIDSIZE))
				.enter().append('line')
					.attr('class', 'grid2')
					.attr('x1', function(d) { return Math.max(PADX, PADX+d); })
					.attr('y1', function(d) { return d<0?PADY-d:PADY; })
					.attr('x2', function(d) { return Math.min(PADX+d+width, PADX+width); })
					.attr('y2', function(d) { return d<0?PADY+height:PADY+height-d; });
		} else {
			connected.background.selectAll('line.grid1').remove();
			connected.background.selectAll('line.grid2').remove();
		}
	}

	return connected;
}