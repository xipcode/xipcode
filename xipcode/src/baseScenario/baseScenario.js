import scenario from '../model/scenario';
import initializeOperation from './initializeOperation';

function baseScenario() {
	return scenario.create({
		id: 'baseScenario',
		isDefault: false,
		operationsByPhaseId: {
			'initialize': [initializeOperation.create()]
		}
	});
}

export default {
	create: baseScenario
}
