import { expect } from 'chai';
import client1 from '../src/client1';

describe('client1', () => {

	it('returns a test string', () => {
		expect(client1.getString()).to.equal('this is a shared-project-1 test');
	})
});
