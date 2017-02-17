import { expect } from 'chai';
import shared1 from '../src/shared1';

describe('shared1', () => {

	it('returns a test string', () => {
		expect(shared1.getString()).to.equal('this is a shared-project-1 test');
	})
});
