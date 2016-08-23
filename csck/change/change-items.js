var Block = function(chartType, hurst, exp, direction, sensitivity){
	this.chartType = chartType;
	this.hurst = hurst;
	this.exp = exp;
	this.direction = direction || '';
	this.sensitivity = sensitivity || '';
	this.subjectID = getRandomInt(1000000, 9999999);
	this.trials = [];
};

var Trial = function(exp, index, dataset1, dataset2){
	// Attach data
	this.exp = exp;
	this.index = index;
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
	this.left.response = null;
	this.right.response = null;
	this.left.correct = null;
	this.right.correct = null;
	this.correct = null;
};
