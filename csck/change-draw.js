var drawCS = function(trial){
	//Draw normally
	currentDataSet = trial.data;
	globalCS = leftChart = makeConnected('#leftChart', true, trial.data);
	globalDALC = rightChart = makeConnected('#rightChart', true, trial.data);
	afterUpdatePoints();

	//Change if you wanna mess with the axis min/max
	xScale.domain([0, 10]);
	yScale.domain([0, 10]);

	redraw(true);
}

var drawDALC = function(trial) {
	//Draw normally
	currentDataSet = trial.data;
	globalDALC = leftChart = makeDALC('#leftChart', true, trial.data);
	globalCS = rightChart = makeDALC('#rightChart', true, trial.data);
	afterUpdatePoints();

	//Change if you wanna mess with the axis min/max
	xScale.domain([0, 10]);
	yScale.domain([0, 10]);

	redraw(true);
};