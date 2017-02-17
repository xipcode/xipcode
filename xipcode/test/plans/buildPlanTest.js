import { expect } from 'chai';
import { describe, it } from 'mocha';
import buildPlan from '../../src/plans/buildPlan';
import projectPlan from '../../src/plans/projectPlan';
import sinon from 'sinon';

describe('buildPlan', () => {

	describe('create', () => {

		const project1 = { id: 'project-1' };
		const project2 = { id: 'project-2' };
		const project3 = { id: 'project-3' };

		const lifecycle = {};
		const targetPhaseIds = ['phase-1'];

		const projectPlan1 = { project: project1 };
		const projectPlan2 = { project: project2 };
		const projectPlan3 = { project: project3 };

		let projectPlanStub;
		beforeEach(() => {
			projectPlanStub = sinon.stub(projectPlan, 'create');
			projectPlanStub.withArgs(project1, lifecycle, targetPhaseIds).returns(projectPlan1);
			projectPlanStub.withArgs(project2, lifecycle, targetPhaseIds).returns(projectPlan2);
			projectPlanStub.withArgs(project3, lifecycle, targetPhaseIds).returns(projectPlan3);
		});

		afterEach(() => {
			projectPlan.create.restore();
		});

		it('requires projects', () => {
			expect(() => buildPlan.create(undefined, {}, ['phase-1'])).throw('projects must be defined');
			expect(() => buildPlan.create([], {}, ['phase-1'])).throw('projects must not be empty');
		});

		it('requires lifecycle', () => {
			expect(() => buildPlan.create([project1], undefined, ['phase-1'])).throw('lifecycle must be defined');
		});

		it('requires targetPhaseIds', () => {
			expect(() => buildPlan.create([project1], {}, undefined)).throw('targetPhaseIds must be defined');
		});

		it('creates build plan for one project', () => {
			const plan  = buildPlan.create([project1], lifecycle, targetPhaseIds);
			expect(plan.projectPlans.length).equal(1);
			expect(plan.projectPlans[0]).equal(projectPlan1);
		});

		it('creates build plan for two projects', () => {
			const plan  = buildPlan.create([project1, project2], lifecycle, targetPhaseIds);
			expect(plan.projectPlans.length).equal(2);
			expect(plan.projectPlans[0]).equal(projectPlan1);
			expect(plan.projectPlans[1]).equal(projectPlan2);
		});
	});
});