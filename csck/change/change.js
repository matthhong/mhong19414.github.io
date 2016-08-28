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
		$('#study').hide();
		erase();

		setChartName(chartType);
		setTutorialImage(exp, chartType,config)
		tutorialNow = 1;
		$(document).on('keyup', function(event){
			tutorialStep(event,exp,chartType,this)
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
var tutorialStep = function(event,exp,chartType,selector){
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
			$(document).on('keyup', function(event){
				tutorialStep(event,exp,chartType,this)
			});
		},
		function(){
			if (tutorialNow < 4) {
				if (exp === 'c' && tutorialNow === 2) {
					setTutorialImage(exp, chartType, 0);
				}
				$(tutorialClass(exp, tutorialNow, chartType)).hide();
				$(tutorialClass(exp, tutorialNow+1, chartType)).show();
				$(document).on('keyup', function(event){
					tutorialStep(event,exp,chartType,this)
				});
			} 
			else {
				$(tutorialClass(exp, tutorialNow, chartType)).hide();

				prepareBlocks(allData[exp]);
				runBlock(allData[exp], numPracticeTrials);
			}
			++tutorialNow;
		},
		selector);
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
					}, this);
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

			if (trialNo === 0) {
				if (stage === 2) {
					var totalEndTime = new Date();
					block.totalTime = totalEndTime - totalStartTime; //including practice
				}
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
		}, this);
	});

	// Choice buttons
	function enableChoice() {

		if (stage === 2) {
	 		$('#leftChart').empty();
			$('#rightChart').empty();
		}
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

			if (stage == 1) {
				// Reveal chart again, then move on after 5 seconds
				$('.mask').hide();
				setTimeout(function(){
					moveOn();
				}, debug ? 0 : 3000);
			} else {
				moveOn();
			}
		} else {
			$('#time-out').show();
			$('#correct').show();

			if (stage == 1) {

				$('#feedback').html('Wrong.').css('color', 'red');
				$('.mask').hide();
				setTimeout(function(){
					moveOn();
				}, debug ? 0 : 5000);

			} else {

				$('#feedback').html('Wrong. Timed out for ' + penalty/1000 + ' seconds...').css('color', 'red');
				erase();
				setTimeout(function(){
					$('.press-continue').show();
					moveOn();
				}, penalty);

			}
		}

		// Disable buttons
		// $('button').prop('disabled', true);
		// if (stage == 1) {
		// 	$('.mask').hide();
		// 	setTimeout(function(){
		// 		erase();
		// 	}, 5000);
		// } else {
		// 	erase();
		// }

		function moveOn() {
			$('button').prop('disabled', true);
			erase();
			$('.press-continue').show();
			$(document).on('keyup', function(event){
				backwardOrForward(event, null, callback, this);
			})
		}
	}
};

drawMask();
reset(blockSeq, config);
// startExperiment();