import check from '../../src/core/check';
import scenarioPlan from './scenarioPlan';

function phasePlan(project, phase, scenarios) {
	check.definedObject('project', project);
	check.definedObject('phase', phase);
	check.definedArray('scenarios', scenarios);

	return {
		phase,
		scenarioPlans: createScenarioPlans(project, phase, scenarios)
	};
}

function createScenarioPlans(project, phase, scenarios) {
	const scenarioPlans = [];
	scenarios.forEach((scenario) => {
		if (isScenarioApplicable(project, scenario, scenarios)) {
			const plan = scenarioPlan.create(phase, scenario);
			scenarioPlans.push(plan);
		}
	});
	return scenarioPlans;
}

function isScenarioApplicable(project, scenario, scenarios) {
	if (scenario.isDefault) {
		return true;
	}
	let applicable = false;
	project.scenarioIds.forEach((scenarioId) => {
		const transitiveRequires = scenarios.getTransitiveRequires(scenarioId);
		if (transitiveRequires.indexOf(scenario.id) >= 0) {
			applicable = true;
		}
	});
	return applicable;
}

export default {
	create: phasePlan
}