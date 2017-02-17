import { expect } from 'chai';
import { describe, it } from 'mocha';
import scenario from '../../src/model/scenario';
import scenarioRegistry from '../../src/model/scenarioRegistry';

describe('scenarioRegistry', () => {

	const scenario1 = scenario.create({
		id: 'scenario-1',
		operationsByPhaseId: {}
	});

	const scenario2 = scenario.create({
		id: 'scenario-2',
		requires: ['scenario-1'],
		operationsByPhaseId: {}
	});

	const scenario3 = scenario.create({
		id: 'scenario-3',
		requires: ['scenario-1'],
		operationsByPhaseId: {}
	});

	const scenario4 = scenario.create({
		id: 'scenario-4',
		requires: ['scenario-2', 'scenario-3'],
		operationsByPhaseId: {}
	});

	const scenarios = [
		scenario1,
		scenario2,
		scenario3,
		scenario4
	];

	const registry = scenarioRegistry.create(scenarios);

	describe('create', () => {

		it('requires scenarios', () => {
			expect(() => scenarioRegistry.create()).throw('scenarios must be defined');
		});

	});

	describe('get', () => {

		it('returns scenario for given id', () => {
			expect(registry.get('scenario-1')).eql(scenario1);
			expect(registry.get('scenario-2')).eql(scenario2);
			expect(registry.get('scenario-3')).eql(scenario3);
			expect(registry.get('scenario-4')).eql(scenario4);
		});

		it('rejects invalid scenario id', () => {
			expect(() => registry.get('invalid-id')).throws('Scenario \'invalid-id\' does not exist.  Valid scenarios are: scenario-1, scenario-2, scenario-3, scenario-4');
		});
	});

	describe('getTransitiveRequires', () => {

		it('rejects invalid scenario id', () => {
			expect(() => registry.getTransitiveRequires('invalid-id')).throws('Scenario \'invalid-id\' does not exist.  Valid scenarios are: scenario-1, scenario-2, scenario-3, scenario-4');
		});

		it('returns transitive requires', () => {
			let transitiveRequires = registry.getTransitiveRequires('scenario-1');
			expect(transitiveRequires).eql(['scenario-1']);

			transitiveRequires = registry.getTransitiveRequires('scenario-2');
			expect(transitiveRequires).eql(['scenario-2', 'scenario-1']);

			transitiveRequires = registry.getTransitiveRequires('scenario-3');
			expect(transitiveRequires).eql(['scenario-3', 'scenario-1']);

			transitiveRequires = registry.getTransitiveRequires('scenario-4');
			expect(transitiveRequires).eql(['scenario-4', 'scenario-2', 'scenario-1', 'scenario-3']);
		});
	});
});