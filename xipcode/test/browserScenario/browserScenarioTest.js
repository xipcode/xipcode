import { expect } from 'chai';
import { describe, it } from 'mocha';
import browserScenario from '../../src/browserScenario/browserScenario'

describe('browserScenario', () => {

	describe('create', () => {

		it('creates the browser scenario', () => {
			const scenario = browserScenario.create();
			expect(scenario.id).equals('browser');
			expect(scenario.isDefault).equals(false);
			expect(scenario.requires).eql(['sourcesScenario']);
			expect(scenario.getParticipatingPhases()).eql(['compile', 'compile-tests', 'test', 'package']);
			expect(scenario.getOperationsForPhase('compile').length).equals(3);
			expect(scenario.getOperationsForPhase('compile')[0].id).equals('create-polyfill-bundle');
			expect(scenario.getOperationsForPhase('compile')[1].id).equals('compile-browser-libraries');
			expect(scenario.getOperationsForPhase('compile')[2].id).equals('compile-browser');
			expect(scenario.getOperationsForPhase('compile-tests').length).equals(1);
			expect(scenario.getOperationsForPhase('compile-tests')[0].id).equals('compile-browser-tests');
			expect(scenario.getOperationsForPhase('test').length).equals(3);
			expect(scenario.getOperationsForPhase('test')[0].id).equals('collect-browser-libraries');
			expect(scenario.getOperationsForPhase('test')[1].id).equals('test-browser');
			expect(scenario.getOperationsForPhase('test')[2].id).equals('remap-coverage-report');
			expect(scenario.getOperationsForPhase('package').length).equals(1);
			expect(scenario.getOperationsForPhase('package')[0].id).equals('rewrite-browser-only-main');
		});
	});
});