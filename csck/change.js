$(function(){

// var config = {
//   apiKey: "AIzaSyCpAJIO8anJshx1G-Qhy2qDl2u-QtD_UD4",
//   authDomain: "project-1718224482862335212.firebaseapp.com",
//   databaseURL: "https://project-1718224482862335212.firebaseio.com",
//   storageBucket: "",
// };
// firebase.initializeApp(config);
// var db = firebase.database();

var debug = window.location.href.indexOf('debug') >= 0;

var timeLimit = (debug ? 1000000 : 10000);
var numTrials = 1;

// Set Hurst randomly
// var hurst = math.ceil(Math.random() * 4) * 2;
var hurst = 2;
var chartType = d3.shuffle(['cs', 'cs']).pop();

var stair = new Staircase({
	deltaT: {
		firstVal: 500,
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
var Block = function(chartType, hurst, exp, signOfCorr, sens){
	this.chartType = chartType;
	this.hurst = hurst;
	this.exp = exp;
	this.signOfCorr = signOfCorr;
	this.sens = sens;
	this.subjectID = getRandomInt(1000000, 9999999);
	this.trials = [];
};


var masks = [];

function getData(hurstCoeff, exp, signOfCorr) {
	var dir = ''
	if (exp === 'a') { dir = 'datasets/change/H' + hurstCoeff + '-a.json' }
	else if (exp === 'b') { dir = 'datasets/change/H' + hurstCoeff + '-b-' + signOfCorr + '.json'  }
	else if (exp === 'c') { dir = 'datasets/change/H' + hurstCoeff + '-c-' + signOfCorr + '-' + sens + '.json'} 

	d3.json(dir, function(d){
		datasets = [];

		for (var i = 0; i < d.length; i++) {
			var date;
			var dataset = {};
			var data = [];
			var temp = d[i];

			var mask = { left: { data: [] }, right: { data: [] }};

			for (var j = 0; j < 100; j++) {
				date = new Date(2016,j,1);
				data.push({
					date: date,
					value1: temp.values1[j],
					value2: temp.values2[j],
				});
				if (i%20 === 0){
					mask.left.data.push({
						date: date,
						value1: temp.values1[j],
						value2: temp.values2[j],
					});
				}
			}
			if (i%20 === 0){
				mask.right.data = mask.left.data;
				masks.push(mask);
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

		block = new Block(chartType, hurst, exp, signOfCorr);
		block.datasets = d3.shuffle(datasets);
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
			"shallow": 'Shallow',
			'steep': 'Steep'
		}

		if (trial[chart]["Steepness"] === answerKey[response]) {
			trial[chart].correct = true;
		} else { trial[chart].correct = false; }

		trial.correct = trial.left.correct && trial.right.correct;	
	} else if (exp === "c") {
		var slopeDiff = abs(trial[chart]["Regression slope"]) - abs(trial[otherChart(chart)]["Regression slope"]);

		if (slopeDiff > 1) {
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

$('#next').hover(function(){
	$('html').css('cursor','none');
	$(this).fadeOut(500);
}, function() {
	// $(this).css('cursor','default')
})

// Pressing both shift keys
var keys = {
  qkey: false,
  backslash: false
};

$(document.body).keyup(function(event) {
    // reset status of the button 'released' == 'false'
    if (event.keyCode == 81) {
        keys["qkey"] = false;
    } else if (event.keyCode == 220) {
        keys["backslash"] = false;
    }
    // erase();
});

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

function reset (exp){
	getData(hurst,exp);
	if (exp === 'd') {
		$('#done').show();
	} else {
		$(document).off();
		$('#study').hide();

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
		if (tutorialNow < 3) {
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
    console.log(_block.blockClass+'/'+_block.chartType+'/'+ 
    	_block.avgRT+ '-' +  _block.avgCorrect + '_' + _block.subjectID)
    db.ref(_block.blockClass+'/'+_block.chartType+'/'+_block.subjectID).set(_block);
};

function runTrials(exp){
	//Runs all trials in a block, recursively
	//Deferred function; resolves after entire recursion finishes
	var trial;

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
			trial = new Trial(exp, block.datasets[j], block.datasets[j+1]);
			// should take 2 at once, unless C: already comes at once
			block.trials.push(trial);
		};
	} else if (exp === 'c') {
		for (var j = 0; j < block.datasets.length; j++) {
			d3.shuffle(block.datasets[j]);
			trial = new Trial(exp, block.datasets[j][0], block.datasets[j][1]);
			block.trials.push(trial)
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

		// Disable buttons
		$('button').prop('disabled', true);

		// Draw chart upon holding down two keys
		$('#next').show()
			.on('mouseenter', function(){
				$('html').css('cursor','none');
				$(this).fadeOut(500, function(){
					draw();
					$('#next').off('mouseenter');
				});
			});

		function draw(){
			console.log(stair.getLast('deltaT'))

			$('#leftChart').show();
			$('#rightChart').show();
			setTimeout(enableChoice, stair.getLast('deltaT'));

			var dateStart = new Date();

			$(document).off();

			// Choice buttons
			function enableChoice() {
				// erase();
				$('.mask').show();

				$('html').css('cursor','auto');
				$('button').prop('disabled', false);

				$('.choice').on('click', function(){

					// So one in each can be active
					$(this).addClass('active')
						.siblings().removeClass('active');

					if ($('.active').length > 1) {
						// When both choices made
						$('#continue').show();

						$(document).on('keydown', function(event){
							step(event, endTrial);
						})
					};
				});
			}

			function endTrial() {
				erase();
				var dateEnd = new Date();
				trial.responseTime = stair.getLast('deltaT');

				var responses = $.find('.active');
				setResponse(exp, trial, 'left', $(responses[0]).text());
				setResponse(exp, trial, 'right', $(responses[1]).text());

				if (lastCorrect !== trial.correct && lastCorrect !== null) { reversals++; }
				lastCorrect = trial.correct;

				$('.result').hide();
				$('.choice').off('click');
				$('.choice').removeClass('active');
				$(document).off('keydown');

				if (trialNo === 0 || reversals === 12) {
					sendJSON(block);
					reset(exp);
				} else {
					stair.next(trial.left.correct && trial.right.correct);
					recur(block, --trialNo);
				}
			}
		};
	};

	// Begin recursion
	recur(block, block.trials.length - 1);
};

reset('a');

});