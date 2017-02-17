import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import path from 'path';
import compileBrowserTestsOperation from '../../src/browserScenario/compileBrowserTestsOperation';
import browserTestCompiler from '../../src/browserScenario/browserTestCompiler';
import fs from 'fs-extra';

describe('compileBrowserTestsOperation', () => {

	const operation = compileBrowserTestsOperation.create();

	describe('create', () => {

		it('returns an object', () => {
			expect(operation).not.equal(undefined);
			expect(typeof operation).equal('object');
		});

		it('sets the operation\'s id', () => {
			expect(operation.id).equal('compile-browser-tests');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Compiling tests for browser');
		});
	});

	describe('perform', () => {

		let project;
		let buildBrowserTestFolder;
		beforeEach(() => {
			project = {
				id: 'project-1',
				testsFolder: 'test-data/buildLifecycle/browserCompiler/test',
				buildTestFolder: 'build/test',
				dependencies: ['dep1', 'dep2'],
				devDependencies: ['devdep1', 'devdep2']
			};
			buildBrowserTestFolder = path.join(project.buildTestFolder, 'browser');
		});

		const mockCompilerResult = Promise.resolve();

		let sandbox;
		let compileStub;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			compileStub = {
				compile: sandbox.stub().returns(mockCompilerResult)
			};
			sandbox.stub(browserTestCompiler, 'create').returns(compileStub);

		});
		afterEach(() => {
			sandbox.restore()
		});

		it('requires id', () => {
			delete project.id;
			expect(() => operation.perform(project)).throw('id must be defined');
		});

		it('requires testsFolder', () => {
			delete project.testsFolder;
			expect(() => operation.perform(project)).throw('testsFolder must be defined');
		});

		it('requires buildTestFolder', () => {
			delete project.buildTestFolder;
			expect(() => operation.perform(project)).throw('buildTestFolder must be defined');
		});

		it('requires dependencies', () => {
			delete project.dependencies;
			expect(() => operation.perform(project)).throw('dependencies must be defined');
		});

		it('requires devDependencies', () => {
			delete project.devDependencies;
			expect(() => operation.perform(project)).throw('devDependencies must be defined');
		});

		it('returns compiler result', () => {
			expect(operation.perform(project)).eql(mockCompilerResult);
		});

		it('logs a warning if there are no tests', () => {
			sandbox.stub(fs, 'existsSync').returns(false);
			const warnStub = sandbox.stub();
			const logger = {
				warn: warnStub
			};
			return operation.perform(project, logger)
				.then(() => {
					sinon.assert.notCalled(compileStub.compile);
					sinon.assert.calledWith(warnStub, 'Project project-1 has no tests');
				});
		});

		it('compiles', () => {
			const promise = operation.perform(project);
			sinon.assert.calledOnce(compileStub.compile);
			sinon.assert.calledWith(compileStub.compile, {
				projectId: 'project-1',
				testsFolder: 'test-data/buildLifecycle/browserCompiler/test',
				outputFolder: 'build/test/browser',
				dependencies: ['dep1', 'dep2', 'devdep1', 'devdep2']
			});
			return promise;
		});
	});
});