import { expect } from 'chai';
import { describe, it } from 'mocha';
import compileNodeTestsOperation from '../../src/nodeScenario/compileNodeTestsOperation';
import sinon from 'sinon';
import nodeCompiler from '../../src/nodeScenario/nodeCompiler';
import path from 'path';
import fs from 'fs-extra';

describe('compileNodeTestsOperation', () => {

	const operation = compileNodeTestsOperation.create();

	describe('create', () => {

		it('returns an object', () => {
			expect(operation).not.equal(undefined);
			expect(typeof operation).equal('object');
		});

		it('sets the operation\'s id', () => {
			expect(operation.id).equal('compile-node-tests');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Compiling tests for node');
		});
	});

	describe('perform', () => {

		let project;
		let buildNodeTestFolder;
		beforeEach(() => {
			project = {
				id: 'project-1',
				testsFolder: 'test',
				buildTestFolder: 'build/test',
				sourcesPattern: 'src/**/*.js',
				testsPattern: 'test/**/*.js',
				buildFolder: 'build'
			};
			buildNodeTestFolder = path.join(project.buildTestFolder, 'node');
		});

		const mockCompilerResult = Promise.resolve();

		let sandbox;
		let compileStub;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			compileStub = {
				compile: sandbox.stub().returns(mockCompilerResult)
			};
			sandbox.stub(nodeCompiler, 'create').returns(compileStub);

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

		it('requires testsPattern', () => {
			delete project.testsPattern;
			expect(() => operation.perform(project)).throw('testsPattern must be defined');
		});

		it('requires sourcesPattern', () => {
			delete project.sourcesPattern;
			expect(() => operation.perform(project)).throw('sourcesPattern must be defined');
		});

		it('requires buildTestFolder', () => {
			delete project.buildTestFolder;
			expect(() => operation.perform(project)).throw('buildTestFolder must be defined');
		});

		it('requires buildFolder', () => {
			delete project.buildFolder;
			expect(() => operation.perform(project)).throw('buildFolder must be defined');
		});

		it('returns a promise', () => {
			const promise = operation.perform(project);
			expect(promise instanceof Promise).equal(true);
			return promise;
		});

		it('logs a warning if there are no tests', () => {
			sandbox.stub(fs, 'existsSync').withArgs(project.testsFolder).returns(false);
			const logger = {
				warn: sinon.stub()
			};
			const promise = operation.perform(project, logger);
			sinon.assert.calledOnce(logger.warn);
			sinon.assert.calledWith(logger.warn, 'Project project-1 has no tests');
			return promise;
		});

		it('compiles', () => {
			sandbox.stub(fs, 'existsSync').withArgs(project.testsFolder).returns(true);
			const promise = operation.perform(project);
			sinon.assert.calledTwice(compileStub.compile);
			sinon.assert.calledWith(compileStub.compile, {
				sourcesPattern: path.join(project.buildTestFolder, 'node', 'instrument', project.sourcesPattern),
				outputFolder: buildNodeTestFolder,
				srcBase: path.join(project.buildTestFolder, 'node', 'instrument')
			});
			sinon.assert.calledWith(compileStub.compile, {
				sourcesPattern: project.testsPattern,
				outputFolder: buildNodeTestFolder,
				srcBase: '.'
			});
			return promise;
		});
	});
});