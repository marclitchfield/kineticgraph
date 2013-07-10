(function(containerId) {

	var stage = new Kinetic.Stage({
		container: containerId,
		draggable: true,
		width: window.innerWidth,
		height: window.innerHeight
	});

	window.onresize = function(event) {
		stage.setWidth(window.innerWidth);
		stage.setHeight(window.innerHeight);
	};

	var kineticGraph = (function(stage) {
		var graph = new Springy.Graph();
		var nodeLayer = new Kinetic.Layer();
		var edgeLayer = new Kinetic.Layer();

		stage.add(edgeLayer);
		stage.add(nodeLayer);

		var layout = new Springy.Layout.ForceDirected(graph,
			200.0,  // Spring stiffness
			200.0,  // Node repulsion
			0.2     // Damping
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
				node.data.shape.setVisible(true);
			}
		);

		renderer.start();

		var distanceSolver = new DistanceSolver(graph);

		function removeDistantNodes(currentNode) {
			var distances = distanceSolver.computeDistancesFrom(currentNode.id);
			console.log('nodes:', _.keys(distances).length)
			
			graph.nodes.forEach(function(n) {
				var distance = distances[n.id];
				if (distances[n.id] >= 10) {
					removeNode(n);
				} else {
					var color = tinycolor({ h: 255 - distance * 30, s: 1, v: 1 });
					n.data.shape.setFillRGB(color.toRgb());
				}
			});
		}

		function removeNode(node) {
			graph.edges.forEach(function(e) {
				if (e.source.id === node.id || e.target.id === node.id) {
					e.data.line.destroy();
				}
			});
			node.data.shape.destroy();
			graph.removeNode(node);
		}

		function createNode(label, parent) {
			var circle = new Kinetic.Circle({
				radius: 15,
				fill: 'gray',
				stroke: 'black',
				strokeWidth: 2,
				visible: false
			});

			// add the shape to the layer
			nodeLayer.add(circle);

			var node = graph.newNode({ label: label, shape: circle, parent: parent });

			circle.on('mousemove click tap', function() {
				for(var i=0; i<4; i++) {
					var newGuy = createNode(label + "'", node);
					createEdge(node, newGuy);
				}
				removeDistantNodes(node);
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