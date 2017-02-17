import { expect } from 'chai';
import { describe, it } from 'mocha';
import topologicalSorter from '../../src/core/topologicalSorter'

describe('topologicalSorter', () => {

	describe('sort', () => {

		it('requires graphMap', () => {
			expect(() => topologicalSorter.sort()).throws('graphMap must be defined');
		});

		it('sorts an empty graph', () => {
			expect(topologicalSorter.sort({})).eql([]);
		});

		it('sorts one node graph', () => {
			expect(topologicalSorter.sort({node1: []})).eql(['node1']);
		});

		it('sorts two node graph', () => {
			const graph = {
				node1: [],
				node2: []
			};
			const expected = ['node1', 'node2'];
			expect(topologicalSorter.sort(graph)).eql(expected);
		});

		it('sorts nodes with no dependencies', () => {
			const graph = {
				node1: [],
				node2: [],
				node3: []
			};
			const expected = ['node1', 'node2', 'node3'];
			expect(topologicalSorter.sort(graph)).eql(expected);
		});

		it('sorts nodes with one dependency', () => {
			const graph = {
				node1: ['node3'],
				node2: ['node3'],
				node3: []
			};
			const expected = ['node3', 'node1', 'node2'];
			expect(topologicalSorter.sort(graph)).eql(expected);
		});

		it('sorts nodes with several dependencies', () => {
			const graph = {
				node1: ['node2', 'node3', 'node4', 'node5'],
				node2: ['node4', 'node5'],
				node3: [],
				node4: ['node5'],
				node5: ['node3']
			};
			const expected = ['node3', 'node5', 'node4', 'node2', 'node1'];
			expect(topologicalSorter.sort(graph)).eql(expected);
		});

		it('ignores duplicate references', () => {
			const graph = {
				node1: ['node2', 'node2'],
				node2: []
			};
			const expected = ['node2', 'node1'];
			expect(topologicalSorter.sort(graph)).eql(expected);
		});

		it('rejects node that reference non-existent node', () => {
			const graph = {
				node1: ['node2']
			};
			expect(() => topologicalSorter.sort(graph)).throws('\'node1\' references \'node2\', which could not be found');
		});

		it('rejects node that depends on self', () => {
			const graph = {
				node1: ['node1']
			};
			expect(() => topologicalSorter.sort(graph)).throws('Cycle detected in graph at node1');
		});

		it('rejects cycle in graph', () => {
			const graph = {
				node1: ['node2'],
				node2: ['node3'],
				node3: ['node4'],
				node4: ['node2']
			};
			expect(() => topologicalSorter.sort(graph)).throws('Cycle detected in graph at node2');
		});
	});
});