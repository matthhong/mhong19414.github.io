var dbConfig = {
  apiKey: "AIzaSyCpAJIO8anJshx1G-Qhy2qDl2u-QtD_UD4",
  authDomain: "project-1718224482862335212.firebaseapp.com",
  databaseURL: "https://project-1718224482862335212.firebaseio.com",
  storageBucket: "",
};
firebase.initializeApp(dbConfig);
var db = firebase.database();

function sendJSON(_block, callback) {
    // // make sure version is set
    // _block.version = perfExperiment.version;
    // // show size of block data
    // console.log(encodeURIComponent(JSON.stringify(_block, null, " ")).length);

    // get correctess and time
    _block.avgRT = _block.trials.reduce(function (accumulator, trial) { return accumulator + trial.responseTime; }, 0) / _block.trials.length;
    _block.score = _block.trials.reduce(function (accumulator, trial) { return accumulator + trial.correct; }, 0) / _block.trials.length;

    $('#avgRT').html(Math.floor(_block.avgRT));
    $('#score').html(Math.ceil(_block.score*100));

    // send
    delete _block.datasets;
    console.log(qual.correct+'/'+_block.chartType+'/'+ _block.exp+'/'+_block.subjectID)
    console.log(_block);
    db.ref(testOrPilot +'/' +qual.correct+'/'+ _block.chartType+'/'+ _block.exp+'/'+_block.subjectID).set(_block);
};