var interactionEffect = config.sensitivity === 'slower' ? 'steep' : 'shallow';

var masks = [];
var mask = { left: { data: [] }, right: { data: [] }};

var allData = {a:{},b:{},c:{}};

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
makeMask();

function getData(exp, config) {

	var dir = ''
	if (exp === 'a') { 
		dir = 'data/H' + config.hurst + '-a.json'; 
	}
	else if (exp === 'b') { 
		dir = 'data/H' + config.hurst + '-b-' + config.direction + '.json';
		$('.direction').html(config.direction + 'ly');
	}
	else if (exp === 'c') { 
		dir = 'data/H' + config.hurst + '-c-' + config.direction + '-' + config.sensitivity + '-.json';
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
							// Switch... mixed up green and blue... blame Robert and Steves
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