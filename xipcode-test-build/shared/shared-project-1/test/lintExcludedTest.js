import { expect } from 'chai';
import lintExcluded from '../src/lintExcluded';

describe('lintExcluded', () => {

	it('returns a test string', () => {
		expect(lintExcluded.getString()).to.equal('this is a shared-project-1 test');
	})
});
