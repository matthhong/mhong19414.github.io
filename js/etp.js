$(function(){

$.ajaxSetup({
    async: false
});

var FIRST_GAME = '2011779-1';

var W = 546; //width
var H = 726; //height
var R = 20; //node radius

var svg = d3.select('svg').attr('width', W).attr('height', H);
var svg_graph = svg.append('g').attr('class','graph');

// Links
var links_data = {};
$.getJSON(FIRST_GAME  + 'links.json', function(d){
	links_data = d;
});
var links = svg_graph.selectAll(".link").data(links_data).enter().append('line');
links.attr("class", "hidden");

svg.append('defs') //Arrows
	.append("svg:marker")
    .attr("id", "arrowGray")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", "10")
    .attr("refY", "5")
    .attr("markerUnits", "userSpaceOnUse")
    .attr("markerWidth", "25")
    .attr("markerHeight", "25")
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M 7 5 L 10 5 L 0 10 z")
    .attr("fill", "#000");

var max_w = Math.max.apply(Math, links_data.map(function(d) {return d.value;}))
links.style('stroke', 'black')
	.style('stroke-width', function(d) { return d.value * 10 / max_w + 1; })
	.attr("marker-end", function(d) { return d.value === 0 ? "none" : "url(#arrowGray)" })

links.attr("x1", function(d) { 
		if (dy === 0) { return d.source.x; };

		// shift the lines so that the weighted directed links are separate
		var v = d.value * 10 / max_w + 1,
			shift = v / 2 + 1,
			dx = d.target.x - d.source.x,
			dy = d.target.y - d.source.y,
			sign = dx / Math.abs(dx);

		sign2 = (dx/dy) / Math.abs(dx/dy);
		sign *= (-1 * sign2)

		var shiftx = Math.sqrt(Math.pow(shift,2)/(1 + Math.pow(dx/dy,2)));
		return sign * shiftx + d.source.x; 
	})
    .attr("y1", function(d) { 
    	if (dx === 0) { return d.source.y; };

    	// shift the lines so that the weighted directed links are separate
		var v = d.value * 10 / max_w + 1,
			shift =  v / 2 + 1,
			dx = d.target.x - d.source.x,
			dy = d.target.y - d.source.y,
			sign = dy / Math.abs(dy);

		sign2 = (dx/dy) / Math.abs(dx/dy);
		sign *= sign2

		var shifty = Math.sqrt(Math.pow(shift,2)/(1 + Math.pow(dy/dx,2)));
		return d.source.y + (sign * shifty); 
	})
    .attr("x2", function(d) {
    	// point arrow at the edge of target
    	var length = Math.sqrt(Math.pow(d.target.y - d.source.y, 2) + Math.pow(d.target.x - d.source.x, 2));
	    var scale = (length - R) / length;
	    var offset = (d.target.x - d.source.x) - (d.target.x - d.source.x) * scale;
	    var targetx = d.target.x - offset;

    	if (dy === 0) { return targetx; };

    	// shift the lines so that the weighted directed links are separate
		var v = d.value * 10 / max_w + 1,
			shift = v / 2 + 1,
			dx = targetx - d.source.x,
			dy = d.target.y - d.source.y,
			sign = dx / Math.abs(dx);

		sign2 = (dx/dy) / Math.abs(dx/dy);
		sign *= (-1 * sign2)

		var shiftx = Math.sqrt(Math.pow(shift,2)/(1 + Math.pow(dx/dy,2)));

		return sign * shiftx + targetx;
	})
    .attr("y2", function(d) {
    	// point arrow at the edge of target
    	var length = Math.sqrt(Math.pow(d.target.y - d.source.y, 2) + Math.pow(d.target.x - d.source.x, 2));
	    var scale = (length - R) / length;
	    var offset = (d.target.y - d.source.y) - (d.target.y - d.source.y) * scale;
	    var targety = d.target.y - offset;

    	if (dx === 0) { return targety; };

    	// shift the lines so that the weighted directed links are separate
		var v = d.value * 10 / max_w + 1,
			shift =  v / 2 + 1,
			dx = d.target.x - d.source.x,
			dy = targety - d.source.y,
			sign = dy / Math.abs(dy);

		sign2 = (dx/dy) / Math.abs(dx/dy);
		sign *= sign2

		var shifty = Math.sqrt(Math.pow(shift,2)/(1 + Math.pow(dy/dx,2)));

		return targety + (sign * shifty); 
	});

// Nodes
var nodes_data = {};
$.getJSON(FIRST_GAME  + 'nodes.json', function(d){
	nodes_data = d;
});
var nodes = svg_graph.selectAll(".node").data(nodes_data).enter().append("circle");

nodes.attr("r", R)
	.style("fill", 'blue')
	.style('stroke', 'white')
	.style('stroke-width', 2)

nodes.attr("cx", function(d) { return d.x; })
	.attr("cy", function(d) { return d.y; });

// Labels
var labels = svg.selectAll("text.label").data(nodes_data).enter().append("text");

labels.attr("class", "label")
    .attr("fill", "white")
    .attr('font-family', "sans-serif")
    .text(function(d) {  return d.name;  });
            
labels.attr("transform", function(d) { return "translate(" + (d.x - 6) + "," + (d.y + 6) + ")"; });

var toggle_highlight = function(n1, n2){
	var lines = d3.selectAll('line')
					.attr('class', function(d){
						if (d.source.name === n1 && d.target.name === n2) {
							console.log(this.attributes[0].value === 'hidden')
							return this.attributes[0].value === 'hidden' ? 'seen' : 'hidden';
						}
						return this.attributes[0].value;
					});
};

var selected = [];
var clicked = function(d){
	if (selected.length == 1){
		if (selected[0] !== d.name){
			toggle_highlight(selected[0], d.name);
			selected.pop();
			selected.pop();
		}
	}
	else{
		selected.push(d.name)
	}
}

nodes.on('click', clicked)
labels.on('click', clicked);

var force = d3.layout.force()
	.charge(-120)
	.linkDistance(200)
	.size([W, H]);

var save = function(){
	force.stop();

	var nodes_dl = 'data:text/json;charset=utf8,' + encodeURIComponent(JSON.stringify(force.nodes()));
	var links_dl = 'data:text/json;charset=utf8,' + encodeURIComponent(JSON.stringify(force.links()));

	$('<a href="' + nodes_dl + '" download="' + game + 'nodes.json">download nodes</a>').appendTo('#container');
	$('<a href="' + links_dl + '" download="' + game + 'links.json">download links</a>').appendTo('#container');
}

var dblclick = function(d) {
	d3.select(this).classed("fixed", d.fixed = false);
};

var dragstart = function(d){ 
	d3.select(this).classed("fixed", d.fixed = true);

};

var change = function(game){
	var trans = [];

	$.getJSON(game + 'nodes.json', function(data){
		var node = svg_graph.selectAll('circle');
		var p_nodes = node[0];

		var dist_matrix = [];
		for (var i = 0; i <= 10; i++) {
			var dists = [];
			for (var j = 0; j <= 10; j++) {
				dists.push(Math.pow(p_nodes[i].cx.baseVal.value - data[j].x, 2) + Math.pow(p_nodes[i].cy.baseVal.value - data[j].y, 2));
			};
			dist_matrix.push(dists);
		};

		HG.matrix = dist_matrix;

		var new_data = [];
		trans = HG.hungarianAlgorithm([0,1,2,3,4,5,6,7,8,9,10], [0,1,2,3,4,5,6,7,8,9,10])

		$.getJSON(game + 'links.json', function(data){
			var max_w = Math.max.apply(Math, data.map(function(d) { return d.value; }))
			var new_data = []
			for (var i = 0; i<= 10; i++) {
				for (var j = 0; j <= 10; j++) {
					var datum = data[trans[i][1] * 11 + trans[j][1]];
					datum.id = i*11+j;
					new_data.push(data[trans[i][1] * 11 + trans[j][1]]);
				}
			}
			data = new_data;

			lines = d3.selectAll('line');
			classes = lines[0].map(function(d){ return d.attributes[0].value; })

			seen_lines = [];
			for (var i = 0; i <= 120; i++){
				if (classes[i] === 'seen') {
					seen_lines.push(i);
				}
			};
			var link = svg_graph.selectAll("line").data(data)
				.transition()
				.duration(3000)
				.style('stroke', 'black')
				.style('stroke-width', function(d) { return d.value *10 / max_w; })
				.attr('class', function(d) {
					for (var i = 0; i<=seen_lines.length - 1; i++){
						if (seen_lines[i] === d.id){
							return 'seen';
						}
					};
					return 'hidden';
				})
				.attr("marker-end", "url(#arrowGray)")
				.attr("x1", function(d) { 
				if (dy === 0) { return d.source.x; };

				// shift the lines so that the weighted directed links are separate
				var v = d.value /1.5 ,
					shift = v / 2 + 1,
					dx = d.target.x - d.source.x,
					dy = d.target.y - d.source.y,
					sign = dx / Math.abs(dx);

				sign2 = (dx/dy) / Math.abs(dx/dy);
				sign *= (-1 * sign2)

				var shiftx = Math.sqrt(Math.pow(shift,2)/(1 + Math.pow(dx/dy,2)));
				return sign * shiftx + d.source.x; 
			})
	        .attr("y1", function(d) { 
	        	if (dx === 0) { return d.source.y; };

	        	// shift the lines so that the weighted directed links are separate
				var v = d.value * 10 / max_w + 1,
					shift =  v / 2 + 1,
					dx = d.target.x - d.source.x,
					dy = d.target.y - d.source.y,
					sign = dy / Math.abs(dy);

				sign2 = (dx/dy) / Math.abs(dx/dy);
				sign *= sign2

				var shifty = Math.sqrt(Math.pow(shift,2)/(1 + Math.pow(dy/dx,2)));
				return d.source.y + (sign * shifty); 
			})
	        .attr("x2", function(d) {
	        	var length = Math.sqrt(Math.pow(d.target.y - d.source.y, 2) + Math.pow(d.target.x - d.source.x, 2));
			    var scale = (length - R) / length;
			    var offset = (d.target.x - d.source.x) - (d.target.x - d.source.x) * scale;
			    var targetx = d.target.x - offset;

	        	if (dy === 0) { return targetx; };

	        	// shift the lines so that the weighted directed links are separate
				var v = d.value * 10 / max_w + 1,
					shift = v / 2 + 1,
					dx = targetx - d.source.x,
					dy = d.target.y - d.source.y,
					sign = dx / Math.abs(dx);

				sign2 = (dx/dy) / Math.abs(dx/dy);
				sign *= (-1 * sign2)

				var shiftx = Math.sqrt(Math.pow(shift,2)/(1 + Math.pow(dx/dy,2)));

				return sign * shiftx + targetx;
			})
	        .attr("y2", function(d) {
	        	var length = Math.sqrt(Math.pow(d.target.y - d.source.y, 2) + Math.pow(d.target.x - d.source.x, 2));
			    var scale = (length - R) / length;
			    var offset = (d.target.y - d.source.y) - (d.target.y - d.source.y) * scale;
			    var targety = d.target.y - offset;

	        	if (dx === 0) { return targety; };

	        	// shift the lines so that the weighted directed links are separate
				var v = d.value * 10 / max_w + 1,
					shift =  v / 2 + 1,
					dx = d.target.x - d.source.x,
					dy = targety - d.source.y,
					sign = dy / Math.abs(dy);

				sign2 = (dx/dy) / Math.abs(dx/dy);
				sign *= sign2

				var shifty = Math.sqrt(Math.pow(shift,2)/(1 + Math.pow(dy/dx,2)));

				return targety + (sign * shifty); 
			})
		})

		for (var i = 0; i <= 10; i++) {
			new_data.push(data[trans[i][1]])
		};
		data = new_data;

		node.data(data)
			.transition()
			.duration(3000)
			.attr("cx", function(d) { return d.x; })
		    .attr("cy", function(d) { return d.y; });

		var text = svg.selectAll('text.label').data(data)
				.transition()
				.duration(3000)
				.attr('class', 'label')
                .attr("fill", "white")
                .attr('font-family', "sans-serif")
                .text(function(d) {  return d.name;  })
                .attr("transform", function(d) {
			        return "translate(" + (d.x - 6) + "," + (d.y + 6) + ")";
			    });
	})
};
$('button').on('click', function(){
	console.log('click')
	change($(this).attr('id'));
})

// $.getJSON('JSON-passes/' + game, function(data) {
// 	var svg_graph = svg.append('g').attr('class','graph').attr('width', W).attr('height', H);

// 	var drag = force.drag().on("dragstart", dragstart);

// 	var links = [];
// 	var nodes = [];
// 	for (pl1 in data){
// 		nodes.push({"name": pl1, "sub": 0})
// 	};
// 	var n1 = 0;
// 	for (pl1 in data){
// 		var n2 = 0;
// 		for (pl2 in data[pl1]){
// 			var link = {"source": n1, "target": n2, "value": data[pl1][pl2]};
// 			links.push(link);
// 			n2++;
// 		};
// 		n1++;
// 	};

// 	force
// 		.nodes(nodes)
// 		.links(links)

// 	var link = svg_graph.selectAll(".link").data(links).enter()
// 		.append('line')
// 		.style('stroke', 'black')
// 		.style('stroke-width', function(d) { return d.value / 1.5; })
// 		.style('opacity', 0.7)
// 		.attr("marker-end", "url(#arrowGray)");

// 	var R = 20;

// 	var node = svg_graph.selectAll(".node").data(nodes).enter()
// 		.append("circle")
// 		.attr("r", R)
// 		.style("fill", 'blue')
// 		.style('stroke', 'white')
// 		.style('stroke-width', 2)
// 		.on("dblclick", dblclick)
// 		.call(drag);

// 	var text = svg.selectAll("text.label")
//                 .data(nodes)
//                 .enter().append("text")
//                 .attr("class", "label")
//                 .attr("fill", "white")
//                 .attr('font-family', "sans-serif")
//                 .text(function(d) {  return d.name;  });

//     var tick = function(){
// 		link.attr("x1", function(d) { 
// 			if (dy === 0) { return d.source.x; };

// 			// shift the lines so that the weighted directed links are separate
// 			var v = d.value /1.5 ,
// 				shift = v / 2 + 1,
// 				dx = d.target.x - d.source.x,
// 				dy = d.target.y - d.source.y,
// 				sign = dx / Math.abs(dx);

// 			sign2 = (dx/dy) / Math.abs(dx/dy);
// 			sign *= (-1 * sign2)

// 			var shiftx = Math.sqrt(Math.pow(shift,2)/(1 + Math.pow(dx/dy,2)));
// 			return sign * shiftx + d.source.x; 
// 		})
//         .attr("y1", function(d) { 
//         	if (dx === 0) { return d.source.y; };

//         	// shift the lines so that the weighted directed links are separate
// 			var v = d.value/1.5,
// 				shift =  v / 2 + 1,
// 				dx = d.target.x - d.source.x,
// 				dy = d.target.y - d.source.y,
// 				sign = dy / Math.abs(dy);

// 			sign2 = (dx/dy) / Math.abs(dx/dy);
// 			sign *= sign2

// 			var shifty = Math.sqrt(Math.pow(shift,2)/(1 + Math.pow(dy/dx,2)));
// 			return d.source.y + (sign * shifty); 
// 		})
//         .attr("x2", function(d) {
//         	var length = Math.sqrt(Math.pow(d.target.y - d.source.y, 2) + Math.pow(d.target.x - d.source.x, 2));
// 		    var scale = (length - R) / length;
// 		    var offset = (d.target.x - d.source.x) - (d.target.x - d.source.x) * scale;
// 		    var targetx = d.target.x - offset;

//         	if (dy === 0) { return targetx; };

//         	// shift the lines so that the weighted directed links are separate
// 			var v = d.value/1.5,
// 				shift = v / 2 + 1,
// 				dx = targetx - d.source.x,
// 				dy = d.target.y - d.source.y,
// 				sign = dx / Math.abs(dx);

// 			sign2 = (dx/dy) / Math.abs(dx/dy);
// 			sign *= (-1 * sign2)

// 			var shiftx = Math.sqrt(Math.pow(shift,2)/(1 + Math.pow(dx/dy,2)));

// 			return sign * shiftx + targetx;
// 		})
//         .attr("y2", function(d) {
//         	var length = Math.sqrt(Math.pow(d.target.y - d.source.y, 2) + Math.pow(d.target.x - d.source.x, 2));
// 		    var scale = (length - R) / length;
// 		    var offset = (d.target.y - d.source.y) - (d.target.y - d.source.y) * scale;
// 		    var targety = d.target.y - offset;

//         	if (dx === 0) { return targety; };

//         	// shift the lines so that the weighted directed links are separate
// 			var v = d.value/1.5,
// 				shift =  v / 2 + 1,
// 				dx = d.target.x - d.source.x,
// 				dy = targety - d.source.y,
// 				sign = dy / Math.abs(dy);

// 			sign2 = (dx/dy) / Math.abs(dx/dy);
// 			sign *= sign2

// 			var shifty = Math.sqrt(Math.pow(shift,2)/(1 + Math.pow(dy/dx,2)));

// 			return targety + (sign * shifty); 
// 		})

// 		node.attr("cx", function(d) { return d.x; })
// 		    .attr("cy", function(d) { return d.y; });

// 		text.attr("transform", function(d) {
// 	        return "translate(" + (d.x - 6) + "," + (d.y + 6) + ")";
// 	    });
// 	};

// 	force.on("tick", tick);

// 	force.start();
// 	window.force = force;

// });

// d3.xml(game +'.svg', 'image/svg+xml', function(xml) {
// 	var svg_graph = svg.insert('g', '.graph').attr('class', 'graph')
// 	var external = xml.documentElement;
// 	var svg_attrs = external.attributes;
// 	var h = svg_attrs['height'].value,
// 		w = svg_attrs['width'].value;
// 	var child_nodes = external.children;
// 	for (i = 0; i< child_nodes.length;i++) {
// 		try{
// 			var path_attrs = child_nodes[i].attributes,
// 				style = path_attrs['style'].value,
// 				d = path_attrs['d'].value;
// 			svg_graph.attr('width', h).attr('height', w)
// 				.append('path').attr('d', d).attr('style', style)
// 			if (+game[game.length-1] === 1){
// 				svg_graph.attr('transform', 'translate(0 ' + w + ') rotate(270 0 0)');
// 			}else{
// 				svg_graph.attr('transform', 'translate(' + h + ' 0) rotate(90 0 0)');
// 			}
// 		}
// 		catch(e){}
// 	}
// });

});