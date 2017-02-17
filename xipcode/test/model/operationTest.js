import { expect } from 'chai';
import { describe, it } from 'mocha';
import operation from '../../src/model/operation';
import mockOperation from './mockOperation';

describe('operation', () => {

	describe('create', () => {

		it('requires id', () => {
			expect(() => operation.create({})).throw('id must be defined');
		});

		it('requires desc', () => {
			expect(() => operation.create({id: 'test-id'})).throw('logMessage must be defined');
		});

		it('requires perform to be overridden', () => {
			const baseOperation = operation.create({ id: 'operation-1', logMessage: 'Operation' });
			expect(() => baseOperation.perform()).throw('Instances must override method \'perform\'');
		});

		it('create', () => {
			const op = operation.create({ id: 'id-1', logMessage: 'Operation' });
			expect(op.id).equals('id-1');
		});
	});
});