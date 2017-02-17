import { expect } from 'chai';
import { describe, it } from 'mocha';
import sourcesScenario from '../../src/sourcesScenario/sourcesScenario'

describe('sourcesScenario', () => {

	describe('create', () => {

		it('creates the sources scenario', () => {
			const scenario = sourcesScenario.create();
			expect(scenario.id).equals('sourcesScenario');
			expect(scenario.isDefault).equals(false);
			expect(scenario.requires).eql(['baseScenario']);
			expect(scenario.getParticipatingPhases()).eql(['lint', 'compile', 'package', 'install']);
			expect(scenario.getOperationsForPhase('lint')[0].id).equals('lint');
			expect(scenario.getOperationsForPhase('compile')[0].id).equals('validate-dependencies');
			expect(scenario.getOperationsForPhase('package')[0].id).equals('package');
			expect(scenario.getOperationsForPhase('install')[0].id).equals('npm-uninstall');
			expect(scenario.getOperationsForPhase('install')[1].id).equals('npm-install');
		});
	});
});