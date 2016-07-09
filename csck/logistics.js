// Order of chart types to be given
// Order of blocks to be given
var blockSeq = d3.shuffle(['p', 'h', 'i']);
var chartTypeSeq = d3.shuffle(['c', 'd']);

switch (qs['type']) {
	case 'dalc':
		chartTypeSeq = ['d','d'];
		break;
	case 'cs':
		chartTypeSeq = ['c','c'];
		break;
}

var stair = new Staircase({
	deltaT: {
		firstVal: 4000,
		limits: [0, 30000],
		direction: '-1',
		operation: 'multiply',
		factor: 4/3,
		down: 1
	}
});
stair.init();