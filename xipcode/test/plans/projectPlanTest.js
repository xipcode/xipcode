import { expect } from 'chai';
import { describe, it } from 'mocha';
import projectPlan from '../../src/plans/projectPlan';
import phasePlan from '../../src/plans/phasePlan';
import sinon from 'sinon';

describe('projectPlan', () => {

	const project = { id: '123' };

	const phase1 = { id: 'phase-1'};
	const phase2 = { id: 'phase-2'};
	const phase3 = { id: 'phase-3'};

	const lifecycle = {
		phases: [ phase1, phase2, phase3 ],
		scenarios: []
	};

	const phasePlan1 = { phase: phase1 };
	const phasePlan2 = { phase: phase2 };
	const phasePlan3 = { phase: phase3 };

	describe('create', () => {

		let phasePlanStub;
		beforeEach(() => {
			phasePlanStub = sinon.stub(phasePlan, 'create');
			phasePlanStub.withArgs(project, phase1, []).returns(phasePlan1);
			phasePlanStub.withArgs(project, phase2, []).returns(phasePlan2);
			phasePlanStub.withArgs(project, phase3, []).returns(phasePlan3);
		});

		afterEach(() => {
			phasePlan.create.restore();
		});

		it('requires project', () => {
			expect(() => projectPlan.create(undefined, {}, ['phase-1'])).throw('project must be defined');
		});

		it('requires lifecycle', () => {
			expect(() => projectPlan.create({}, undefined, ['phase-1'])).throw('lifecycle must be defined');
		});

		it('requires targetPhaseIds', () => {
			expect(() => projectPlan.create({}, {}, undefined)).throw('targetPhaseIds must be defined');
		});

		it('sets project', () => {
			const plan = projectPlan.create(project, lifecycle, ['phase-1']);
			expect(plan.project.id).equal('123');
		});

		it('creates plan for one phase', () => {
			const plan = projectPlan.create(project, lifecycle, ['phase-1']);
			expect(plan.project.id).equal('123');
			expect(plan.phasePlans.length).equal(1);
			expect(plan.phasePlans[0]).equal(phasePlan1);
		});

		it('creates plan for two phases', () => {
			const plan = projectPlan.create(project, lifecycle, ['phase-1', 'phase-2']);
			expect(plan.phasePlans.length).equal(2);
			expect(plan.phasePlans[0]).equal(phasePlan1);
			expect(plan.phasePlans[1]).equal(phasePlan2);
		});

		it('creates plan for three phase', () => {
			const plan = projectPlan.create(project, lifecycle, ['phase-1', 'phase-2', 'phase-3']);
			expect(plan.phasePlans.length).equal(3);
			expect(plan.phasePlans[0]).equal(phasePlan1);
			expect(plan.phasePlans[1]).equal(phasePlan2);
			expect(plan.phasePlans[2]).equal(phasePlan3);
		});
	});
});