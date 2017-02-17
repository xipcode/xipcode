import scenario from '../model/scenario';
import lintOperation from './lintOperation';
import validateDependenciesOperation from './validateDependenciesOperation';
import packageOperation from './packageOperation';
import npmUninstallOperation from './npmUninstallOperation';
import npmInstallOperation from './npmInstallOperation';

function sourcesScenario() {
	return scenario.create({
		id: 'sourcesScenario',
		isDefault: false,
		requires: [
			'baseScenario'
		],
		operationsByPhaseId: {
			'lint': [lintOperation.create()],
			'compile': [validateDependenciesOperation.create()],
			'package': [packageOperation.create()],
			'install': [npmUninstallOperation.create(), npmInstallOperation.create()]
		}
	});
}

export default {
	create: sourcesScenario
}
