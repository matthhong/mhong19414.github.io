var config = {
	'hurst': d3.shuffle([2,4,6,8]).pop(),
	'direction': d3.shuffle(['positive','negative']).pop(),
	'sensitivity': d3.shuffle(['slower','faster']).pop(),
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
var pilot = window.location.href.indexOf('pilot') >= 0;

var stage = 1;
var testOrPilot = 'test';
var penalty = (debug ? 0 : 7000);
var timeLimit = (debug ? 1000000 : 10000);

var numPracticeTrials = 1;
var numRealTrials = 1; // Per block
var numTrials = numPracticeTrials + numRealTrials;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// Set Hurst randomly
// var hurst = math.ceil(Math.random() * 4) * 2;
var chartType = config.chart_type;
var blockSeq = config.block_order;

if (qs['block']) {
 blockSeq = ['all',qs['block'],qs['block'],qs['block']];
}

if (qs['stage']) {
 stage = +qs['stage'];
}

if (pilot) {
 testOrPilot = 'pilot';
}

if (qs['chartType']) {
 chartType = qs['chartType'];
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