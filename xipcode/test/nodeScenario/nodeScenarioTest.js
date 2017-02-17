import { expect } from 'chai';
import { describe, it } from 'mocha';
import nodeScenario from '../../src/nodeScenario/nodeScenario'

describe('nodeScenario', () => {

	describe('create', () => {

		it('creates the node scenario', () => {
			const scenario = nodeScenario.create();
			expect(scenario.id).equals('node');
			expect(scenario.isDefault).equals(false);
			expect(scenario.requires).eql(['sourcesScenario']);
			expect(scenario.getParticipatingPhases()).eql(['compile', 'compile-tests', 'test']);
			expect(scenario.getOperationsForPhase('compile').length).equals(1);
			expect(scenario.getOperationsForPhase('compile')[0].id).equals('compile-node');
			expect(scenario.getOperationsForPhase('compile-tests').length).equals(2);
			expect(scenario.getOperationsForPhase('compile-tests')[0].id).equals('instrument-node-sources');
			expect(scenario.getOperationsForPhase('compile-tests')[1].id).equals('compile-node-tests');
			expect(scenario.getOperationsForPhase('test').length).equals(1);
			expect(scenario.getOperationsForPhase('test')[0].id).equals('test-node');
		});
	});
});