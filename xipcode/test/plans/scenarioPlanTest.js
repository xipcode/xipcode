import { expect } from 'chai';
import { describe, it } from 'mocha';
import scenarioPlan from '../../src/plans/scenarioPlan';
import sinon from 'sinon';

describe('scenarioPlan', () => {

	describe('create', () => {

		it('requires phase', () => {
			expect(() => scenarioPlan.create(undefined, {})).throw('phase must be defined');
		});

		it('requires scenario', () => {
			expect(() => scenarioPlan.create({}, undefined)).throw('scenario must be defined');
		});

		it('create', () => {
			const phase = { id: 123 };
			const scenario = { getOperationsForPhase() {} };
			const operations = [{}, {}];
			sinon.stub(scenario, 'getOperationsForPhase').withArgs(123).returns(operations);
			const plan = scenarioPlan.create(phase, scenario);
			expect(plan.operations).equals(operations);
		});
	});
});