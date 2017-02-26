import {expect} from 'chai';
import {describe, it} from 'mocha';
import codebase from '../../src/model/codebase'
import sinon from 'sinon';

describe('codebase', () => {

	let sandbox;
	beforeEach(() => {
		sandbox = sinon.sandbox.create();
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('create', () => {

		it('workflows defaults to empty object', () => {
			const newCodebase = codebase.create({});
			expect(newCodebase.workflows).eql({});
		});

		it('workflows ', () => {
			const workflows = { w1: {} };
			const newCodebase = codebase.create({workflows: workflows});
			expect(newCodebase.workflows).eql(workflows);
		});
	});
});
