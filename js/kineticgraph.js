(function(containerId) {

	var stage = new Kinetic.Stage({
		container: containerId,
		width: 600,
		height: 400
	});

	// make a new graph
	var graph = new Springy.Graph();
	var layer = new Kinetic.Layer();

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
		layer.add(circle);

		// make some nodes
		var node = graph.newNode({ label: label, shape: circle });
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

		layer.add(line);

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

	// add the layer to the stage
	stage.add(layer);


	var layout = new Springy.Layout.ForceDirected(graph,
		400.0, // Spring stiffness
		400.0, // Node repulsion
		0.5 // Damping
	);

	var renderer = new Springy.Renderer(layout,
		
		function clear() {
	    // code to clear screen
		},

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

			node.data.shape.setAbsolutePosition(x, y);
			layer.draw();
		}
	);


	renderer.start();

})('graph');