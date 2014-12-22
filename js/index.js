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
		.mouseenter(function(){				
			$(this).animate({marginLeft:'8px'}, 'fast')
		})
		.mouseleave(function() {
			$(this).animate({marginLeft:'5px'}, 'fast')
		});
});