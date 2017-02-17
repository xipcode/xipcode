import { expect } from 'chai';
import { describe, it } from 'mocha';
import scenario from '../../src/model/scenario'

describe('scenario', () => {

	let scenarioModel;

	beforeEach(() => {
		scenarioModel = {
			id: 'scenario-1',
			requires: [ 'other-scenario' ],
			operationsByPhaseId: {
				'phase-1': [{ id: 'operation-1' }],
				'phase-2': [{ id: 'operation-2' }]
			}
		};
	});

	describe('create', () => {

		it('requires id', () => {
			delete scenarioModel.id;
			expect(() => scenario.create(scenarioModel)).throw('id must be defined');
		});

		it('requires operationsByPhaseId', () => {
			delete scenarioModel.operationsByPhaseId;
			expect(() => scenario.create(scenarioModel)).throw('operationsByPhaseId must be defined');
		});

		it('requires operationsByPhaseId contain arrays', () => {
			scenarioModel.operationsByPhaseId['phase-3'] = '';
			expect(() => scenario.create(scenarioModel)).throw('operationsByPhaseId[phase-3] must be of type array');
		});

		it('optional requires property has default value', () => {
			delete scenarioModel.requires;
			const scenario1 = scenario.create(scenarioModel);
			expect(scenario1.requires).eql([]);
		});

		it('requires requires to be an array', () => {
			scenarioModel.requires = 'not an array';
			expect(() => scenario.create(scenarioModel)).throw('requires must be of type array');
		});

		it('creates', () => {
			const testScenario = scenario.create(scenarioModel);
			expect(testScenario.id).equal('scenario-1');
			expect(testScenario.isDefault).equal(false);
		});

		it('can set isDefault', () => {
			scenarioModel.isDefault = true;
			const testScenario = scenario.create(scenarioModel);
			expect(testScenario.isDefault).equal(true);
		});

	});

	describe('getParticipatingPhases', () => {

		it('returns empty participating phases', () => {
			scenarioModel.operationsByPhaseId = {};
			const testScenario = scenario.create(scenarioModel);
			expect(testScenario.getParticipatingPhases()).eql([]);
		});

		it('returns non-empty participating phases', () => {
			const testScenario = scenario.create(scenarioModel);
			expect(testScenario.getParticipatingPhases()).eql(['phase-1', 'phase-2']);
		});
	});

	describe('getOperationsForPhase', () => {

		it('returns an array of operations', () => {
			const testScenario = scenario.create(scenarioModel);
			expect(testScenario.getOperationsForPhase('phase-1')).eql([{ id: 'operation-1' }]);
			expect(testScenario.getOperationsForPhase('phase-2')).eql([{ id: 'operation-2' }]);
		});

		it('returns empty array for phase not found', () => {
			const testScenario = scenario.create(scenarioModel);
			expect(testScenario.getOperationsForPhase('phase-99')).eql([]);
		});
	});
});
