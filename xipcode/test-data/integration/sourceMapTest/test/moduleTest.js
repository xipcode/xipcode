import { expect } from 'chai';
import module from '../src/module'

describe('module', () => {

	describe('doSomething', () => {

		it('does something', () => {
			expect(module.doSomething()).equals('something');
		});
	});
});