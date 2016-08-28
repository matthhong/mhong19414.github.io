function startExperiment (){
	$('#mixed-start').show();
	setTimeout(function(){
		$('.press-continue').show();
		$(document).on('keydown', function(event){
			backwardOrForward(event, null, runTrials);
		})
	}, 10000);
}

// Actual experiment
function runTrials() {
	// Mixed design
	$('#mixed-start').hide();
	$('.result').hide();
	$(document).off();

	var block = prepareMixed();
	runBlock(block, numRealTrials * 3);

	// Combine trials
	// Recursively run them
}