import { expect } from 'chai';
import { describe, it } from 'mocha';
import phasePlan from '../../src/plans/phasePlan';
import scenarioPlan from '../../src/plans/scenarioPlan';
import scenarioRegistry from '../../src/model/scenarioRegistry';
import sinon from 'sinon';

describe('phasePlan', () => {

	function mockScenario(id, isDefault, requires) {
		return { id, isDefault, requires };
	}

	const phase = { id: '123' };
	const scenario1 = mockScenario('1', false, []);
	const scenario2 = mockScenario('2', false, []);
	const scenario3 = mockScenario('3', true, []);
	const scenario4 = mockScenario('4', true, ['scenario-3']);

	describe('create', () => {

		let scenarioPlanStub;
		beforeEach(() => {
			scenarioPlanStub = sinon.stub(scenarioPlan, 'create');
		});

		afterEach(() => {
			scenarioPlan.create.restore();
		});

		function createProjectWithScenarioIds(scenarioIds) {
			return {
				scenarioIds: scenarioIds
			};
		}

		it('requires project', () => {
			expect(() => phasePlan.create(undefined, {}, [])).throw('project must be defined');
		});

		it('requires phase', () => {
			expect(() => phasePlan.create({}, undefined, [])).throw('phase must be defined');
		});

		it('requires scenarios', () => {
			expect(() => phasePlan.create({}, {}, undefined)).throw('scenarios must be defined');
		});

		it('sets phase', () => {
			const plan = phasePlan.create({}, phase, []);
			expect(plan.phase.id).equal('123');
		});

		it('has empty scenario plans for project with no scenario and no default scenarios', () => {
			const project = createProjectWithScenarioIds([]);
			const plan = phasePlan.create(project, phase, [scenario1, scenario2]);
			expect(plan.scenarioPlans).eql([]);
		});

		it('scenario plans includes default', () => {
			const project = createProjectWithScenarioIds([]);
			const scenarioPlan = { scenario: scenario1 };
			scenarioPlanStub.withArgs(phase, scenario3).returns(scenarioPlan);
			const plan = phasePlan.create(project, phase, [scenario1, scenario2, scenario3]);
			expect(plan.scenarioPlans).eql([scenarioPlan]);
		});

		it('scenario plans includes scenario referenced by project', () => {
			const project = createProjectWithScenarioIds(['1']);
			const scenarioPlan1 = { scenario: scenario1 };
			const scenarioPlan3 = { scenario: scenario3 };
			const scenarioPlan4 = { scenario: scenario4 };
			scenarioPlanStub.withArgs(phase, scenario1).returns(scenarioPlan1);
			scenarioPlanStub.withArgs(phase, scenario3).returns(scenarioPlan3);
			scenarioPlanStub.withArgs(phase, scenario4).returns(scenarioPlan4);
			const scenarios = scenarioRegistry.create([scenario1, scenario2, scenario3, scenario4]);
			const plan = phasePlan.create(project, phase, scenarios);
			expect(plan.scenarioPlans).eql([scenarioPlan1, scenarioPlan3, scenarioPlan4]);
		});
	});
});