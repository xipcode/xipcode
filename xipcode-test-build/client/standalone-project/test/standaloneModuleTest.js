import { expect } from 'chai';
import { getClientString } from '../src/standaloneModule';

describe('standaloneModule', () => {

	it('returns a test string', () => {
		expect(getClientString()).to.equal('this is a shared-project-1 test');
	})
});
