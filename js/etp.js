$(function(){

var svg = d3.select('svg').attr('width', 546).attr('height', 726);

var force = d3.layout.force()
		.charge(-120)
		.linkDistance(200)
		.size([546, 726]);

$.getJSON('JSON-passes/2011739-1', function(data) {
	var group = svg.append('g').attr('class','pic').attr('width', 546).attr('height', 726);

	window.d = data
	var links = [];
	var nodes = [];
	for (pl1 in data){
		nodes.push({"name": pl1, "sub": 0})
	};
	var n1 = 0;
	for (pl1 in data){
		var n2 = 0;
		for (pl2 in data[pl1]){
			var link = {"source": n1, "target": n2, "value": data[pl1][pl2]};
			links.push(link);
			n2++;
		};
		n1++;
	};
	window.links = links
	window.nodes = nodes

	force
		.nodes(nodes)
		.links(links)
		.start();

	var link = group.selectAll(".link").data(links).enter()
		.append('line')
		.style('stroke', 'black')
		.style('stroke-width', function(d) { return Math.sqrt(d.value); });

	var node = group.selectAll(".node").data(nodes).enter()
		.append("circle")
		.attr("r",5)
		.style("fill", 'black')
		.call(force.drag);

	force.on("tick", function(){
		link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

		node.attr("cx", function(d) { return d.x; })
		    .attr("cy", function(d) { return d.y; });
	});

	force.start();
	window.force = force;

});

d3.xml('image.svg', 'image/svg+xml', function(xml) {
	var group = svg.insert('g', '.pic').attr('class', 'graph')
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
			group.attr('width', h).attr('height', w)
				.append('path').attr('d', d).attr('style', style)
				.attr('transform', 'translate(0 ' + w + ') rotate(270 0 0)');
		}
		catch(e){}
	}
});

});