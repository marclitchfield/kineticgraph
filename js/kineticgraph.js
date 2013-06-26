(function(containerId) {

	var stage = new Kinetic.Stage({
		container: containerId,
		width: 600,
		height: 400
	});

	// make a new graph
	var graph = new Springy.Graph();
	var nodeLayer = new Kinetic.Layer();
	var edgeLayer = new Kinetic.Layer();

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

		circle.on('click', function() {
			var newGuy = createNode('son of ' + label);
			createEdge(node, newGuy);
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

	var spruce = createNode(graph, 'Norway Spruce');
	var fir = createNode(graph, 'Sicilian Fir');
	var pine = createNode(graph, 'Pine');
	var bean = createNode(graph, 'Bean');
	var spam = createNode(graph, 'Spam');

	// connect them with an edge
	createEdge(spruce, fir);
	createEdge(fir, pine);
	createEdge(pine, bean);
	createEdge(pine, spam);

	// add the layers to the stage
	stage.add(edgeLayer);
	stage.add(nodeLayer);

	var layout = new Springy.Layout.ForceDirected(graph,
		400.0, // Spring stiffness
		400.0, // Node repulsion
		0.5 // Damping
	);

	var renderer = new Springy.Renderer(layout,

		function clear() {

		},

		function drawEdge(edge, p1, p2) {
			edge.data.line.setPoints([
				edge.source.data.shape.attrs.x,
				edge.source.data.shape.attrs.y,
				edge.target.data.shape.attrs.x,
				edge.target.data.shape.attrs.y
			]);
			edgeLayer.draw();
		},

		function drawNode(node, p) {
			var x = p.x * 20 + 400;
			var y = p.y * 20 + 200;

			node.data.shape.setAbsolutePosition(x, y);
			nodeLayer.draw();
		}
	);


	renderer.start();

})('graph');