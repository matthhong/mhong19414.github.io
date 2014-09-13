$(function(){

window.App = new(Backbone.View.extend({
	Models: {},
	Collections: {},
	Views: {}
}));

App.Models.Player = Backbone.Model.extend({
	defaults: {
		position: (Math.random() * 546, Math.random() * 726) 
	}
});

App.Collections.Lineup = Backbone.Collection.extend({
	model: App.Models.Player,
	parse: function(response){
		var lineup = [];
		for (var n in response) {
			var passes = response[n];
			passes.id = n;
			lineup.push(passes);
		};
		return lineup;
	}
});

App.Views.Node = Backbone.View.extend({});

App.Views.Link = Backbone.View.extend({});

App.Views.Graph = Backbone.View.extend({});

var svg = d3.select('svg');
d3.xml('image.svg', 'image/svg+xml', function(xml) {
	var external = xml.documentElement;
	var svg_attrs = external.attributes;
	var h = svg_attrs['height'].value,
		w = svg_attrs['width'].value;
	var child_nodes = external.children;
	for (i = 0; i< child_nodes.length;i++) {
		try{
			var path_attrs = child_nodes[i].attributes,
				style = path_attrs['style'].value,
				d = path_attrs['d'].value;
			svg.attr('width', h).attr('height', w)
				.append('path').attr('d', d).attr('style', style)
				.attr('transform', 'translate(0 '+ w + ') rotate(270 0 0)');
		}
		catch(e){}
	}
});
svg.selectAll('.player')
	.data()

});
