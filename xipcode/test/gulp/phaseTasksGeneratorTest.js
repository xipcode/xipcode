import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import mockGulp from './mockGulp';
import phaseTasksGenerator from '../../src/gulp/phaseTasksGenerator';
import mockBuildPlanModel from '../plans/mockBuildPlanModel';

describe('phaseTasksGenerator', () => {

	describe('generate', () => {

		let sandbox;
		let gulp;
		let chdirSpy;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			chdirSpy = sandbox.spy(process, 'chdir');
			gulp = mockGulp.create(sandbox);
		});

		afterEach(() => {
			sandbox.restore();
		});

		function expectRequiredParameter(parameterName) {
			const model = {
				projects: [ { id: 'project-1'} ],
				lifecycle: {
					initialize: () => {}
				},
				enableWatch: true
			};
			delete model[parameterName];
			expect(() => phaseTasksGenerator.generate(model)).throw(`${parameterName} must be defined`);
		}

		it('requires projects', () => {
			expectRequiredParameter('projects');
		});

		it('requires lifecycle', () => {
			expectRequiredParameter('lifecycle');
		});

		it('requires enableWatch', () => {
			expectRequiredParameter('enableWatch');
		});

		it('generates gulp task for each phase', function() {
			const model = mockBuildPlanModel.builder()
				.withPhases(['phase-1', 'phase-2', 'phase-3'])
				.withProject('project-1', [])
				.create();
			phaseTasksGenerator.generate(model);

			expect(gulp.functionByTaskId['phase-1']).not.equal(undefined);
			expect(gulp.functionByTaskId['phase-2']).not.equal(undefined);
			expect(gulp.functionByTaskId['phase-3']).not.equal(undefined);
		});

		it('generates gulp task that executes build plan', function() {
			const cwd = process.cwd();
			const model = mockBuildPlanModel.builder()
				.withPhases(['phase-1'])
				.withScenario('scenario-1', false, ['phase-1'])
				.withProject('project-1', ['scenario-1'])
				.create();
			phaseTasksGenerator.generate(model);

			const taskFunction = gulp.functionByTaskId['phase-1'];
			expect(taskFunction).not.equal(undefined);
			expect(model.resultCollector.results.length).equal(0);
			return taskFunction().then(() => {
				expect(model.resultCollector.results.length).equal(1);
				sinon.assert.calledWith(chdirSpy, cwd);
			});
		});
	});
});
