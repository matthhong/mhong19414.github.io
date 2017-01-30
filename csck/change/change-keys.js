
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

var heldDown = function(event, callback, selector){
	if (event.keyCode == 81) {
      keys["qkey"] = true;
  } else if (event.keyCode == 220) {
      keys["backslash"] = true;
  }
  if (keys["qkey"] && keys["backslash"]) {
  	keys["qkey"] = false;
  	keys["backslash"] = false;
    $(selector).off('keydown');
  	callback();
  }
}

var released = function(event, callback, selector) {
    // reset status of the button 'released' == 'false'
  if (event.keyCode == 81) {
      keys["qkey"] = false;
  } else if (event.keyCode == 220) {
      keys["backslash"] = false;
  }
  if (!keys["qkey"] || !keys["backslash"]) {
    $(selector).off('keyup');
    callback();
  }
};


var backwardOrForward = function(event, callback, callforward, selector) {
	if (event.keyCode == 37) {
    if (callback) {
      $(selector).off('keyup');
      setTimeout(function(){
        callback();
      }, 200)
    }
	} else if (event.keyCode == 39) {
    if (callforward) {
      $(selector).off('keyup');
  		setTimeout(function(){
        callforward();
      }, 200)
    }
	}
}
