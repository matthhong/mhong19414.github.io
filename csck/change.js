var config = {
  apiKey: "AIzaSyCpAJIO8anJshx1G-Qhy2qDl2u-QtD_UD4",
  authDomain: "project-1718224482862335212.firebaseapp.com",
  databaseURL: "https://project-1718224482862335212.firebaseio.com",
  storageBucket: "",
};
firebase.initializeApp(config);
var db = firebase.database();

var debug = window.location.href.indexOf('debug') >= 0;

var penalty = (debug ? 0 : 10000);
var timeLimit = (debug ? 1000000 : 10000);
var numTrials = 2;

// Set Hurst randomly
// var hurst = math.ceil(Math.random() * 4) * 2;
var exps = d3.shuffle(['b','b','b']);
var config = {
	'hurst': 6,
	'direction': 'positive',
	'sensitivity': 'slower'
}
var chartType = d3.shuffle(['cs', 'cs']).pop();
if (chartType === 'sm') {
	dalc = false;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

var block;
var Block = function(chartType, hurst, exp, direction, sensitivity){
	this.chartType = chartType;
	this.hurst = hurst;
	this.exp = exp;
	this.direction = direction || '';
	this.sensitivity = sensitivity || '';
	this.subjectID = getRandomInt(1000000, 9999999);
	this.trials = [];
};

var masks = [];
var mask = { left: { data: [] }, right: { data: [] }};

function makeMask() {
	for (var i = 0; i < 7; i++) {
		var mask = { left: { data: [] }, right: { data: [] }};
		for (var j = 0; j < 100; j++) {
			date = new Date(2016,j,1);
			mask.left.data.push({
				date: date,
				value1: Math.random(),
				value2: Math.random()
			});
			mask.right.data.push({
				date: date,
				value1: Math.random(),
				value2: Math.random()
			});
		};
		masks.push(mask);
	};
}

function getData(exp, config) {
	makeMask();

	var dir = ''
	if (exp === 'a') { 
		dir = 'datasets/change-data/H' + config.hurst + '-a.json'; 
	}
	else if (exp === 'b') { 
		dir = 'datasets/change-data/H' + config.hurst + '-b-' + config.direction + '.json';
		$('.direction').html(config.direction + 'ly');
	}
	else if (exp === 'c') { 
		dir = 'datasets/change-data/H' + config.hurst + '-c-' + config.direction + '-' + config.sensitivity + '-.json';
		$('.direction').html(config.direction + 'ly');
		$('.sensitivity').html(config.sensitivity);
	} 

	d3.json(dir, function(d){
		d = d3.shuffle(d);
		datasets = [];

		// Experiment C already has 2 charts in each trial; for others, must select 2 at a time
		// numCoeff = exp === 'c' ? 1 : 2;
		if (exp === 'c') {
			for (var i = 0; i < numTrials; i++) {
				var pair = [];
				var temp = d[i];

				for (var j = 0; j < temp.length; j++) {
					var date;
					var dataset = {};
					var data = [];

					for (var k = 0; k < temp[j].values1.length; k++) {
						date = new Date(2016,k,1);
						data.push({
							date: date,
							// Switch... mixed up green and blue... blame Robert and Steves
							value1: temp[j].values1[k],
							value2: temp[j].values2[k]
						});
					};

					dataset.data = data;
					for (var k in temp[j]) {
						if ((k !== 'values1' || k !== 'values2') && temp[j].hasOwnProperty(k)) {
							dataset[k] = temp[j][k];
						}
					};

					pair.push(dataset);
				}
				datasets.push(pair);
			};

		} else {
			for (var i = 0; i < numTrials*2; i++) {
				var date;
				var dataset = {};
				var data = [];
				var temp = d[i];

				for (var j = 0; j < temp.values1.length; j++) {
					date = new Date(2016,j,1);
					data.push({
						date: date,
						value1: temp.values1[j],
						value2: temp.values2[j],
					});
				}

				dataset.data = data;

				for (var k in temp) {
					if ((k !== 'values1' || k !== 'values2') && temp.hasOwnProperty(k)) {
						dataset[k] = temp[k];
					}
				};
				datasets.push(dataset);
				// dataset is 1 chart 
				// need 2 charts per trial 
				// take 2 at once
			};
		}


		block = new Block(chartType, config.hurst, exp, config.direction, config.sensitivity);
		block.datasets = datasets;
	});
}

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

function setResponse (exp, trial, chart, response) {
	if (exp === "a") {
		answerKey = {
			"positively": 1,
			"negatively": -1
		}

		if (trial[chart]["Sign of correlation"] === answerKey[response]) {
			trial[chart].correct = true;
		} else { trial[chart].correct = false; }

		trial.correct = trial.left.correct && trial.right.correct;
	} else if (exp === "b") {
		answerKey = {
			"faster": 'Shallow',
			'slower': 'Steep'
		}
		console.log(trial[chart]["Steepness"])
		if (trial[chart]["Steepness"] === answerKey[response]) {
			trial[chart].correct = true;
		} else { trial[chart].correct = false; }

		trial.correct = trial.left.correct && trial.right.correct;	
	} else if (exp === "c") {
		var slopeDiff = Math.abs(trial[chart]["Regression slope"]) - Math.abs(trial[otherChart(chart)]["Regression slope"]);

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


/////INTERACTION

// $('#next').hover(function(){
// 	$('html').css('cursor','none');
// 	$(this).fadeOut(500);
// }, function() {
// 	// $(this).css('cursor','default')
// })

// Pressing both shift keys
var keys = {
  qkey: false,
  backslash: false
};

var step = function(event, callback){
	if (event.keyCode == 81) {
      keys["qkey"] = true;
  } else if (event.keyCode == 220) {
      keys["backslash"] = true;
  }
  if (keys["qkey"] && keys["backslash"]) {
  	keys["qkey"] = false;
  	keys["backslash"] = false;
  	callback();
  }
}

function reset (exps, config){
	if (exps.length === 0) {
		$('#done').show();
	} else {
		var exp = exps[exps.length-1]
		exps.pop();
		$('#exp-' + lastLetter(exp)).hide();
		getData(exp, config);
		$(document).off();
		$('#study').hide();

		erase();

		setChartName(chartType);
		setTutorialImage(exp, chartType,config)
		tutorialNow = 1;
		$(document).on('keydown', function(event){
			tutorialStep(event,exp,chartType)
		});
		$(tutorialClass(exp,1,chartType)).show();
	}
}

function erase(mask) {
	$('#leftChart').empty();
	$('#rightChart').empty();
	$('#leftChart').hide();
	$('#rightChart').hide();
	// if (mask) {
		$('.mask').hide();
	// }
}

function setChartName(chartType) {
	var name= ''
	if (chartType === 'cs') {
		name = 'Connected scatterplots';
	} else {
		name = 'Line charts';
	}
	$('.chart-name').html(name);
}

function setTutorialImage(exp, chartType, config, id) {
	if (id !== 0) { id = 1; }
	if (exp === 'c') {
		$('img.instructional').attr('src', 'img/change-tutorial/instructional-'+exp+'-'+config.direction+'-'+config.sensitivity+'-'+chartType+'-'+id+'.png')
	} else if (exp === 'b' ){
		$('img.instructional').attr('src', 'img/change-tutorial/instructional-'+exp+'-'+config.direction+'-'+chartType+'.png')
	} else {
		$('img.instructional').attr('src', 'img/change-tutorial/instructional-'+exp+'-'+chartType+'.png')
	}
}

function tutorialClass(exp, i, chartType) {
	return '#tutorial-' + exp + ' .tutorial-' + i + '.tutorial-' + chartType;
}

//////EXPERIMENT
// Tutorial
var tutorialNow = 1;
var tutorialStep = function(event,exp,chartType){
	step(event, function(){
		if (tutorialNow < 4) {
			if (exp === 'c' && tutorialNow === 2) {
				console.log('msg')
				setTutorialImage(exp, chartType, config, 0);
			}
			$(tutorialClass(exp, tutorialNow, chartType)).hide();
			$(tutorialClass(exp, tutorialNow+1, chartType)).show();
		} 
		else {
			$(tutorialClass(exp, tutorialNow, chartType)).hide();
			$(document).off();

			runTrials(exp);
		}
		++tutorialNow;
	});
};

//To send results
function sendJSON(_block, callback) {
    // // make sure version is set
    // _block.version = perfExperiment.version;
    // // show size of block data
    // console.log(encodeURIComponent(JSON.stringify(_block, null, " ")).length);

    // get correctess and time
    _block.avgRT = _block.trials.reduce(function (accumulator, trial) { return accumulator + trial.responseTime; }, 0) / _block.trials.length;
    _block.avgCorrect = _block.trials.reduce(function (accumulator, trial) { return accumulator + trial.correct; }, 0) / _block.trials.length;

    // send
    delete _block.datasets;
    console.log(_block.chartType+'/'+ _block.hurst+'/'+_block.subjectID)
    db.ref(_block.chartType+'/'+ _block.hurst+'/'+_block.subjectID).set(_block);
};

function runTrials(exp){
	//Runs all trials in a block, recursively
	//Deferred function; resolves after entire recursion finishes\

	for (var i = 0; i < masks.length; i++) {
		if (block.chartType === 'cs') {
			drawCS(masks[i], 'Mask', i);
		} else {
			drawDALC(masks[i], 'Mask', i);
		}
	};
	$('.mask').hide();

	if (exp === 'a' || exp === 'b') {
		for (var j = 0; j<block.datasets.length; j+=2) {
			var t = new Trial(exp, j, block.datasets[j], block.datasets[j+1]);
			// should take 2 at once, unless C: already comes at once
			block.trials.push(t);
		};
	} else if (exp === 'c') {
		for (var j = 0; j < block.datasets.length; j++) {
			d3.shuffle(block.datasets[j]);
			var t = new Trial(exp, j, block.datasets[j][0], block.datasets[j][1]);
			block.trials.push(t);
		};
	}

	var lastCorrect = null;
	var reversals = 0;

	var recur = function(block, trialNo){
		// Recursion
		var trial = block.trials[trialNo];
		
		// Show question
		$('#study').show();
		$('#exp-' + exp).show();
		$('button').prop('disabled', true);
		$('.choice').removeClass('active');

		//Hidden but draw chart
		if (block.chartType === 'cs') {
			drawCS(trial, 'Chart');
		} else {
			drawDALC(trial, 'Chart');
		}

		// Lure cursor, hide it, then switch
		$('#next').show()
			.on('mouseenter', function(){
				$('html').css('cursor','none');
				$('#next img').attr('src', 'img/hold-buttons.png');
				// $(this).fadeOut(500, function(){
				$(document).on('keydown', function(event){
					step(event, function(){
						$('#next').hide();
						$('#next img').attr('src', 'img/next.png');
						$('#next').off('mouseenter');
						draw();
					});
				});
					// draw();
					// $('#next').off('mouseenter');
				// });
			});

		function draw(){

			$('#leftChart').show();
			$('#rightChart').show();
			var dateStart = new Date();
			
			$(document.body).on('keyup', function(event) {
		    // reset status of the button 'released' == 'false'
		    if (event.keyCode == 81) {
		        keys["qkey"] = false;
		    } else if (event.keyCode == 220) {
		        keys["backslash"] = false;
		    }
		    timed();
		    enableChoice();
			});

			$(document).off();

			// Choice buttons
			function enableChoice() {
				$(document.body).off('keyup');

				$('#leftChart').empty();
				$('#rightChart').empty();
				$('.mask').show();

				$('html').css('cursor','auto');
				$('button').prop('disabled', false);

				$('.choice').on('click', function(){

					// So one in each can be active
					$(this).addClass('active')
						.siblings().removeClass('active');

					if ($('#exp-'+exp+' button').length/2 - $('.active').length == 0) {
						// When both choices made
						evaluate();
					};
				});
			}

			function timed() {
				var dateEnd = new Date();
				trial.responseTime = (dateEnd - dateStart)/1000;
				$('#time-display').html(trial.responseTime);
				$('#response-time').show();
			}

			function evaluate() {
				var responses = $.find('.active');

				if (exp === 'a' || exp === 'b') {
					setResponse(exp, trial, 'left', $(responses[0]).text());
					setResponse(exp, trial, 'right', $(responses[1]).text());
				} else {
					var response = $(responses[0]).text();
					var chart = response === 'greater' ? 'left' : 'right';
					setResponse(exp, trial, chart, response);
				}

				if (trial.correct) {
					$('#feedback').html('Correct!').css('color', 'blue');
					$('#correct').show();
					$('#press-continue').show();
					moveOn();
				} else {
					$('#feedback').html('Wrong. Timed out for ' + penalty/1000 + ' seconds...').css('color', 'red');
					$('#time-out').show();
					$('#correct').show();
					setTimeout(function(){
						$('#press-continue').show();
						moveOn();
					}, penalty)
				}

				function moveOn() {
					$(document).on('keydown', function(event){
						step(event, endTrial);
					})
				}
				// Disable buttons
				$('button').prop('disabled', true);
				erase();
			}

			function endTrial() {
				console.log(trial.responseTime);
				console.log(trial.correct);

				// if (lastCorrect !== trial.correct && lastCorrect !== null) { reversals++; }
				// lastCorrect = trial.correct;

				$('#time-out').hide();
				$('.result').hide();
				$('.choice').off('click');
				$(document).off('keydown');

				delete trial.left.data;
				delete trial.right.data;

				if (trialNo === 0 || reversals === 12) {
					sendJSON(block);
					reset(exps, config);
				} else {
					// stair.next(trial.left.correct && trial.right.correct);
					recur(block, --trialNo);
				}
			}
		};
	};

	// Begin recursion
	recur(block, block.trials.length - 1);
};

reset(exps, config);

function nextLetter(alphabet){
	return String.fromCharCode(alphabet.charCodeAt() + 1);
};

function lastLetter(alphabet){
	return String.fromCharCode(alphabet.charCodeAt() - 1);
};