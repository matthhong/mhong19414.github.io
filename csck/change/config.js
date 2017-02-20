var config = {
	'hurst': d3.shuffle([2,8]).pop(),
	'direction': d3.shuffle(['positive','negative']).pop(),
	'sensitivity': d3.shuffle(['faster']).pop(),
	'chart_type': d3.shuffle(['sm', 'dalc', 'cs']).pop(),
    // I pop stuff from the back of block_order
	'block_order': ['all', 'c', 'b', 'a']
}

// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
var qs = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));

var debug = window.location.href.indexOf('debug') >= 0;

var subjectID = getRandomInt(1000000, 9999999);

var hitID = +qs['id'];

if (qs['lab']) {
  subjectID = hitID
}
console.log(subjectID)

var stage = 1;
var testOrPilot = 'test';
var penalty = (debug ? 0 : 0);
var timeLimit = (debug ? 1000000 : 10000);
var displayFor = (debug ? 0 : 4000);

var numPracticeTrials = (debug ? 2 : 2);
var numRealTrials = (debug ? 2 : 3); // Per block
var numTrials = numPracticeTrials + numRealTrials;

var totalStartTime = new Date();

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// Set Hurst randomly
// var hurst = math.ceil(Math.random() * 4) * 2;
var chartType = config.chart_type;
var blockSeq = config.block_order;

var chartTypes = ['sm', 'dalc', 'cs'];
var hursts = [2,4,6,8];

if (qs['id'] && qs['j']) { //j goes from 3 to 1
  config.j = +qs['j']; 

  var k3 = chartTypes[hitID % 3]; chartTypes.splice(chartTypes.indexOf(k3),1);
  var k2 = chartTypes[hitID % 2]; chartTypes.splice(chartTypes.indexOf(k2),1);
  var k1 = chartTypes[0];
  if (config.j == 3) {
    config.chartType = chartType = k3;
  } else if (config.j == 2) {
    config.chartType = chartType = k2;
  } else if (config.j == 1) {
    config.chartType = chartType = k1;
  }

  var h3 = hursts[hitID % 3]; hursts.splice(hursts.indexOf(h3),1);
  var h2 = hursts[hitID % 2]; hursts.splice(hursts.indexOf(h2),1);
  var h1 = hursts[hitID % 1];
  if (config.j == 3) {
    config.hurst = h3;
  } else if (config.j == 2) {
    config.hurst = h2;
  } else if (config.j == 1) {
    config.hurst = h1;
  }
}

if (qs['block']) {
 blockSeq = ['all',qs['block'],qs['block'],qs['block']];
}

if (qs['stage']) {
 stage = +qs['stage'];
}

if (qs['pilot']) {
 testOrPilot = 'pilot' + qs['pilot'];
}
console.log(testOrPilot);

if (qs['type']) {
 chartType = config.chart_type = qs['type'];
}

if (qs['hurst']) {
 config.hurst = qs['hurst'];
}

if (qs['sensitivity']) {
 config.sensitivity = qs['sensitivity'];
}

if (qs['direction']) {
 config.direction = qs['direction'];
}

if (chartType === 'sm') {
	dalc = false;
}