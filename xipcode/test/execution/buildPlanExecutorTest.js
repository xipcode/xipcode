import { expect } from 'chai';
import { describe, it } from 'mocha';
import buildPlanExecutor from '../../src/execution/buildPlanExecutor';
import executionContext from '../../src/execution/executionContext';
import mockOperation from '../model/mockOperation';
import sinon from 'sinon';

describe('buildPlanExecutor', () => {

	describe('execute', () => {

		const executor = buildPlanExecutor.create();
		const project1 = { id: 'project-1' };
		const project2 = { id: 'project-2' };
		const scenario = { id: 'scenario-1' };
		const phase = { id: 'phase-1' };

		let sandbox;
		let resultCollector;
		let operation1;
		let operation2;
		let operation3;
		let executionContextStub;

		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			resultCollector = mockOperation.createResultCollector();
			operation1 = mockOperation.create('operation-1', resultCollector);
			operation2 = mockOperation.create('operation-2', resultCollector);
			operation3 = mockOperation.create('operation-3', resultCollector);
			executionContextStub = sandbox.stub(executionContext, 'create');
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('requires buildPlan', () => {
			expect(() => executor.execute()).throw('buildPlan must be defined');
		});

		it('executes build plan', () => {
			const plan = {};
			const execContext = [
				{
					project: project1,
					operation: operation1,
					phase: phase,
					scenario: scenario
				},
				{
					project: project1,
					operation: operation2,
					phase: phase,
					scenario: scenario
				},
				{
					project: project2,
					operation: operation3,
					phase: phase,
					scenario: scenario
				}
			];
			executionContextStub.withArgs(plan).returns(execContext);
			const result = executor.execute(plan);
			const operation1Spy = sandbox.spy(operation1, 'perform');
			return result.then(() => {
				expect(resultCollector.results.length).equal(3);

				sinon.assert.calledWith(operation1Spy, project1, sinon.match.defined);
				expect(resultCollector.results[0].operationId).equal('operation-1');
				expect(resultCollector.results[0].projectId).equal('project-1');

				expect(resultCollector.results[1].operationId).equal('operation-2');
				expect(resultCollector.results[1].projectId).equal('project-1');

				expect(resultCollector.results[2].operationId).equal('operation-3');
				expect(resultCollector.results[2].projectId).equal('project-2');
			});
		});
	});
});
