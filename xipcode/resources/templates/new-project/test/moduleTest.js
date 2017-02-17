import { expect } from 'chai';
import module from '../src/module';

describe('module', () => {

	describe('doSomething', () => {

		it('returns the correct string', () => {
			expect(module.doSomething()).to.equal('test');
		});

	});

});
