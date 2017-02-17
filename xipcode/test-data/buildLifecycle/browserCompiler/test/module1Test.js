import { expect } from 'chai';
import { describe, it } from 'mocha';
import module1 from '../src/module1';

describe('module1', () => {

	it('returns a pluralized string', () => {
		expect(module1.getString()).to.equal('thing 1s');
	})
});