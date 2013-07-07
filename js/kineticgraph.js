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
				node.data.shape.setVisible(true);
			}
		);

		renderer.start();

		// Dijkstra's path finding algorithm
		function computeDistancesFrom(fromId) {
			var distances = _.object(_.map(graph.nodes, function(n) { 
				return [n.id, n.id === fromId ? 0 : Infinity]; 
			}));

			console.log('d0', distances);

			var unvisited = _.map(graph.nodes, function(n) { return n.id; });
			
			visitNode(fromId);

			function visitNode(nodeId) {
				unvisited = _.filter(unvisited, function(n) { return n !== nodeId; });				
			}

			function getUnvisitedNeighborsOf(nodeId) {
				var neighbors = {};
				graph.edges.forEach(function(e) {
					if (e.source.id === nodeId) { neighbors[e.target.id] = true; }
					if (e.target.id === nodeId) { neighbors[e.source.id] = true; }
				});

				neighbors = _.map(_.keys(neighbors), function(n) { return parseInt(n,10); });
				console.log(nodeId, 'neighbors', neighbors, 'unvisited', unvisited);

				return _.intersection(unvisited, neighbors);
			}

			function computeUnvisitedNeighborDistances(nodeId) {
				var unvisitedNeighbors = getUnvisitedNeighborsOf(nodeId);

				unvisitedNeighbors.forEach(function(neighborId) {
					if (distances[nodeId] + 1 < distances[neighborId]) {
						distances[neighborId] = distances[nodeId] + 1;
					}
				});
			}

			function findNearestUnvisitedNode() {
				var nearest = undefined, min = Infinity;
				unvisited.forEach(function(n) {
					if (distances[n] < min) {
						nearest = n;
						min = distances[n];
					}
				});
				return nearest;
			}

			function traverseGraph(currentId) {
				if (unvisited.length > 0) {
					computeUnvisitedNeighborDistances(currentId);
					visitNode(currentId);
					var nextId = findNearestUnvisitedNode();
					if (nextId !== undefined) {
						traverseGraph(nextId);
					}
				}
			}

			traverseGraph(fromId);
			return distances;
		}

		function applyDistances(currentNode) {
			var distances = computeDistancesFrom(currentNode.id);
			console.log(currentNode.id, distances);
			
			graph.nodes.forEach(function(n) {
				var distance = distances[n.id];
				if (distances[n.id] >= 15) {
					removeNode(n);
				} else {
					var color = tinycolor({ h: 255 - distance * 20, s: 1, v: 1 });
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
				radius: 10,
				fill: 'gray',
				stroke: 'black',
				strokeWidth: 2,
				visible: false
			});

			// add the shape to the layer
			nodeLayer.add(circle);

			var node = graph.newNode({ label: label, shape: circle, parent: parent });

			circle.on('mousemove', function() {
				var newGuy = createNode(label + "'", node);
				createEdge(node, newGuy);
				applyDistances(node);
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