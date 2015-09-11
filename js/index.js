$(function(){
	$(".list").each(function(i, el){
		var p = $(el).portfolio({
			height: '200px',
			showArrows: false
		})
		p.init();
		p.hide();
	});

	$(".button")
		.click(function(){
			if ($("#list-" + this.id).is(":visible")) {
				$("#list-" + this.id).hide('400ms', function() {
					if ($('.list:visible').length > 0) {
						$('#overlay').animate({backgroundColor: 'rgba(255,255,255,0.95)'}, 200);
					} else {
						$('#overlay').animate({backgroundColor: 'rgba(255,255,255,0)'},200);
					};
				});
			} else {
				$("#list-" + this.id).show('400ms');
				$('#overlay').animate({backgroundColor: 'rgba(255,255,255,0.95)'}, 200);
			}
			// $("#list-" + this.id).toggle('400ms', function(){
			// 	if ($('.list:visible').length > 0) {
			// 		$('#overlay').animate({backgroundColor: 'rgba(255,255,255,0.8)'}, 200);
			// 	} else {
			// 		$('#overlay').animate({backgroundColor: 'rgba(255,255,255,0)'},200);
			// 	};
			// });
		})
		// .toggle(function(){
		// 	$('#overlay').animate({backgroundColor: 'rgba(255,255,255,0.8)'}, 200);
		// }, function(){
		// 	$('#overlay').animate({backgroundColor: 'rgba(255,255,255,0)'},200);
		// });

	$(".fancybox").fancybox({type:'iframe', arrows:false, 'width': 1000});
});