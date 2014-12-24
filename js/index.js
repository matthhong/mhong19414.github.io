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
		});

	$(".fancybox").fancybox({type:'iframe', arrows:false, 'width': 900});
});