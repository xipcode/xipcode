import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import watcher from '../../src/execution/watcher'
import gulp from 'gulp';

describe('watcher', () => {

	describe('watch', () => {

		const projects = [
			{
				id: 'project-1',
				rootFolder: '/path/to/project-1',
				sourcesPattern: 'src/**',
				sourcesFolder: 'src',
				testsPattern: 'test/**',
				testsFolder: 'test'
			},
			{
				id: 'project-2',
				rootFolder: '/path/to/project-2',
				sourcesPattern: 'src/**',
				sourcesFolder: 'src',
				testsPattern: 'test/**',
				testsFolder: 'test'
			},
			{
				id: 'project-3',
				rootFolder: '/path/to/project-3',
				sourcesPattern: 'src/**',
				sourcesFolder: 'src',
				testsPattern: 'test/**',
				testsFolder: 'test'
			}
		];
		const filesToWatch = [
			'/path/to/project-1/src/**',
			'/path/to/project-1/test/**',
			'/path/to/project-2/src/**',
			'/path/to/project-2/test/**',
			'/path/to/project-3/src/**',
			'/path/to/project-3/test/**'
		];
		const lifecycle = {};
		const phases = ['compile', 'test'];

		let sandbox;
		let callback;
		let watchStub;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			callback = sandbox.stub().returns(Promise.resolve());
			watchStub = sandbox.stub(gulp, 'watch');
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('requires projects', () => {
			expect(() => watcher.watch(undefined, lifecycle, phases, callback)).throw('projects must be defined');
		});

		it('requires lifecycle', () => {
			expect(() => watcher.watch(projects, undefined, phases, callback)).throw('lifecycle must be defined');
		});

		it('requires targetPhaseIds', () => {
			expect(() => watcher.watch(projects, lifecycle, undefined, callback)).throw('targetPhaseIds must be defined');
		});

		it('requires callback', () => {
			expect(() => watcher.watch(projects, lifecycle, phases, undefined)).throw('callback must be defined');
		});

		it('watches', () => {
			watcher.watch(projects, lifecycle, phases, callback);
			sinon.assert.calledOnce(watchStub);
			sinon.assert.calledWith(watchStub, filesToWatch, sinon.match.typeOf('function'));
		});

		it('builds when a file changes', () => {
			const event = {
				path: '/path/to/project-1/src/file.jss'
			};
			watchStub.callsArgWith(1, event);
			watcher.watch(projects, lifecycle, phases, callback);
			sinon.assert.calledOnce(callback);
			sinon.assert.calledWith(callback, projects, lifecycle, phases);
		});

		it('builds only affected projects', () => {
			const event = {
				path: '/path/to/project-2/src/file.js'
			};
			const affectedProjects = [
				projects[1],
				projects[2]
			];
			watchStub.callsArgWith(1, event);
			watcher.watch(projects, lifecycle, phases, callback);
			sinon.assert.calledOnce(callback);
			sinon.assert.calledWith(callback, affectedProjects, lifecycle, phases);
		});

		it('throws error if watch notification does not belong to watched project', () => {
			const event = {
				path: '/path/to/unwatched/file.js'
			};
			watchStub.callsArgWith(1, event);
			const expectedError = 'Could not find project for changed file /path/to/unwatched/file.js';
			expect(() => watcher.watch(projects, lifecycle, phases, callback)).throw(expectedError);
		});
	});
});
