import phase from '../model/phase';
import scenario from '../model/scenario';
import lifecycle from '../model/lifecycle';
import cleanOperation from './cleanOperation';
import uninstallOperation from '../sourcesScenario/npmUninstallOperation';

const cleanPhase = phase.create({ id: 'clean' });

const defaultScenario = scenario.create({
	id: 'clean',
	isDefault: true,
	operationsByPhaseId: {
		'clean': [cleanOperation.create(), uninstallOperation.create()]
	}
});

function cleanLifecycle() {
	return lifecycle.create({
		id: 'clean',
		phases: [
			cleanPhase
		],
		scenarios: [
			defaultScenario
		],
		initialize: () => {}
	});
}

export default {
	create: cleanLifecycle
}
