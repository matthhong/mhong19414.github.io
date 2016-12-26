var interactionEffect = config.sensitivity === 'slower' ? 'steep' : 'shallow';

var masks = [];
var mask = { left: { data: [] }, right: { data: [] }};
var qual = {};

var allData = {a:{},b:{},c:{}};

function makeMask() {
	for (var i = 0; i < 8; i++) {
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
makeMask();

function getData(exp, config) {

	var dir = ''
	if (exp === 'a') { 
		dir = 'data/H' + config.hurst + '-a-' +qs['j']+'.json'; 
	}
	else if (exp === 'b') { 
		dir = 'data/H' + config.hurst + '-b-' + config.direction + '-' +qs['j']+'.json';
		$('.direction').html(config.direction + 'ly');
	}
	else if (exp === 'c') { 
		dir = 'data/H' + config.hurst + '-c-' + config.direction + '-' + config.sensitivity + '-' + qs['j'] +'.json';
		$('.direction').html(config.direction + 'ly');
		$('.sensitivity').html(config.sensitivity);
		$('.interaction1').html(interactionEffect+'er');
		$('.interaction2').html('less ' + interactionEffect);
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
						if (k !== 'values1' && k !== 'values2' && temp[j].hasOwnProperty(k)) {
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
					if (k !== 'values1' && k !== 'values2' && temp.hasOwnProperty(k)) {
						dataset[k] = temp[k];
					}
				};
				datasets.push(dataset);
				// dataset is 1 chart 
				// need 2 charts per trial 
				// take 2 at once
			};
		}

		var block = new Block(chartType, config.hurst, exp, config.direction, config.sensitivity);
		block.datasets = datasets;
		allData[exp] = block;
	});
}

var qual = {};
// var qualIndex = Math.floor(Math.random()*numPracticeTrials);
var qualIndex = 0;
function prepareBlocks (block){
	if (block.exp === 'a' || block.exp === 'b') {
		for (var j = 0; j<block.datasets.length; j+=2) {
			// Pushes all data into trials
			var t = new Trial(block.exp, block.chartType, block.datasets[j], block.datasets[j+1]);
			// should take 2 at once, unless C: already comes at once
			block.trials.push(t);
			// if (block.exp === 'a' && j/2 === qualIndex) {
			// 	qual = createQualTrial(block, qualIndex);
			// 	// qualification trial
			// 	block.trials.pop();
			// 	block.trials.push(qual);
			// }
		};
		// if (block.exp === 'a') {
		// 	// qualification trial
		// 	var left = {
		// 		data:[{date: new Date(2016,1,1), value1: 0.7, value2: 0.3},{date: new Date(2016,2,1), value1: 0.3, value2: 0.7}],
		// 		'Sign of correlation': -1};
		// 	var right = {data:[{date: new Date(2016,1,1), value1: 0.2, value2: 0.25},{date: new Date(2016,2,1), value1: 0.8, value2: 0.75}],
		// 		'Sign of correlation': 1};
		// 	var insertShift = Math.floor(Math.random()*numPracticeTrials);
		// 	console.log(insertShift);
		// 	qual = createQualTrial(block);
		// 	block.trials.splice(2, 0, qual);
		// }
	} else if (block.exp === 'c') {
		for (var j = 0; j < block.datasets.length; j++) {
			d3.shuffle(block.datasets[j]);
			var t = new Trial(block.exp, block.chartType, block.datasets[j][0], block.datasets[j][1]);
			block.trials.push(t);
		};
	}
}

function createQualTrial(block, j) {
	var left = {data:[], 'Sign of correlation': -1};
	var right = {data: [], 'Sign of correlation': 1};

	var leftTemp = block.trials[j].left;
	var rightTemp = block.trials[j].right;
	for (var i = 0; i < leftTemp.data.length; i++) {

		left.data.push({
			date: new Date(2016,i,1),
			value1: leftTemp.data[i].value1,
			value2: 1 - leftTemp.data[i].value1
		})
		right.data.push({
			date: new Date(2016,i,1),
			value1: rightTemp.data[i].value1,
			value2: rightTemp.data[i].value1/2
		})
	}
	var obj = new Trial(block.exp, block.chartType, left, right);
	return obj;
}

function prepareMixed () {

	var combinedBlock = new Block(chartType, config.hurst, 'all', config.direction, config.sensitivity);

	for (var exp in allData) {
		if (exp === 'a' || exp === 'b' || exp === 'c') {
			Array.prototype.push.apply(combinedBlock.trials, allData[exp].trials.filter(function(e){ if(e.correct === null){return true;}}))
		}
	}
	d3.shuffle(combinedBlock.trials);
	return combinedBlock;
}