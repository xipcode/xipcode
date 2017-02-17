import { describe, it } from 'mocha';
import { expect } from 'chai';
import { LoadProjectError } from '../../src/errors/error';

describe('error', () => {

	describe('LoadProjectError', () => {

		const name = 'LoadProjectError';
		const message = 'something went wrong';
		const error = new LoadProjectError(message);

		it('is named correctly', () => {
			expect(error.name).to.equal(name);
		});

		it('has the correct message', () => {
			expect(error.message).to.equal(message);
		});

		it('is an instance of Error', () => {
			expect(error instanceof Error).to.be.true;
		});

		it('is an instance of LoadProjectError', () => {
			expect(error instanceof LoadProjectError).to.be.true;
		});

		it('toString contains message', () => {
			const expected = name + ': '+ message;
			expect(error.toString().indexOf(expected) >= 0).to.equal(true);
		});

		it('stack contains cause', () => {
			const originalError = new Error('this is the original error');
			const errorWithCause = new LoadProjectError(message, originalError);
			const expectedMessage = name + ': '+ message;
			const expectedCauseMessage = 'Cause: Error: this is the original error';
			expect(errorWithCause.stack.indexOf(expectedMessage) > -1).to.equal(true);
			expect(errorWithCause.stack.indexOf(expectedCauseMessage) > -1).to.equal(true);
			expect(errorWithCause.stack.indexOf('xipcode/test/errors/errorTest.js') > -1).to.equal(true);
		});
	});
});