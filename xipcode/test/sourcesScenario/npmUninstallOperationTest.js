import { expect } from 'chai';
import { describe, it } from 'mocha';
import npmInstallOperation from '../../src/sourcesScenario/npmUninstallOperation';
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
			expect(operation.id).equal('npm-uninstall');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Uninstalling npm package');
		});
	});

	describe('perform', () => {

		let project;
		beforeEach(() => {
			project = {
				codebaseRoot: 'path/to/root',
				id: 'project1'
			};
		});

		let sandbox;
		let npmUninstallStub;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			npmUninstallStub = sandbox.stub(npm, 'uninstall').returns(Promise.resolve());
		});
		afterEach(() => {
			sandbox.restore()
		});

		it('requires codebaseRoot', () => {
			delete project.codebaseRoot;
			expect(() => operation.perform(project)).throw('codebaseRoot must be defined');
		});

		it('requires id', () => {
			delete project.id;
			expect(() => operation.perform(project)).throw('id must be defined');
		});

		it('returns a promise', () => {
			const promise = operation.perform(project);
			expect(promise instanceof Promise).equal(true);
			return promise;
		});

		it('executes npm uninstall', () => {
			return operation.perform(project).then(() => {
				sinon.assert.calledWith(npmUninstallStub, 'path/to/root', 'project1');
			});
		});
	});
});
