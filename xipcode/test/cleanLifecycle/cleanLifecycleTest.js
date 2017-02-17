import { expect } from 'chai';
import { describe, it } from 'mocha';
import cleanLifecycle from '../../src/cleanLifecycle/cleanLifecycle'

describe('cleanLifecycle', () => {

	describe('create', () => {

		it('returns the clean lifecycle', () => {
			const lifecycle = cleanLifecycle.create();
			expect(lifecycle.id).equals('clean');

			expect(lifecycle.phases.length).equals(1);
			expect(lifecycle.phases[0].id).equals('clean');

			expect(lifecycle.scenarios.length).equals(1);
			const scenario = lifecycle.scenarios[0];
			expect(scenario.id).equals('clean');
			expect(scenario.isDefault).equals(true);
			expect(scenario.getParticipatingPhases()).eql(['clean']);
			expect(scenario.getOperationsForPhase('clean')[0].id).equals('clean');
			expect(scenario.getOperationsForPhase('clean')[1].id).equals('npm-uninstall');
		});
	});
});