import { expect } from 'chai';
import { describe, it } from 'mocha';
import module2 from '../src/module2';

describe('module2', () => {

	it('returns a pluralized string', () => {
		expect(module2.getString()).to.equal('thing 2s');
	})
});