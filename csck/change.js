$(function(){

var config = {
  apiKey: "AIzaSyCpAJIO8anJshx1G-Qhy2qDl2u-QtD_UD4",
  authDomain: "project-1718224482862335212.firebaseapp.com",
  databaseURL: "https://project-1718224482862335212.firebaseio.com",
  storageBucket: "",
};
firebase.initializeApp(config);
var db = firebase.database();

var debug = window.location.href.indexOf('debug') >= 0;

var timeLimit = (debug ? 1000000 : 10000);
var numTrials = 2;

// Set Hurst randomly
// var hurst = math.ceil(Math.random() * 4) * 2;
var exps = d3.shuffle(['a','b','c']);
var config = {
	'hurst': 8,
	'signOfCorr': 'negative',
	'sensitivity': 'faster'
}
var chartType = d3.shuffle(['cs', 'dalc']).pop();

var stair = new Staircase({
	deltaT: {
		firstVal: 1500,
		limits: [0, 30000],
		direction: '-1',
		operation: 'multiply',
		factor: 4/3,
		down: 1
	}
});
stair.init();

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
var Block = function(chartType, hurst, exp, signOfCorr, sensitivity){
	this.chartType = chartType;
	this.hurst = hurst;
	this.exp = exp;
	this.signOfCorr = signOfCorr || '';
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
		dir = 'datasets/change-data/H' + config.hurst + '-b-' + config.signOfCorr + '.json';
		$('#direction').html(config.signOfCorr + 'ly');
	}
	else if (exp === 'c') { 
		dir = 'datasets/change-data/H' + config.hurst + '-c-' + config.signOfCorr + '-' + config.sensitivity + '.json';
		$('#direction').html(config.signOfCorr + 'ly');
		$('#sensitivity').html(config.sensitivity);
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


		block = new Block(chartType, config.hurst, exp, config.signOfCorr, config.sensitivity);
		block.datasets = datasets;
	});
}

var Trial = function(exp, dataset1, dataset2){
	// Attach data
	this.exp = exp;
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
			"slower": 'Shallow',
			'faster': 'Steep'
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
	var exp = exps[exps.length-1]
	exps.pop();
	$('#exp-' + lastLetter(exp)).hide();
	getData(exp, config);
	if (exp === 'd') {
		$('#done').show();
	} else {
		$(document).off();
		$('#study').hide();
		$('button').prop('disabled', true)

		erase();

		tutorialNow = 1;
		$(document).on('keydown', function(event){
			tutorialStep(event,exp)
		});
		$('#tutorial-1').show();
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

//////EXPERIMENT
// Tutorial
var tutorialNow = 1;
var tutorialStep = function(event,exp){
	step(event, function(){
		if (tutorialNow < 4) {
			$('#tutorial-' + tutorialNow).hide();
			$('#tutorial-' + (tutorialNow + 1)).show();
		} 
		else {
			$('#tutorial-' + tutorialNow).hide();
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
			var t = new Trial(exp, block.datasets[j], block.datasets[j+1]);
			// should take 2 at once, unless C: already comes at once
			block.trials.push(t);
		};
	} else if (exp === 'c') {
		for (var j = 0; j < block.datasets.length; j++) {
			d3.shuffle(block.datasets[j]);
			var t = new Trial(exp, block.datasets[j][0], block.datasets[j][1]);
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
					$('#feedback').html('Wrong. Timed out for 10 seconds...').css('color', 'red');
					$('#time-out').show();
					$('#correct').show();
					setTimeout(function(){
						$('#press-continue').show();
						moveOn();
					}, 10000)
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
				$('.choice').removeClass('active');
				$(document).off('keydown');

				delete trial.left.data;
				delete trial.right.data;

				if (trialNo === 0 || reversals === 12) {
					sendJSON(block);
					reset(nextLetter(exp), config);
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

});