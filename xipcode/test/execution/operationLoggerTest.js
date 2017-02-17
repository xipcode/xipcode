import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';
import logger from '../../src/core/logger';
import operationLogger from '../../src/execution/operationLogger';

describe('operationLogger', () => {

	let sandbox;

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('create', () => {

		it('requires count', () => {
			expect(() => operationLogger.create(undefined, 10, 'project-1')).throw('count must be defined');
		});

		it('requires total', () => {
			expect(() => operationLogger.create(1, undefined, 'project-1')).throw('total must be defined');
		});

		it('requires projectId', () => {
			expect(() => operationLogger.create(1, 10, undefined)).throw('projectId must be defined');
		});
	});

	describe('logger', () => {

		it('logs', () => {
			const testLogger = operationLogger.create(2, 10, 'project-1');
			const spy = sandbox.spy(logger, 'log');
			testLogger.log('test message)');
			sinon.assert.calledWith(spy, sinon.match('[2/10] [project-1] test message'));
		});

		it('warns', () => {
			const testLogger = operationLogger.create(5, 100, 'project-2');
			const spy = sandbox.spy(logger, 'warn');
			testLogger.warn('test message)');
			sinon.assert.calledWith(spy, sinon.match('[5/100] [project-2] test message'));
		});
	});
});