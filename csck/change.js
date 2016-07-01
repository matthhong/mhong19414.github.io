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
var numTrials = 1;

// Order of chart types to be given
var chartTypeSeq = d3.shuffle(['c', 'd']);

switch (qs['type']) {
	case 'dalc':
		chartTypeSeq = ['d','d'];
		break;
	case 'cs':
		chartTypeSeq = ['c','c'];
		break;
}

// Order of blocks to be given
var blockSeq = d3.shuffle(['p', 'h', 'i']);

switch (qs['block']) {
	case 'pure':
		blockSeq = ['p','p','p'];
		break;
	case 'highlighted':
		blockSeq = ['h','h','h'];
		break;
	case 'isolated':
		blockSeq = ['i','i','i'];
		break;
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

var trendsDatasets = [];

loadDataSets(true, function(){
	dataAngles = makeTrendsDataAngles();
	dataSlopes = makeTrendsDataSlopes();

	trendsDatasets = dataAngles.concat(dataSlopes);

	if (qs['greenslope'] || qs['blueslope'] || qs['distance']) {
		trendsDatasets = dataSlopes;
	} else if (qs['angle'] || qs['length']) {
		trendsDatasets = dataAngles;
	}
	// switch (qs['data']) {
	// 	case 'angles':
	// 		trendsDatasets = dataAngles;
	// 		break;
	// 	case 'slopes':
	// 		trendsDatasets = dataSlopes;
	// 		break;
	// }
	// trendsDatasets = makeHyperbolaDatasets();
}, 'translate'); //Borrowing some factors from the translate study

// Block 1: Chart
// Block 2: Chart with highlighting
// Block 3: Chart with filtering
// Block 4: Single segment
var Block = function(chartType,blockClass, subjectID){
	this.chartType = chartType;
	this.blockClass = blockClass;
	this.subjectID = subjectID;
	this.trials = [];
	this.datasets = d3.shuffle(trendsDatasets);
};

var Trial = function(blockClass, dataset){
	// Attach data
	this.data = dataset.data;
	this.label1 = dataset.label1;
	this.label2 = dataset.label2;
	this.ind = dataset.ind;
	this.params = dataset.params;

	// Opacity of the features not in question
	if (blockClass === 'p') {
		this.opacity = 1;
	} else if (blockClass === 'h') {
		//Opacity varies between 0.2 and 0.7
		this.opacity = (Math.random() * 5 + 2) / 10;
	} else if (blockClass === 'i') {
		this.opacity = 0;
	}

	// Results
	this.response = null;
	this.responseTime = 0;
	this.correct = null;
};

var runBlock = function(exp,chartType, blockNo){
	/**
	* Run blocks
	* blockSeq contains the order of blocks 
	*/
	var r = $.Deferred();

	var block = new Block(chartType, blockNo, '000');

	for (var j = 0; j<numTrials; j++) {
		var trial = new Trial(block.blockClass, block.datasets[j]);
		block.trials.push(trial);
	};

	runTrials(exp, block).then(function(){ r.resolve(); });

	return r;
};

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
    erase();
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

			runBlock(exp,chartTypeSeq[0], blockSeq[0])
				.then(function(){
					reset(exp);
				});
		}
		++tutorialNow;
	});
};

var reset = function(exp){
	if (exp === 'd') {
		$('#done').show();
	}
	$(document).off();
	$('#study').hide();
	erase();

	tutorialNow = 1;
	$(document).keydown(function(event){
		tutorialStep(event,exp)
	});
	$('#tutorial-1').show();
}

function erase() {
	$('#leftChart').empty();
	$('#rightChart').empty();
}

//To send results
var sendJSON = function(_block, callback) {
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

var runTrials = function(exp, block){
	//Runs all trials in a block, recursively
	//Deferred function; resolves after entire recursion finishes
	var r = $.Deferred();

	var recur = function(block, trialNo){
		// Recursion
		var trial = block.trials[trialNo];

		// Show question
		$('#study').show();
		$('#exp-' + exp).show();

		// Draw chart upon holding down two keys
		$(document).keydown(function(event){
			step(event, draw);
		});

		function draw(){
			var dateStart = new Date();

			$(document).off();

			$('.choice').on('click', function(){
				$(this).addClass('active')
					.siblings().removeClass('active');

				if ($('.active').length > 1) {
					$('#continue').show();
					$('.choice').off('click');

					$(document).keydown(function(event){
						step(event, endTrial);
					})
				};
			})
			//Draw chart
			if (block.chartType === 'c') {
				drawCS(trial);
			} else {
				drawDALC(trial);
			}
					
			setTimeout(function(){
			//If time limit reached
				if (!trial.response) {
					//And if no response yet
					$('#time-limit').text(timeLimit/1000);
					$('#timed-out').show();
					$('#continue').css('color', 'red').show();

					$(document).off();
					$(document).keydown(endTrial);
				}
			}, timeLimit);

			function endTrial() {
				var dateEnd = new Date();
				trial.responseTime = (dateEnd-dateStart)/1000;
				trial.response = {};
				$('.active').each(function(i,v){
					trial.response[i] = $(v).text();
				});

				$('.result').hide();
				$('#leftChart').empty();
				$('#rightChart').empty();
				$('.choice').removeClass('active');
				$('#continue').hide();

				if (trialNo === 0) {
					sendJSON(block);
					r.resolve();
				} else {
					recur(block, --trialNo);
				}
			}
		};
	};

	// Begin recursion
	recur(block, block.trials.length - 1);

	return r;
};

reset('a');

});