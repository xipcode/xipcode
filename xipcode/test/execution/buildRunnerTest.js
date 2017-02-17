import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import buildRunner from '../../src/execution/buildRunner';
import buildPlan from '../../src/plans/buildPlan';
import buildPlanExecutor from '../../src/execution/buildPlanExecutor';
import watcher from '../../src/execution/watcher';

describe('buildRunner', () => {

	describe('create', () => {

		it('requires watchEnabled', () => {
			expect(() => buildRunner.create(undefined)).throw('watchEnabled must be defined');
		});
	});

	describe('run', () => {

		const runner = buildRunner.create(false);

		const project = { id: 'project-1'};
		const projects = [project];
		const lifecycle = {
			initialize: () => {}
		};
		const phases = ['initialize', 'compile', 'install'];
		const plan = {};

		let sandbox;
		let watchStub;
		let buildPlanCreateStub;
		let executeStub;
		let chdirStub;

		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			watchStub = sandbox.stub(watcher, 'watch');
			buildPlanCreateStub = sandbox.stub(buildPlan, 'create').returns(plan);
			executeStub = { execute: sandbox.stub().returns(Promise.resolve()) };
			sandbox.stub(buildPlanExecutor, 'create').returns(executeStub);
			chdirStub = sandbox.stub(process, 'chdir');
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('requires projects', () => {
			expect(() => runner.run(undefined, {}, phases)).throw('projects must be defined');
		});

		it('requires lifecycle', () => {
			expect(() => runner.run(projects, undefined, phases)).throw('lifecycle must be defined');
		});

		it('requires targetPhaseIds', () => {
			expect(() => runner.run(projects, {}, undefined)).throw('targetPhaseIds must be defined');
		});

		it('runs', () => {
			const cwd = process.cwd();
			return runner.run(projects, lifecycle, phases)
				.then(() => {
					sinon.assert.calledWith(buildPlanCreateStub, projects, lifecycle, phases);
					sinon.assert.calledWith(executeStub.execute, plan);
					sinon.assert.calledWith(chdirStub, cwd);
					sinon.assert.notCalled(watchStub);
				});
		});

		it('enables watching', () => {
			const watchingRunner = buildRunner.create(true);
			return watchingRunner.run(projects, lifecycle, phases)
				.then(() => {
					sinon.assert.calledOnce(watchStub);
					sinon.assert.calledWith(watchStub, projects, lifecycle, phases, sinon.match.typeOf('function'));
				});
		});
	});
});