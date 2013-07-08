var DistanceSolver = function(graph) {

	var unvisited, distances;

	function computeDistancesFrom(fromId) {
		distances = _.object(_.map(graph.nodes, function(n) { 
			return [n.id, n.id === fromId ? 0 : Infinity]; 
		}));

		unvisited = _.map(graph.nodes, function(n) { return n.id; });
		visitNode(fromId);
		traverseGraph(fromId);
		return distances;
	}

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

	return {
		computeDistancesFrom: computeDistancesFrom
	}
}