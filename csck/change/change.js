$('#dialog').dialog({
	width: 400,
	autoOpen: false,
	close: function() {
		$(this).dialog('destroy').remove();
	},
	position: { my: "left top", at: "left top"},
	closeOnEscape: true,
	dialogClass: "no-close"
});
var dialogClosed = false;

function reset (blockSeq, config, user_id){
	$('button').prop('disabled', false);
	if (blockSeq.length === 1) {
		$('#study').animate({'opacity': 0}).hide(200);
		erase();
		blockSeq.pop();
		startExperiment();
	} else if (blockSeq.length === 0) {
		$('#study').animate({'opacity': 0}).hide(200);
		$('#done').css('opacity', 1).show();
		$('.next').css('opacity', 1).show();

		var numLeft = (+qs['j'] - 1);
		if (+qs['lab'] == 1) {
			if (numLeft > 0) {
				$('#out-lab').hide();
				$('#next-p').html('You have ' + numLeft + ' more sections left.');
				$('.next-btn').click(function(e) {
	        e.preventDefault(); e.stopPropagation();
	        window.location.href = '/csck/change/?lab=1&pilot='+qs['pilot']
	        	+'&id='+hitID
	        	+'&j=' + numLeft
	        	+'&direction='+qs['direction']
	        	+'&hurst=' + qs['hurst'];
				});

				$('.next-btn').prop('disabled', false);
			} else {
				// $('#done-p').attr('hidden', false)
				$('#next-p').html('You are done!');
				$('.next-btn').hide();
			}
		// }
		} else {

		// if (numLeft > 0) {
			// $('#next-p').html('You have ' + numLeft + ' more sections left.');
		// 	$('.next-btn').click(function(e) {
  //       e.preventDefault(); e.stopPropagation();
  //       window.location.href = 'http://mhong19414.github.io/csck/change/?pilot='+qs['pilot']+'&id='+subjectID+'&j=' + numLeft+'&direction='+qs['direction']+'&hurst=' + qs['hurst'];
		// 	});

		// 	$('.next-btn').prop('disabled', false);
		// } else {
			$('#done-p').attr('hidden', false)
			$('#out-lab').show();
			// $('#next-p').html('You are done!');
			$('.next-btn').hide();
			$('#user-id').html(user_id);
		// }
		}

	} else {
		// Move on to next experiment
		var exp = blockSeq[blockSeq.length-1]
		var lastExp = blockSeq.pop();
		getData(exp, config);

		// Set up tutorial mode
		$('#exp-' + lastExp).animate({'opacity': 0}).hide(200);
		$('#study').animate({'opacity': 0}).hide(200);
		erase();

		setChartName(chartType);
		setTutorialImage(exp, chartType,config)
		tutorialNow = 1;
		$(document).on('keyup', function(event){
			tutorialStep(event,exp,chartType,this)
		});
		$(tutorialClass(exp,1,chartType)).css('opacity', 1).show();
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
				$(tutorialClass(exp, tutorialNow, chartType)).animate({'opacity': 0}).hide(200);
				$(tutorialClass(exp, tutorialNow-1, chartType)).css('opacity', 1).show();
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
				$(tutorialClass(exp, tutorialNow, chartType)).animate({'opacity': 0}).hide(200);
				$(tutorialClass(exp, tutorialNow+1, chartType)).css('opacity', 1).show();
				$(document).on('keyup', function(event){
					tutorialStep(event,exp,chartType,this)
				});
			} 
			else {
				$(tutorialClass(exp, tutorialNow, chartType)).animate({'opacity': 0}).hide(200);

				prepareBlocks(allData[exp]);
				runBlock(allData[exp], numPracticeTrials);
			}
			++tutorialNow;
		},
		selector);
};

function runBlock(block, count){
	//Runs all trials in a block, recursively
	//Deferred function; resolves after entire recursion finishes

	// var lastCorrect = null;
	// var reversals = 0;

	var recur = function(block, trialNo){
		// Recursion
		var trial = block.trials[trialNo];
		trial.index = count - trialNo;
		
		// Show question
		$('#study').css('opacity', 1).show();
		$('#exp-' + trial.exp).css('opacity', 1).show();
		$('button').prop('disabled', true);
		$('.choice').removeClass('active');

		// Hidden but draw
		drawHidden(trial);

		// Lure cursor, hide it, then switch
		// $('#next').css('opacity', 1).show();
		// $('#next img').on('mouseenter', function(){
		// 	$('html').css('cursor','none');
		// 	// $('#next img').attr('src', 'img/hold-buttons.png');
		// 	// $(this).fadeOut(500, function(){
		// 	// $(document).on('keydown', function(event){
		// 	// 	heldDown(event, function(){
		// 			$('#next').animate({'opacity': 0}).hide(200);
		// 	// 		$('#next img').attr('src', 'img/next.png');
		// 			$('#next').off('mouseenter');
		// 			reveal(trial, function(){
		// 				endTrial(block, trialNo);
		// 			});
		// 		// }, this);
		// 	// });
		// 		// reveal();
		// 		// $('#next').off('mouseenter');
		// 	// });
		// });

		$('#next').css('opacity', 1).show(200);
		$('#next').on('mouseenter', function(){
			
			$('#next img').attr('src', 'img/next2.png');
			$('#next').css('top', '+=170px');
			$(this).on('mouseenter', function() {
					$('html').css('cursor','none');
			
			// $(this).fadeOut(500, function(){
			// $(document).on('keydown', function(event){
			// 	heldDown(event, function(){
					$('#next').hide();
					$('#next img').attr('src', 'img/next.png');
					$('#next').off('mouseenter');
					$('#next').css('top', '170px');
					reveal(trial, function(){
						endTrial(block, trialNo);
					});
				// }, this);
			// });
				// reveal();
				// $('#next').off('mouseenter');
			// });
			})
		});

		function endTrial(block, trialNo) {
			// if (lastCorrect !== trial.correct && lastCorrect !== null) { reversals++; }
			// lastCorrect = trial.correct;

			$('#time-out').animate({'opacity': 0}).hide(200);
			$('.problem').hide();
			$('.result').animate({'opacity': 0}).hide(200);
			$('.choice').off('click');

			if (trialNo === 0) {
				if (stage === 2) {
					var totalEndTime = new Date();
					block.totalTime = totalEndTime - totalStartTime; //including practice
				}

				// Remove wasted trials
				var toSend = $.extend({}, block);
				toSend.trials = toSend.trials.filter(function(el){ if (el.index !== 0) { return true; }});

				sendJSON(toSend);
				reset(blockSeq, config, block.subjectID);
			} else {
				// stair.next(trial.left.correct && trial.right.correct);
				recur(block, --trialNo);
			}
		}
	};

	// Begin recursion
	console.log(block);
	recur(block, count-1);
};

