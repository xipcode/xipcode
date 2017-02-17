import check from '../core/check';

function scenario({ id, isDefault = false, requires = [], operationsByPhaseId }) {
	check.definedString('id', id);
	check.definedBoolean('isDefault', isDefault);
	check.definedObject('operationsByPhaseId', operationsByPhaseId);
	check.definedArray('requires', requires);
	Object.keys(operationsByPhaseId).forEach((key) => {
		check.nonEmptyArray(`operationsByPhaseId[${key}]`, operationsByPhaseId[key]);
	});
	return {
		id,
		isDefault,
		requires,
		getParticipatingPhases() {
			return Object.keys(operationsByPhaseId);
		},
		getOperationsForPhase(phaseId) {
			check.definedString('phaseId', phaseId);
			return operationsByPhaseId[phaseId] || [];
		}
	}
}

export default {
	create: scenario
}
