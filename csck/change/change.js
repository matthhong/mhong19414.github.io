function startExperiment (){
	$('#mixed-start').show();
	setTimeout(function(){
		$('.press-continue').show();
		$(document).on('keydown', function(event){
			backwardOrForward(event, null, function(event) {

			})
		})
	})
}

function reset (exps, config, user_id){
	if (exps.length === 0 && user_id) {
		$('#study').hide();
		$('#done').show();
		$('#user-id').html(user_id);
	} else {
		var exp = exps[exps.length-1]
		var lastExp = exps.pop();
		$('#exp-' + lastExp).hide();
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
		console.log(config)
		console.log('img/change-tutorial/instructional-'+exp+'-'+config.direction+'-'+config.sensitivity+'-'+chartType+'-'+id+'.png')
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

				runBlock(exp);
			}
			++tutorialNow;
		});
};





// Actual experiment
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

function runTrials() {
	// Mixed design
}

function runBlock(exp){
	//Runs all trials in a block, recursively
	//Deferred function; resolves after entire recursion finishes

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

					$(this).siblings().prop('disabled', true)

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
					reset(exps, config, block.subjectID);
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