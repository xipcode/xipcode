import { expect } from 'chai';
import { describe, it } from 'mocha';
import packageOperation from '../../src/sourcesScenario/packageOperation';
import sinon from 'sinon';
import fs from 'fs-extra';

describe('packageOperation', () => {

	const operation = packageOperation.create();

	describe('create', () => {

		it('returns an object', () => {
			expect(operation).not.equal(undefined);
			expect(typeof operation).equal('object');
		});

		it('sets the operation\'s id', () => {
			expect(operation.id).equal('package');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Creating package');
		});
	});

	describe('perform', () => {

		let project;
		beforeEach(() => {
			project = {
				id: 'project1',
				version: '2.2.2',
				rootFolder: 'path/to/root',
				buildReleaseFolder: 'build/release',
				main: 'src/project1.js',
				dependencies: ['dep1', 'dep2']
			};
		});

		let sandbox;
		let copyStub;
		let writeJsonStub;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			copyStub = sandbox.stub(fs, 'copySync');
			writeJsonStub = sandbox.stub(fs, 'writeJsonSync');
		});
		afterEach(() => {
			sandbox.restore()
		});

		it('requires id', () => {
			delete project.id;
			expect(() => operation.perform(project)).throw('id must be defined');
		});

		it('requires main', () => {
			delete project.main;
			expect(() => operation.perform(project)).throw('main must be defined');
		});

		it('requires rootFolder', () => {
			delete project.rootFolder;
			expect(() => operation.perform(project)).throw('rootFolder must be defined');
		});

		it('requires buildReleaseFolder', () => {
			delete project.buildReleaseFolder;
			expect(() => operation.perform(project)).throw('buildReleaseFolder must be defined');
		});

		it('returns a promise', () => {
			const promise = operation.perform(project);
			expect(promise instanceof Promise).equal(true);
			return promise;
		});

		it('generates package.json', () => {
			return operation.perform(project).then(() => {
				const packageJson = {
					name: 'project1',
					version: '2.2.2',
					main: 'src/project1.js',
					dependencies: ['dep1', 'dep2']
				};
				sinon.assert.calledWith(writeJsonStub, 'build/release/package.json', packageJson);
			});
		});

		it('generates package.json with bin', () => {
			project.bin = 'src/cli.js';
			return operation.perform(project).then(() => {
				const packageJson = {
					name: 'project1',
					version: '2.2.2',
					main: 'src/project1.js',
					bin: 'src/cli.js',
					dependencies: ['dep1', 'dep2']
				};
				sinon.assert.calledWith(writeJsonStub, 'build/release/package.json', packageJson);
			});
		});

		it('copies project.json', () => {
			return operation.perform(project).then(() => {
				sinon.assert.calledWith(copyStub, 'path/to/root/project.json', 'build/release/project.json');
			});
		});
	});
});
