import check from '../core/check';

function scenarioRegistry(scenarios) {
	check.definedArray('scenarios', scenarios);
	const registry = scenarios.slice();
	const transitiveRequires = {};
	registry.get = (scenarioId) => {
		const scenario = registry.find((scenario) => scenario.id === scenarioId);
		if (!scenario) {
			const scenarioIds = registry.map((scenario) => scenario.id).join(', ');
			throw new Error(`Scenario '${scenarioId}' does not exist.  Valid scenarios are: ${scenarioIds}`);
		}
		return scenario;
	};
	registry.getTransitiveRequires = (scenarioId) => {
		let result = transitiveRequires[scenarioId];
		if (result) {
			return result;
		}
		result = computeTransitiveRequires(registry, scenarioId, []);
		transitiveRequires[scenarioId] = result;
		return result;
	};
	return registry;
}

function computeTransitiveRequires(scenarioRegistry, scenarioId, visited) {
	if (visited.indexOf(scenarioId) >= 0) {
		return [];
	}
	visited.push(scenarioId);
	const scenario = scenarioRegistry.get(scenarioId);
	let allTransitiveRequires = [scenarioId];
	scenario.requires.forEach((requiredScenarioId) => {
		const transitiveRequires = computeTransitiveRequires(scenarioRegistry, requiredScenarioId, visited);
		allTransitiveRequires = allTransitiveRequires.concat(transitiveRequires);
	});
	return allTransitiveRequires;
}

export default {
	create: scenarioRegistry
}
