(function(containerId) {

	var stage = new Kinetic.Stage({
		container: containerId,
		draggable: true,
		width: 1200,
		height: 900
	});

	var kineticGraph = (function(stage) {
		var graph = new Springy.Graph();
		var nodeLayer = new Kinetic.Layer();
		var edgeLayer = new Kinetic.Layer();
	
		stage.add(edgeLayer);
		stage.add(nodeLayer);

		var layout = new Springy.Layout.ForceDirected(graph,
			200.0,  // Spring stiffness
			100.0,  // Node repulsion
			0.6     // Damping
		);

		var renderer = new Springy.Renderer(layout,
			function clear() {},

			function drawEdge(edge, p1, p2) {
				edge.data.line.setPoints([
					edge.source.data.shape.attrs.x,
					edge.source.data.shape.attrs.y,
					edge.target.data.shape.attrs.x,
					edge.target.data.shape.attrs.y
				]);
			},

			function drawNode(node, p) {
				var x = p.x * 20 + 400;
				var y = p.y * 20 + 200;

				node.data.shape.setPosition(x, y);
			}
		);

		renderer.start();

		function applyAges(currentNode) {
			currentNode.age = 0;
			graph.nodes.forEach(function(n) {

				if (graph.adjacency[currentNode.id][n.id]) {
					n.age = 1;
				} else {
					n.age = (n.age || 0) + 1;
				}

				if (n.age >= 40) {
					graph.edges.forEach(function(e) {
						if (e.source.id === n.id || e.target.id === n.id) {
							e.data.line.destroy();
						}
					})
	
					n.data.shape.destroy();
					graph.removeNode(n);
				} else {
					var color = tinycolor({ h: 250 - n.age * 8, s: 1, v: 1 });
					n.data.shape.setFillRGB(color.toRgb());					
				}

			});
		}

		function createNode(label) { 
			var circle = new Kinetic.Circle({
				x: stage.getWidth() / 2,
				y: stage.getHeight() / 2,
				radius: 10,
				fill: 'gray',
				stroke: 'black',
				strokeWidth: 2
			});


			// add the shape to the layer
			nodeLayer.add(circle);

			var node = graph.newNode({ label: label, shape: circle });

			circle.on('mousemove', function() {
				var newGuy = createNode(label + "'");
				createEdge(node, newGuy);

				applyAges(node);
			});

			return node;
		}

		function createEdge(from, to) {
			var line = new Kinetic.Line({
				x: from.data.shape.x,
				y: from.data.shape.y,
				points: [to.data.shape.x, to.data.shape.y],
				stroke: 'black',
				strokeWidth: 2
			});

			edgeLayer.add(line);

			var edge = graph.newEdge(from, to, {
				line: line
			});
		}

		return {
			createNode: createNode,
			createEdge: createEdge,
			draw: function() {
				edgeLayer.draw();
				nodeLayer.draw();
			}
		};
	})(stage);


	kineticGraph.createNode('Number 1');

	setInterval(function() {
		kineticGraph.draw();
	}, 10);

})('graph');