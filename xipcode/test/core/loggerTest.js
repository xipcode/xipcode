import {expect} from 'chai';
import {describe, it} from 'mocha';
import logger from '../../src/core/logger.js';
import sinon from 'sinon';

describe('logger', () => {

	describe('log', () => {

		it('prints a message to stdout', () => {
			const spy = sinon.spy(console, 'log');
			logger.log('This is a test message');
			expect(spy.calledOnce).to.equal(true);
			expect(spy.calledWith('This is a test message')).to.equal(true);
		});
	});

	describe('warn', () => {

		it('prints a warning to stdout', () => {
			const spy = sinon.spy(console, 'warn');
			logger.warn('This is a test warning');
			expect(spy.calledOnce).to.equal(true);
			expect(spy.calledWith('This is a test warning')).to.equal(true);
		});
	});
});
