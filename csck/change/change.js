function reset (blockSeq, config, user_id){
	if (blockSeq.length === 1) {
		$('#study').hide();
		blockSeq.pop();
		startExperiment();
	} else if (blockSeq.length === 0) {
		$('#study').hide();
		$('#done').show();
		$('#user-id').html(user_id);
	} else {
		// Move on to next experiment
		var exp = blockSeq[blockSeq.length-1]
		var lastExp = blockSeq.pop();
		getData(exp, config);

		// Set up tutorial mode
		$('#exp-' + lastExp).hide();
		$(document).off();
		$('#study').hide();
		erase();

		setChartName(chartType);
		setTutorialImage(exp, chartType,config)
		tutorialNow = 1;
		$(document).on('keyup', function(event){
			tutorialStep(event,exp,chartType)
		});
		$(tutorialClass(exp,1,chartType)).show();
	}
}

// Tutorial
function setChartName(chartType) {
	var name= ''
	if (chartType === 'cs') {
		name = 'Connected scatterplots';
	} else {
		name = 'Line charts';
	}
	$('.chart-name').html(name);
}

function setTutorialImage(exp, chartType, id) {
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

var tutorialNow = 1;
var tutorialStep = function(event,exp,chartType){
	backwardOrForward(event, 
	  function(){
			if (tutorialNow != 1) {
				if (exp==='c' && tutorialNow === 3) {
					setTutorialImage(exp, chartType, 1);
				}
				$(tutorialClass(exp, tutorialNow, chartType)).hide();
				$(tutorialClass(exp, tutorialNow-1, chartType)).show();
				--tutorialNow;
			}
		},
		function(){
			if (tutorialNow < 4) {
				if (exp === 'c' && tutorialNow === 2) {
					setTutorialImage(exp, chartType, 0);
				}
				$(tutorialClass(exp, tutorialNow, chartType)).hide();
				$(tutorialClass(exp, tutorialNow+1, chartType)).show();
			} 
			else {
				$(tutorialClass(exp, tutorialNow, chartType)).hide();
				$(document).off();

				prepareBlocks(allData[exp]);
				runBlock(allData[exp], numPracticeTrials);
			}
			++tutorialNow;
		});
};

function runBlock(block, numTrials){
	//Runs all trials in a block, recursively
	//Deferred function; resolves after entire recursion finishes

	// var lastCorrect = null;
	// var reversals = 0;

	var recur = function(block, trialNo){
		// Recursion
		var trial = block.trials[trialNo];
		trial.index = numTrials - trialNo;
		
		// Show question
		$('#study').show();
		$('#exp-' + trial.exp).show();
		$('button').prop('disabled', true);
		$('.choice').removeClass('active');

		// Hidden but draw
		drawHidden(trial);

		// Lure cursor, hide it, then switch
		$('#next').show()
			.on('mouseenter', function(){
				$('html').css('cursor','none');
				$('#next img').attr('src', 'img/hold-buttons.png');
				// $(this).fadeOut(500, function(){
				$(document).on('keydown', function(event){
					heldDown(event, function(){
						$('#next').hide();
						$('#next img').attr('src', 'img/next.png');
						$('#next').off('mouseenter');
						reveal(trial, function(){
							endTrial(block, trialNo);
						});
					});
				});
					// reveal();
					// $('#next').off('mouseenter');
				// });
			});
		function endTrial(block, trialNo) {
			// if (lastCorrect !== trial.correct && lastCorrect !== null) { reversals++; }
			// lastCorrect = trial.correct;

			$('#time-out').hide();
			$('.problem').hide();
			$('.result').hide();
			$('.choice').off('click');
			$(document).off('keydown');

			if (trialNo === 0) {
				sendJSON(block);
				reset(blockSeq, config, block.subjectID);
			} else {
				// stair.next(trial.left.correct && trial.right.correct);
				recur(block, --trialNo);
			}
		}
	};

	// Begin recursion
	recur(block, numTrials-1);
};

function reveal(trial, callback){

	$('#leftChart').show();
	$('#rightChart').show();
	var dateStart = new Date();
	
	$(document.body).on('keyup', function(event) {
		released(event, function(){
			timed();
			enableChoice();
		});
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

			$(this).siblings().prop('disabled', true)

			if ($('#exp-'+trial.exp+' button').length/2 - $('.active').length == 0) {
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

		if (trial.exp === 'a' || trial.exp === 'b') {
			setResponse(trial, 'left', $(responses[0]).text());
			setResponse(trial, 'right', $(responses[1]).text());
		} else {
			var response = $(responses[0]).text();
			var chart = response === 'greater' ? 'left' : 'right';
			setResponse(trial, chart, response);
		}

		if (trial.correct) {
			$('#feedback').html('Correct!').css('color', 'blue');
			$('#correct').show();
			$('.press-continue').show();
			moveOn();
		} else {
			$('#feedback').html('Wrong. Timed out for ' + penalty/1000 + ' seconds...').css('color', 'red');
			$('#time-out').show();
			$('#correct').show();
			setTimeout(function(){
				$('.press-continue').show();
				moveOn();
			}, penalty)
		}

		function moveOn() {
			$(document).on('keyup', function(event){
				backwardOrForward(event, null, callback);
			})
		}
		// Disable buttons
		$('button').prop('disabled', true);
		erase();
	}
};

drawMask();
reset(blockSeq, config);
// startExperiment();