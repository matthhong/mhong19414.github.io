var drawCS = function(trial){
	//Draw normally
	currentDataSet = trial.left.data;
	leftChart = makeConnected('#leftChart', true, trial.left.data);
	rightChart = makeConnected('#rightChart', true, trial.right.data);
	// afterUpdatePoints();

	//Change if you wanna mess with the axis min/max
	xScale.domain([0, 1]);
	yScale.domain([0, 1]);

	redraw(true);
}

var drawDALC = function(trial) {
	//Draw normally
	currentDataSet = trial.left.data;
	globalDALC = leftChart = makeDALC('#leftChart', true, trial.left.data);
	globalCS = rightChart = makeDALC('#rightChart', true, trial.right.data);
	afterUpdatePoints();

	//Change if you wanna mess with the axis min/max
	xScale.domain([0, 1]);
	yScale.domain([0, 1]);

	redraw(true);
};