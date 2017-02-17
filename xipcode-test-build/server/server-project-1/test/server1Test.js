import { describe, it } from 'mocha';
import { expect } from 'chai';
import server1 from '../src/server1';

describe('server1', () => {

	it('returns a test string', () => {
		expect(server1.getString()).to.equal('this is a test');
	})
});
