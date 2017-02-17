import { expect } from 'chai';
import { describe, it } from 'mocha';
import object from '../../src/core/object'

describe('object', () => {

	describe('getValueByKeyMatch', () => {

		it('returns the value of a matching key', () => {
			const obj = {
				alpha: 1,
				bravo: 2
			};
			const string = 'alp';
			const match = object.getValueByKeyMatch(obj, string);
			expect(match).to.equal(1);
		});

		it('returns the value of the first matching key', () => {
			const obj = {
				alpha: 1,
				alps: 2
			};
			const string = 'alp';
			const match = object.getValueByKeyMatch(obj, string);
			expect(match).to.equal(1);
		});

		it('returns undefined when there is no matching key', () => {
			const obj = {
				alpha: 1,
				bravo: 2
			};
			const string = 'abc';
			const match = object.getValueByKeyMatch(obj, string);
			expect(match).to.equal(undefined);
		});

		it('returns undefined when special characters are not escaped', () => {
			const obj = {
				__cov$$: 1
			};
			const string = '__cov$$';
			const match = object.getValueByKeyMatch(obj, string);
			expect(match).to.equal(undefined);
		});

		it('returns undefined when regex escape character is not escaped in the string', () => {
			const obj = {
				__cov$$: 1
			};
			const string = '__cov\$\$';
			const match = object.getValueByKeyMatch(obj, string);
			expect(match).to.equal(undefined);
		});

		it('returns match when special characters are properly escaped', () => {
			const obj = {
				__cov$$: 1
			};
			const string = '__cov\\$\\$';
			const match = object.getValueByKeyMatch(obj, string);
			expect(match).to.equal(1);
		});
	});
});