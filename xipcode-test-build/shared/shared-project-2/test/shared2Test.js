import { expect } from 'chai';
import shared2 from '../src/shared2';

describe('shared2', () => {

	it('returns a test string', () => {
		expect(shared2.getString()).to.equal('this is a shared-project-1 test');
	})
});
