import { expect } from 'chai';
import { describe, it } from 'mocha';
import phase from '../../src/model/phase';

describe('phase', () => {

	const phase1 = phase.create({
		id: 'id-1'
	});

	describe('create', () => {

		it('requires id', () => {
			expect(() => phase.create({})).throw('id must be defined');
		});

		it('creates', () => {
			expect(phase1.id).equal('id-1');
		});
	});

});