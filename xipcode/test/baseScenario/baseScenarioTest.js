import { expect } from 'chai';
import { describe, it } from 'mocha';
import baseScenario from '../../src/baseScenario/baseScenario'

describe('baseScenario', () => {

	describe('create', () => {

		it('creates the base scenario', () => {
			const scenario = baseScenario.create();
			expect(scenario.id).equals('baseScenario');
			expect(scenario.isDefault).equals(false);
			expect(scenario.requires).eql([]);
			expect(scenario.getParticipatingPhases()).eql(['initialize']);
			expect(scenario.getOperationsForPhase('initialize')[0].id).equals('initialize');
		});
	});
});