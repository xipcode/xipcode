import { expect } from 'chai';
import { describe, it } from 'mocha';
import lifecycle from '../../src/model/lifecycle';
import scenario from '../../src/model/scenario';
import phase from '../../src/model/phase';

describe('lifecycle', () => {

	const phase1 = phase.create({
		id: 'phase-1'
	});

	const phase2 = phase.create({
		id: 'phase-2'
	});

	const phase3 = phase.create({
		id: 'phase-3'
	});

	const scenario1 = scenario.create({
		id: 'scenario-1',
		operationsByPhaseId: {}
	});

	const lifecycle1 = lifecycle.create({
		id: 'id-1',
		phases: [
			phase1,
			phase2,
			phase3
		],
		scenarios: [
			scenario1
		],
		initialize: () => {}
	});

	describe('create', () => {

		it('requires id', () => {
			expect(() => lifecycle.create({})).throw('id must be defined');
		});

		it('requires phases', () => {
			const testLifecycle = {
				id: 'id'
			};
			expect(() => lifecycle.create(testLifecycle)).throw('phases must be defined');
		});

		it('requires non-empty phases', () => {
			const testLifecycle = {
				id: 'id',
				phases: []
			};
			expect(() => lifecycle.create(testLifecycle)).throw('phases must not be empty');
		});

		it('requires non-empty scenarios', () => {
			const testLifecycle = {
				id: 'id',
				phases: [{}]
			};
			expect(() => lifecycle.create(testLifecycle)).throw('scenarios must be defined');
		});

		it('requires initialize', () => {
			const testLifecycle = {
				id: 'id',
				phases: [{}],
				scenarios: []
			};
			expect(() => lifecycle.create(testLifecycle)).throw('initialize must be defined');
		});

		it('creates', () => {
			expect(lifecycle1.id).equal('id-1');
			expect(lifecycle1.phases).eql([phase1, phase2, phase3]);
			expect(lifecycle1.scenarios).to.be.an.array;
			expect(lifecycle1.scenarios.length).equal(1);
			expect(lifecycle1.scenarios[0]).eql(scenario1);
			expect(typeof(lifecycle1.initialize)).equal('function');
		});

		it('validates scenarios must have valid references to phases', () => {
			const scenario1 = scenario.create({
				id: 'scenario-1',
				operationsByPhaseId: {
					'phase-1': [{}],
					'phase-99': [{}]
				}
			});
			const lifecycle1 = {
				id: 'id-1',
				phases: [
					phase1,
					phase2
				],
				scenarios: [
					scenario1
				],
				initialize: () => {}
			};
			expect(() => lifecycle.create(lifecycle1)).throw('Scenario scenario-1 references non-existent phase: phase-99');
		});

		it('creates scenario registry', () => {
			expect(lifecycle1.scenarios.get('scenario-1')).eql(scenario1);
			let transitiveRequires = lifecycle1.scenarios.getTransitiveRequires('scenario-1');
			expect(transitiveRequires).eql(['scenario-1']);

		});
	});

	describe('getPhasePath', () => {

		it('requires a phaseId', () => {
			expect(() => lifecycle1.getPhasePath(undefined)).throw('phaseId must be defined');
		});

		it('rejects a non-existent phaseId', () => {
			const expected = 'Lifecycle id-1 does not have a phase with id invalid-phase-id.  Valid phases are: phase-1, phase-2, phase-3';
			expect(() => lifecycle1.getPhasePath('invalid-phase-id')).throw(expected);
		});

		it('returns a single item array for the first phase', () => {
			expect(lifecycle1.getPhasePath('phase-1')).eql(['phase-1']);
		});

		it('returns all phases for the last phase', () => {
			expect(lifecycle1.getPhasePath('phase-3')).eql(['phase-1', 'phase-2', 'phase-3']);
		});

		it('returns part of the list of phases', () => {
			expect(lifecycle1.getPhasePath('phase-2')).eql(['phase-1', 'phase-2']);
		});
	});
});