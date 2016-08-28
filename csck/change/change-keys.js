
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

var heldDown = function(event, callback){
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

var released = function(event, callback) {
    // reset status of the button 'released' == 'false'
  if (event.keyCode == 81) {
      keys["qkey"] = false;
  } else if (event.keyCode == 220) {
      keys["backslash"] = false;
  }
  callback();
};


var backwardOrForward = function(event, callback, callforward) {
	if (event.keyCode == 37) {
		callback();
	} else if (event.keyCode == 39) {
		callforward();
	}
}
