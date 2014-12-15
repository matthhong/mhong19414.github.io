var save = function(){
	force.stop();

	var nodes_dl = 'data:text/json;charset=utf8,' + encodeURIComponent(JSON.stringify(force.nodes()));
	var links_dl = 'data:text/json;charset=utf8,' + encodeURIComponent(JSON.stringify(force.links()));

	$('<a href="' + nodes_dl + '" download="' + game + 'nodes.json">download nodes</a>').appendTo('#container');
	$('<a href="' + links_dl + '" download="' + game + 'links.json">download links</a>').appendTo('#container');
}

$(function(){
var first_game= '2011779-1'

var force = d3.layout.force()
		.charge(-120)
		.linkDistance(200)
		.size([546, 726]);

var svg = d3.select('svg').attr('width', 546).attr('height', 726);

svg.append('defs')
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

var dblclick = function(d) {
	d3.select(this).classed("fixed", d.fixed = false);
};

var dragstart = function(d){ 
	d3.select(this).classed("fixed", d.fixed = true);

};

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
		toggle_highlight(selected[0], d.name);
		selected.pop();
		selected.pop();
	}
	else{
		selected.push(d.name)
	}
}

var group = svg.append('g').attr('class','pic').attr('width', 546).attr('height', 726);
var nodeRadius = 20;

$.getJSON(first_game + 'links.json', function(data){
	var max_w = Math.max.apply(Math, data.map(function(d) {return d.value;}))
	var link = group.selectAll(".link").data(data).enter()
		.append('line')
		.attr("class", "hidden")
		.style('stroke', 'black')
		.style('stroke-width', function(d) { return d.value * 10 / max_w + 1; })
		.attr("marker-end", function(d) { return d.value === 0 ? "none" : "url(#arrowGray)" })

	link.attr("x1", function(d) { 
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
        	var length = Math.sqrt(Math.pow(d.target.y - d.source.y, 2) + Math.pow(d.target.x - d.source.x, 2));
		    var scale = (length - nodeRadius) / length;
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
		    var scale = (length - nodeRadius) / length;
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

	$.getJSON(first_game + 'nodes.json', function(data){

	window.node = group.selectAll(".node").data(data).enter()
		.append("circle")
		.attr("r", nodeRadius)
		.style("fill", 'blue')
		.style('stroke', 'white')
		.style('stroke-width', 2)
		.on('click', clicked)

	var text = svg.selectAll("text.label")
                .data(data)
                .enter().append("text")
                .attr("class", "label")
                .attr("fill", "white")
                .attr('font-family', "sans-serif")
                .text(function(d) {  return d.name;  })
                .attr("transform", function(d) {
			        return "translate(" + (d.x - 6) + "," + (d.y + 6) + ")";
			    })
			    .on('click', clicked);

	node.attr("cx", function(d) { return d.x; })
		    .attr("cy", function(d) { return d.y; });
});
});

var change = function(game){
	var trans = [];

	$.getJSON(game + 'nodes.json', function(data){
		var node = group.selectAll('circle');
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
			var link = group.selectAll("line").data(data)
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
			    var scale = (length - nodeRadius) / length;
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
			    var scale = (length - nodeRadius) / length;
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
// 	var group = svg.append('g').attr('class','pic').attr('width', 546).attr('height', 726);

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

// 	var link = group.selectAll(".link").data(links).enter()
// 		.append('line')
// 		.style('stroke', 'black')
// 		.style('stroke-width', function(d) { return d.value / 1.5; })
// 		.style('opacity', 0.7)
// 		.attr("marker-end", "url(#arrowGray)");

// 	var nodeRadius = 20;

// 	var node = group.selectAll(".node").data(nodes).enter()
// 		.append("circle")
// 		.attr("r", nodeRadius)
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
// 		    var scale = (length - nodeRadius) / length;
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
// 		    var scale = (length - nodeRadius) / length;
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
// 	var group = svg.insert('g', '.pic').attr('class', 'graph')
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
// 			group.attr('width', h).attr('height', w)
// 				.append('path').attr('d', d).attr('style', style)
// 			if (+game[game.length-1] === 1){
// 				group.attr('transform', 'translate(0 ' + w + ') rotate(270 0 0)');
// 			}else{
// 				group.attr('transform', 'translate(' + h + ' 0) rotate(90 0 0)');
// 			}
// 		}
// 		catch(e){}
// 	}
// });

});