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
			$("#list-" + this.id).toggle('400ms');
		})
		.toggle(function(){
			$('#overlay').css({'background': 'rgba(255,255,255,0.5)'});
		}, function(){
			$('#overlay').css({'background': 'rgba(255,255,255,0)'});
		});

	$(".fancybox").fancybox({type:'iframe', arrows:false, 'width': 1000});
});