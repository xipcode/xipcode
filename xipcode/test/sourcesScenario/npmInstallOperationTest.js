import { expect } from 'chai';
import { describe, it } from 'mocha';
import npmInstallOperation from '../../src/sourcesScenario/npmInstallOperation';
import sinon from 'sinon';
import npm from '../../src/core/npm';

describe('npmInstallOperation', () => {

	const operation = npmInstallOperation.create();

	describe('create', () => {

		it('returns an object', () => {
			expect(operation).not.equal(undefined);
			expect(typeof operation).equal('object');
		});

		it('sets the operation\'s id', () => {
			expect(operation.id).equal('npm-install');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Installing npm package');
		});
	});

	describe('perform', () => {

		let project;
		beforeEach(() => {
			project = {
				codebaseRoot: 'path/to/codebase',
				rootFolder: 'path/to/project',
				buildReleaseFolder: 'build/release'
			};
		});

		let sandbox;
		let npmInstallStub;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			npmInstallStub = sandbox.stub(npm, 'install').returns(Promise.resolve());
		});
		afterEach(() => {
			sandbox.restore()
		});

		it('requires codebaseRoot', () => {
			delete project.codebaseRoot;
			expect(() => operation.perform(project)).throw('codebaseRoot must be defined');
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

		it('executes npm install', () => {
			return operation.perform(project).then(() => {
				sinon.assert.calledWith(npmInstallStub, 'path/to/codebase', 'path/to/project/build/release');
			});
		});
	});
});
