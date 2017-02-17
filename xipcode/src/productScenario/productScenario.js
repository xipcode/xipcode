import scenario from '../model/scenario';
import createProductFileOperation from './createProductFileOperation';
import uglifyOperation from './uglifyOperation';
import polyfillDescriptor from '../browserScenario/polyfillDescriptor';

function productScenario() {
	return scenario.create({
		id: 'product',
		isDefault: false,
		requires: [
			'baseScenario'
		],
		operationsByPhaseId: {
			'package': [
				createProductFileOperation.create(polyfillDescriptor),
				uglifyOperation.create()
			]
		}
	});
}

export default {
	create: productScenario
}
