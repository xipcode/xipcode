import { expect } from 'chai';
import { describe, it } from 'mocha';
import executionContext from '../../src/execution/executionContext';
import buildPlan from '../../src/plans/buildPlan';
import mockBuildPlanModel from '../plans/mockBuildPlanModel';

describe('executionContext', () => {

	describe('create', () => {

		it('requires buildPlan', () => {
			expect(() => executionContext.create()).throw('buildPlan must be defined');
		});

		it('creates execution plan', () => {
			const model = mockBuildPlanModel.builder()
				.withPhases(['phase-1', 'phase-2', 'phase-3'])
				.withScenario('scenario-1', true, ['phase-1'], [])
				.withScenario('scenario-2', false, ['phase-2', 'phase-3'], [])
				.withProject('project-1', [])
				.withProject('project-2', ['scenario-2'])
				.targetPhases(['phase-1', 'phase-2', 'phase-3'])
				.create();
			const plan = buildPlan.create(model.projects, model.lifecycle, model.targetPhaseIds);
			const context = executionContext.create(plan);

			expect(context.length).equal(4);
			expectOperationContext(context[0], 'project-1', 'phase-1', 'scenario-1-phase-1-operation');
			expectOperationContext(context[1], 'project-2', 'phase-1', 'scenario-1-phase-1-operation');
			expectOperationContext(context[2], 'project-2', 'phase-2', 'scenario-2-phase-2-operation');
			expectOperationContext(context[3], 'project-2', 'phase-3', 'scenario-2-phase-3-operation');
		});

		it('supports projects with no scenarios', () => {
			const model = mockBuildPlanModel.builder()
				.withPhases(['phase-1'])
				.withScenario('scenario-1', false, ['phase-1'], [])
				.withProject('project-1', [])
				.targetPhases(['phase-1'])
				.create();
			const plan = buildPlan.create(model.projects, model.lifecycle, model.targetPhaseIds);
			const context = executionContext.create(plan);
			expect(context.length).equal(0);
		});

		it('supports projects with transitive requires', () => {
			const model = mockBuildPlanModel.builder()
				.withPhases(['phase-1'])
				.withScenario('scenario-1', false, ['phase-1'], [])
				.withScenario('scenario-2', false, ['phase-1'], ['scenario-1'])
				.withProject('project-1', ['scenario-2'])
				.targetPhases(['phase-1'])
				.create();
			const plan = buildPlan.create(model.projects, model.lifecycle, model.targetPhaseIds);
			const context = executionContext.create(plan);
			expect(context.length).equal(2);
			expectOperationContext(context[0], 'project-1', 'phase-1', 'scenario-1-phase-1-operation');
			expectOperationContext(context[1], 'project-1', 'phase-1', 'scenario-2-phase-1-operation');
		});

		function expectOperationContext(operationContext, projectId, phaseId, operationId) {
			expect(operationContext.project.id).equal(projectId);
			expect(operationContext.phase.id).equal(phaseId);
			expect(operationContext.operation.id).equal(operationId);
		}
	});

});
