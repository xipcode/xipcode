import { expect } from 'chai';
import sinon from 'sinon';
import rewriteBrowserOnlyMainOperation from '../../src/browserScenario/rewriteBrowserOnlyMainOperation';
import fs from 'fs-extra';

describe('rewriteBrowserOnlyMainOperation', () => {

	const operation = rewriteBrowserOnlyMainOperation.create();

	describe('create', () => {

		it('returns an object', () => {
			expect(operation).not.equal(undefined);
			expect(typeof operation).equal('object');
		});

		it('sets the operation\'s id', () => {
			expect(operation.id).equal('rewrite-browser-only-main');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Rewriting package.json main');
		});
	});

	describe('perform', () => {

		let sandbox;
		let project;
		let readJsonStub;
		let writeJsonStub;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			project = {
				id: 'project-1',
				scenarioIds: ['node, browser'],
				buildReleaseFolder: 'path/to/build/release/folder'
			};
			readJsonStub = sandbox.stub(fs, 'readJsonSync').returns({
				main: 'src/module.js'
			});
			writeJsonStub = sandbox.stub(fs, 'writeJsonSync');
		});
		afterEach(() => {
			sandbox.restore()
		});

		it('requires id', () => {
			delete project.id;
			expect(() => operation.perform(project)).throw('id must be defined');
		});

		it('requires scenarioIds', () => {
			delete project.id;
			expect(() => operation.perform(project)).throw('id must be defined');
		});

		it('requires buildReleaseFolder', () => {
			delete project.id;
			expect(() => operation.perform(project)).throw('id must be defined');
		});

		it('does nothing if the node scenario is specified', () => {
			operation.perform(project).then(() => {
				sinon.assert.notCalled(readJsonStub);
			});
		});

		it('rewrites the main entry if only the browser scenario is specified', () => {
			project.scenarios = ['browser'];
			operation.perform(project).then(() => {
				const packageJsonFile = 'path/to/build/release/folder/package.json';
				sinon.assert.calledWith(readJsonStub, packageJsonFile);
				sinon.assert.calledWith(writeJsonStub, packageJsonFile, {
					main: 'project-1.bundle.js'
				});
			});
		});
	});
});