
/////INTERACTION

// $('#next').hover(function(){
// 	$('html').css('cursor','none');
// 	$(this).fadeOut(500);
// }, function() {
// 	// $(this).css('cursor','default')
// })

// Pressing both shift keys
var keys = {
  qkey: false,
  backslash: false
};

var step = function(event, callback){
	if (event.keyCode == 81) {
      keys["qkey"] = true;
  } else if (event.keyCode == 220) {
      keys["backslash"] = true;
  }
  if (keys["qkey"] && keys["backslash"]) {
  	keys["qkey"] = false;
  	keys["backslash"] = false;
  	callback();
  }
}

var backwardOrForward = function(event, callback, callforward) {
	console.log(event.keyCode)
	if (event.keyCode == 81) {
		callback();
	} else if (event.keyCode == 220) {
		callforward();
	}
}
