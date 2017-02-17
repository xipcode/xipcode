import check from '../core/check';

// graphMap is an object where keys are the vertices and values are an array of edges.
function sort(graphMap) {
	check.definedObject('graphMap', graphMap);

	const sortedNodes = [];
	const unsortedNodes = new Set(Object.keys(graphMap));
	const temporarilyMarkedNodes = new Set();

	while (unsortedNodes.size > 0) {
		visit(unsortedNodes.values().next().value);
	}

	function visit(node) {
		checkForCycles(node, temporarilyMarkedNodes, graphMap);
		if (unsortedNodes.has(node)) {
			temporarilyMarkedNodes.add(node);
			graphMap[node].forEach((childNode) => {
				checkForInvalidReference(node, childNode, graphMap);
				visit(childNode);
			});
			temporarilyMarkedNodes.delete(node);
			unsortedNodes.delete(node);
			sortedNodes.push(node);
		}
	}
	return sortedNodes;
}

function checkForCycles(node, temporarilyMarkedNodes, graphMap) {
	if (temporarilyMarkedNodes.has(node)) {
		const path = [...temporarilyMarkedNodes].join(', ');
		const graphString = JSON.stringify(graphMap, 0, 3);
		throw new Error(`Cycle detected in graph at ${node}:\nCycle path: ${path}\nGraph: ${graphString}`);
	}
}

function checkForInvalidReference(fromNode, toNode, graphMap) {
	if (!graphMap.hasOwnProperty(toNode)) {
		const graphString = JSON.stringify(graphMap, 0, 3);
		throw new Error(`'${fromNode}' references '${toNode}', which could not be found in graph:\n${graphString}`);
	}
}

export default {
	sort
}
