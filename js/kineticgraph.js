(function() {
	
	// make a new graph
	var graph = new Springy.Graph();

	// make some nodes
	var spruce = graph.newNode({label: 'Norway Spruce'});
	var fir = graph.newNode({label: 'Sicilian Fir'});

	// connect them with an edge
	graph.newEdge(spruce, fir);


	var layout = new Springy.Layout.ForceDirected(
	  graph,
	  400.0, // Spring stiffness
	  400.0, // Node repulsion
	  0.5 // Damping
	);

	var renderer = new Springy.Renderer(
	  layout,
	  function clear() {
	    // code to clear screen
	  },
	  function drawEdge(edge, p1, p2) {
	    // draw an edge
	  },
	  function drawNode(node, p) {
	    // draw a node
	  }
	);


	renderer.start();

})();