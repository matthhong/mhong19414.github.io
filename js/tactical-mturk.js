$(function(){

window.App = new(Backbone.View.extend({
	Models: {},
	Collections: {},
	Views: {}
}));

App.svg = d3.select('svg');

App.Models.Player = Backbone.Model.extend({
	defaults: function(){
		return {x: Math.random() * 546, y: Math.random() * 726};
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

App.Views.Node = Backbone.View.extend({
	initialize: function(){
		this.collection.on('change', this.render, this);
	},
	render: function(){
		App.svg.append('circle')
			.attr('cx', this.model.get('x'))
			.attr('cy', this.model.get('y'))
			.attr('r', 30);
		var model1 = this.model;
		for (prop in model1.attributes) {
			if (!(prop === 'id' || prop === 'x' || prop === 'y')) {
				var model2 = model1.collection.get(prop);
				App.svg.append('line')
					.attr('x1', model1.get('x'))
					.attr('y1', model1.get('y'))
					.attr('x2', model2.get('x'))
					.attr('y2', model2.get('y'))
					.style('stroke', 'black')
					.style('stroke-width', 6);
				}
			}
	}
});

var tl = new App.Collections.Lineup();
tl.url='JSON-passes/2011739-1';
tl.fetch();
window.tl = tl;

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
			App.svg.attr('width', h).attr('height', w)
				.append('path').attr('d', d).attr('style', style)
				.attr('transform', 'translate(0 ' + w + ') rotate(270 0 0)');
		}
		catch(e){}
	}
});

});
