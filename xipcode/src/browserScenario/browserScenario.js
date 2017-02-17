import scenario from '../model/scenario';
import polyfillDescriptor from './polyfillDescriptor';
import createPolyfillBundleOperation from './createPolyfillBundleOperation';
import compileBrowserLibrariesOperation from './compileBrowserLibrariesOperation';
import collectBrowserLibrariesOperation from './collectBrowserLibrariesOperation';
import compileBrowserOperation from './compileBrowserOperation';
import compileBrowserTestsOperation from './compileBrowserTestsOperation';
import testBrowserOperation from './testBrowserOperation';
import remapCoverageReportOperation from './remapCoverageReportOperation';
import rewriteBrowserOnlyMainOperation from './rewriteBrowserOnlyMainOperation';

const karmaLogger = [{
	type: 'file',
	filename: 'build/karma.log'
}];

function browserScenario() {
	return scenario.create({
		id: 'browser',
		isDefault: false,
		requires: [
			'sourcesScenario'
		],
		operationsByPhaseId: {
			'compile': [
				createPolyfillBundleOperation.create(polyfillDescriptor),
				compileBrowserLibrariesOperation.create(),
				compileBrowserOperation.create()
			],
			'compile-tests': [
				compileBrowserTestsOperation.create()
			],
			'test': [
				collectBrowserLibrariesOperation.create(polyfillDescriptor),
				testBrowserOperation.create(karmaLogger),
				remapCoverageReportOperation.create()
			],
			'package': [
				rewriteBrowserOnlyMainOperation.create()
			]
		}
	});
}

export default {
	create: browserScenario
}