function reveal(trial, callback){

	$('#leftChart').css('opacity', 1).show();
	$('#rightChart').css('opacity', 1).show();
	var chosen = d3.shuffle(['left', 'right']).pop();
	var dateStart = new Date();
	
	// $(document.body).on('keyup', function(event) {
	// 	released(event, function(){
	// 		timed();
	// 		enableChoice();
	// 	}, this);
	// });

	setTimeout(function(){
		timed();
		enableChoice();
	}, displayFor);

	// Choice buttons
	function enableChoice() {
		if (trial.exp == 'a' || trial.exp == 'b') {
			chartOrMask = stage === 1 ? 'Chart' : 'Mask0'; 
			$('#'+ chosen + chartOrMask).addClass('bottom-border');
			// var interval = setInterval(function () {
	  //       $('#'+ chosen +'Chart').toggleClass('bottom-border');
	  //   }, 1000);

	  //   setTimeout(function() {
	  //   	clearInterval(interval)
	  //   }, 3500);
		}

		if (stage === 2) {
	 		$('#leftChart').empty();
			$('#rightChart').empty();
		}

		if (stage === 2 || trial.index === 3) {
			$('.mask').css('opacity', 1).show();
		}

		$('html').css('cursor','auto');
		$('button').prop('disabled', false);

		$('.choice').on('click', function(){

			// So one in each can be active
			$(this).addClass('active')
				.siblings().removeClass('active');

			$(this).siblings().prop('disabled', true)

			if ($('#exp-'+trial.exp+' button').length/2 - $('.active').length == 0) {
				// When both choices made
				if (trial.responseTime < 0.5 && !dialogClosed 
					&& trial.index == 1 && trial.exp == 'a' && stage == 1) {
					$('#dialog').dialog({
						close: function() {
							$(this).dialog('destroy').remove();
							evaluate();
							dialogClosed = true;
						}
					});
					$('#dialog').dialog('open');
				} else {
					evaluate();
				}
			};
		});
	}

	function timed() {
		var dateEnd = new Date();
		trial.responseTime = (dateEnd - dateStart)/1000;
		$('#time-display').html(trial.responseTime);
		$('#response-time').css('opacity', 1).show();
	}

	function evaluate() {
		var responses = $.find('.active');

		function otherChart(chart){
			if (chart === "left") {
				return "right";
			} 
			return "left";
		}

		if (trial.exp === 'a' || trial.exp === 'b') {
			setResponse(trial, chosen, $(responses[0]).text());
			setResponse(trial, otherChart(chosen), 'NA');
		} else {
			var response = $(responses[0]).text();
			var chart = response === 'greater' ? 'left' : 'right';
			setResponse(trial, chart, response);
		}

		if (trial.correct) {
			$('#feedback').html('Correct!').css('color', 'blue');
			$('#correct').css('opacity', 1).show();

			if (stage == 1) {
				// Reveal chart again, then move on after 5 seconds
				$('.mask').animate({'opacity': 0}).hide(200);
				// setTimeout(function(){
				moveOn();
				// }, debug ? 0 : 3000);
			} else {
				moveOn(true);
			}
		} else {
			$('#time-out').css('opacity', 1).show();
			$('#correct').css('opacity', 1).show();

			if (stage == 1) {

				$('#feedback').html('Wrong. Timed out for ' + penalty/1000 + ' seconds...').css('color', 'red');
				$('.mask').animate({'opacity': 0}).hide(200);

				setTimeout(function(){
					moveOn();
				}, debug ? 0 : penalty);

			} else {

				$('#feedback').html('Wrong. Timed out for ' + penalty/1000 + ' seconds...').css('color', 'red');

				setTimeout(function(){
					$('.press-continue').css('opacity', 1).show();
					moveOn(true);
				}, penalty);

			}
		}

		// Disable buttons
		// $('button').prop('disabled', true);
		// if (stage == 1) {
		// 	$('.mask').animate({'opacity': 0}).hide(200);
		// 	setTimeout(function(){
		// 		erase();
		// 	}, 5000);
		// } else {
		// 	erase();
		// }

		function moveOn(eraseCharts) {
			$('button').prop('disabled', true);
			$('#'+ chosen +'Chart').removeClass('bottom-border');

			if (eraseCharts) erase();

			$('.press-continue').css('opacity', 1).show();
			$(document).on('keyup', function(event){
				backwardOrForward(event, null, callback, this);
			})
		}
	}
};

drawMask();
reset(blockSeq, config);
// startExperiment();