import scenario from '../model/scenario';
import compileNodeOperation from './compileNodeOperation';
import compileNodeTestsOperation from './compileNodeTestsOperation';
import testNodeOperation from './testNodeOperation';
import instrumentNodeSourcesOperation from './instrumentNodeSourcesOperation';

function nodeScenario() {
	return scenario.create({
		id: 'node',
		isDefault: false,
		requires: [
			'sourcesScenario'
		],
		operationsByPhaseId: {
			'compile': [compileNodeOperation.create()],
			'compile-tests': [
				instrumentNodeSourcesOperation.create(),
				compileNodeTestsOperation.create()
			],
			'test': [
				testNodeOperation.create()
			]
		}
	});
}

export default {
	create: nodeScenario
}
