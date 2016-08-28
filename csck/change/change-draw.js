ARROW_FRACTION = 0.5;
GENERATEDATASETS = false;

interactDALC = false;
showArrows = false;
smoothLines = false;
showLabels = true;
study = true;
disconnected = true;
commonScales = true;
cheatMode = false;

var drawCS = function(trial, mask, i){
	if (mask == "Mask") {
		$('#leftWrapper').append("<div class='mask' id='leftMask" + i + "''></div>")
		$('#rightWrapper').append("<div class='mask' id='rightMask" + i + "'></div>")
		var leftID = '#leftMask' + i;
		var rightID = '#rightMask' + i;
	} else {
		var leftID = '#leftChart';
		var rightID = '#rightChart';
	}

	currentDataSet = trial.left.data;
	leftChart = makeConnected(leftID, true, trial.left.data);
	rightChart = makeConnected(rightID, true, trial.right.data);
	afterUpdatePoints();

	//Change if you wanna mess with the axis min/max
	xScale.domain([0, 1]);
	yScale.domain([0, 1]);

	redraw(true);
}

var drawDALC = function(trial, mask, i) {
	if (mask == "Mask") {
		$('#leftWrapper').append("<div class='mask' id='leftMask" + i + "''></div>")
		$('#rightWrapper').append("<div class='mask' id='rightMask" + i + "'></div>")
		var leftID = '#leftMask' + i;
		var rightID = '#rightMask' + i;
	} else {
		var leftID = '#leftChart';
		var rightID = '#rightChart';
	}

	currentDataSet = trial.left.data;
	leftChart = makeDALC(leftID, true, trial.left.data);
	rightChart = makeDALC(rightID, true, trial.right.data);
	afterUpdatePoints();

	//Change if you wanna mess with the axis min/max
	xScale.domain([0, 1]);
	yScale.domain([0, 1]);

	y1Scale.domain([0, 1]);
	y2Scale.domain([0, 1]);

	redraw(true);
};

function erase(mask) {
	$('#leftChart').empty();
	$('#rightChart').empty();
	$('#leftChart').hide();
	$('#rightChart').hide();
	// if (mask) {
		$('.mask').hide();
	// }
}

//Hidden but draw chart
function drawHidden(trial, trialNo) {

	erase();
	if (trial.chartType === 'cs') {
		drawCS(trial, 'Chart');
	} else {
		drawDALC(trial, 'Chart');
	}
	$
	delete trial.left.data;
	delete trial.right.data;
}


function drawMask() {
	for (var i = 0; i < masks.length; i++) {
		if (chartType === 'cs') {
			drawCS(masks[i], 'Mask', i);
		} else {
			drawDALC(masks[i], 'Mask', i);
		}
	};
	$('.mask').hide();
}


// var drawDALCMask = function(masks) {
// 	var charts = drawDALC(masks[0], 'Mask');

// 	var line1 = d3.svg.line()
// 		.x(function(d) { return timeScale(d.date); })
// 		.y(function(d) { return dalc ? xScale(d.value1) : y1Scale(d.value1); })
// 		.interpolate(smoothLines?'cardinal':'linear');

// 	var line2 = d3.svg.line()
// 		.x(function(d) { return timeScale(d.date); })
// 		.y(function(d) { return dalc ? yScale(d.value2) : y2Scale(d.value2); })
// 		.interpolate(smoothLines?'cardinal':'linear');
// 	asd = charts[0]
// 	for (var i = 0; i < 2; i++) {
// 		charts[0].foreground.select('path.line1').datum(masks[i].left.data).attr('d', line1);
// 		charts[0].foreground.select('path.line2').datum(masks[i].left.data).attr('d', line2);

// 		charts[1].foreground.select('path.line1').datum(masks[i].right.data).attr('d', line1);
// 		charts[1].foreground.select('path.line2').datum(masks[i].right.data).attr('d', line2);
// 	}
// }