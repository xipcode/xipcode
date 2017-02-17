import { expect } from 'chai';
import buildProfile from '../../src/model/buildProfile'

describe('buildProfile', () => {

	it('defines constants', () => {
		expect(buildProfile.SERVER).equals('server');
		expect(buildProfile.LOCAL).equals('local');
	});

	describe('validate', () => {

		it('validates', () => {
			expect(() => buildProfile.validate(buildProfile.SERVER)).not.to.throw();
			expect(() => buildProfile.validate(buildProfile.LOCAL)).not.to.throw();
			expect(() => buildProfile.validate('invalid')).throw('\'invalid\' is not a valid profile. A profile must be one of [server,local]');
		});
	});
});