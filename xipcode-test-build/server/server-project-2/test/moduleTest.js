import { expect } from 'chai';
import { describe, it } from 'mocha';
import module from '../src/module';

describe('module', () => {

	describe('doSomething', () => {

		it('returns the correct string', () => {
			expect(module.doSomething()).to.equal('this is a test');
		});

	});

});
