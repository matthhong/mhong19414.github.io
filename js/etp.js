window.App = {};

App.save = function(){
	force.stop();

	var nodes_dl = 'data:text/json;charset=utf8,' + encodeURIComponent(JSON.stringify(force.nodes()));
	var links_dl = 'data:text/json;charset=utf8,' + encodeURIComponent(JSON.stringify(force.links()));

	$('<a href="' + nodes_dl + '" download="nodes.json">download nodes</a>').appendTo('#container');
	$('<a href="' + links_dl + '" download="links.json">download links</a>').appendTo('#container');
}

$(function(){
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
	    .attr("markerWidth", "7")
	    .attr("markerHeight", "55")
	    .attr("orient", "auto")
	    .append("svg:path")
	    .attr("d", "M 0 0 L 10 5 L 0 10 z")
	    .attr("fill", "#000");

var dblclick = function(d) {
	d3.select(this).classed("fixed", d.fixed = false);
};

var dragstart = function(d){ 
	d3.select(this).classed("fixed", d.fixed = true);

};

var group = svg.append('g').attr('class','pic').attr('width', 546).attr('height', 726);
var nodeRadius = 20;

$.getJSON('nodes.json', function(data){

	window.node = group.selectAll(".node").data(data).enter()
		.append("circle")
		.attr("r", nodeRadius)
		.style("fill", 'blue')
		.style('stroke', 'white')
		.style('stroke-width', 2)

	var text = svg.selectAll("text.label")
                .data(data)
                .enter().append("text")
                .attr("class", "label")
                .attr("fill", "white")
                .attr('font-family', "sans-serif")
                .text(function(d) {  return d.name;  })
                .attr("transform", function(d) {
			        return "translate(" + (d.x - 6) + "," + (d.y + 6) + ")";
			    });

	node.attr("cx", function(d) { return d.x; })
		    .attr("cy", function(d) { return d.y; });
});

$.getJSON('links.json', function(data){
	var max_w = Math.max.apply(Math, data.map(function(d) {return d.value;}))
	var link = group.selectAll(".link").data(data).enter()
		.append('line')
		.style('stroke', 'black')
		.style('stroke-width', function(d) { return d.value * 10 / max_w; })
		.style('opacity', 0.7)
		.attr("marker-end", "url(#arrowGray)");

	link.attr("x1", function(d) { 
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
			var v = d.value/1.5,
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
			var v = d.value/1.5,
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
			var v = d.value/1.5,
				shift =  v / 2 + 1,
				dx = d.target.x - d.source.x,
				dy = targety - d.source.y,
				sign = dy / Math.abs(dy);

			sign2 = (dx/dy) / Math.abs(dx/dy);
			sign *= sign2

			var shifty = Math.sqrt(Math.pow(shift,2)/(1 + Math.pow(dy/dx,2)));

			return targety + (sign * shifty); 
		})
});

change = function(){
	var trans = [];
	$.getJSON('nodes2.json', function(data){
		window.data = data;
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
	$.getJSON('links2.json', function(data){
		var max_w = Math.max.apply(Math, data.map(function(d) {return d.value;}))
		var new_data = []
		for (var i = 0; i<= 10; i++) {
			for (var j = 0; j <= 10; j++) {
				new_data.push(data[trans[i][1] * 11 + trans[j][1]]);
			}
		}
		data = new_data;
		var link = group.selectAll("line").data(data)
			.transition()
			.duration(3000)
			.style('stroke', 'black')
			.style('stroke-width', function(d) { return d.value *10 / max_w; })
			.style('opacity', 0.7)
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
			var v = d.value/1.5,
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
			var v = d.value/1.5,
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
			var v = d.value/1.5,
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
}

// $.getJSON('JSON-passes/2011740-1', function(data) {
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

// d3.xml('image.svg', 'image/svg+xml', function(xml) {
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
// 				.attr('transform', 'translate(0 ' + w + ') rotate(270 0 0)');
// 		}
// 		catch(e){}
// 	}
// });

});