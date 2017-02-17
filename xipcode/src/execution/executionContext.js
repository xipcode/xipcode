import check from '../core/check';

function executionContext(buildPlan) {
	check.definedObject('buildPlan', buildPlan);
	return buildPlan.projectPlans.map((projectPlan) => {
		return createPhaseContexts(projectPlan);
	}).reduce(concatenate);
}

function createPhaseContexts(projectPlan) {
	return projectPlan.phasePlans.map((phasePlan) => {
		return createScenarioContexts(projectPlan, phasePlan)
	}).reduce(concatenate);
}

function createScenarioContexts(projectPlan, phasePlan) {
	return phasePlan.scenarioPlans.map((scenarioPlan) => {
		return createOperationContexts(projectPlan, phasePlan, scenarioPlan);
	}).reduce(concatenate, []);
}

function createOperationContexts(projectPlan, phasePlan, scenarioPlan) {
	return scenarioPlan.operations.map((operation) => {
		return {
			project: projectPlan.project,
			phase: phasePlan.phase,
			scenario: scenarioPlan.scenario,
			operation
		}
	});
}

function concatenate(a, b) {
	return a.concat(b);
}

export default {
	create: executionContext
}
