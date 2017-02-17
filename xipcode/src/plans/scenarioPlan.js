import check from '../../src/core/check';

function scenarioPlan(phase, scenario) {
	check.definedObject('phase', phase);
	check.definedObject('scenario', scenario);

	return {
		operations: scenario.getOperationsForPhase(phase.id)
	};
}

export default {
	create: scenarioPlan
}