var subjectID = getRandomInt(1000000, 9999999);

var Block = function(chartType, hurst, exp, direction, sensitivity){
	this.chartType = chartType;
	this.hurst = hurst;
	this.exp = exp;
	this.direction = direction || '';
	this.sensitivity = sensitivity || '';
	this.subjectID = subjectID;
	this.trials = [];
};

var Trial = function(exp, chartType, dataset1, dataset2){
	// Attach data
	this.exp = exp;
	this.index = 0;
	this.chartType = chartType;
	this.left = {};
	this.right = {};
	for (var i in dataset1) {
		if (dataset1.hasOwnProperty(i)){
			this.left[i] = dataset1[i];
		}
	}
	for (var i in dataset2) {
		if (dataset2.hasOwnProperty(i)){
			this.right[i] = dataset2[i];
		}
	}

	// Results
	this.responseTime = 0;

	if (exp !== 'c') {
		this.left.response = null;
		this.right.response = null;
		this.left.correct = null;
		this.right.correct = null;
	} else {
		this.response = null;
	}

	this.correct = null;
};

function setResponse (trial, chart, response) {
	if (trial.exp === "a") {
		answerKey = {
			"positively": 1,
			"negatively": -1
		}

		trial[chart].response = response;

		if (trial[chart]["Sign of correlation"] === answerKey[response]) {
			trial[chart].correct = true;
		} else { trial[chart].correct = false; }

		trial.correct = trial.left.correct && trial.right.correct;
	} else if (trial.exp === "b") {
		answerKey = {
			"faster": 'Shallow',
			'slower': 'Steep'
		}

		trial[chart].response = response;

		if (trial[chart]["Steepness"] === answerKey[response]) {
			trial[chart].correct = true;
		} else { trial[chart].correct = false; }

		trial.correct = trial.left.correct && trial.right.correct;	
	} else if (trial.exp === "c") {
		var slopeDiff = Math.abs(trial[chart]["Regression slope"]) - Math.abs(trial[otherChart(chart)]["Regression slope"]);

		trial.response = chart;

		if (Math.abs(trial[chart]["Regression slope"]) > 1 && slopeDiff > 0
				|| Math.abs(trial[chart]["Regression slope"]) < 1 && slopeDiff < 0) {
			trial.correct = true;
		} else { trial.correct = false; }
	}

	function otherChart(chart){
		if (chart === "left") {
			return "right";
		} 
		return "left";
	}
};