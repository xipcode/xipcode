import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import createProductFileOperation from '../../src/productScenario/createProductFileOperation';
import browserDependencyConcatenator from '../../src/core/browserDependencyConcatenator';
import polyfillDescriptor from '../../src/browserScenario/polyfillDescriptor';
import sinon from 'sinon';
import path from 'path';

describe('createProductFileOperation', () => {

	const operation = createProductFileOperation.create(polyfillDescriptor);

	describe('create', () => {

		it('requires polyfill', () => {
			expect(() => createProductFileOperation.create()).throw('polyfill must be defined');
		});

		it('returns an object', () => {
			expect(operation).not.equal(undefined);
			expect(typeof operation).equal('object');
		});

		it('sets the operation\'s id', () => {
			expect(operation.id).equal('create-product-file');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Creating product file');
		});
	});

	describe('perform', () => {

		const codebaseRoot = 'path/to/codebase';
		const nodeModulesFolder = path.join(codebaseRoot, 'node_modules');
		const browserLibsFolder = path.join(codebaseRoot, 'build', 'browser-libs');

		let sandbox;
		let project;
		let concatStub;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			project = {
				id: 'project-1',
				codebaseRoot,
				nodeModulesFolder,
				browserLibsFolder,
				buildFolder: 'build',
				dependencies: ['dep1', 'dep2'],
				devDependencies: ['dev1', 'dev2']
			};
			concatStub = sandbox.stub();
			sandbox.stub(browserDependencyConcatenator, 'create').returns({ concat: concatStub});
		});
		afterEach(() => {
			sandbox.restore()
		});

		it('requires id', () => {
			delete project.id;
			expect(() => operation.perform(project)).throw('id must be defined');
		});

		it('requires buildFolder', () => {
			delete project.buildFolder;
			expect(() => operation.perform(project)).throw('buildFolder must be defined');
		});

		it('requires codebaseRoot', () => {
			delete project.codebaseRoot;
			expect(() => operation.perform(project)).throw('codebaseRoot must be defined');
		});

		it('requires nodeModulesFolder', () => {
			delete project.nodeModulesFolder;
			expect(() => operation.perform(project)).throw('nodeModulesFolder must be defined');
		});

		it('requires browserLibsFolder', () => {
			delete project.browserLibsFolder;
			expect(() => operation.perform(project)).throw('browserLibsFolder must be defined');
		});

		it('requires dependencies', () => {
			delete project.dependencies;
			expect(() => operation.perform(project)).throw('dependencies must be defined');
		});

		it('requires devDependencies', () => {
			delete project.devDependencies;
			expect(() => operation.perform(project)).throw('devDependencies must be defined');
		});

		it('calls concatenator', () => {
			operation.perform(project);
			sinon.assert.calledWith(concatStub, sinon.match({
				codebaseRoot,
				nodeModulesFolder,
				browserLibsFolder,
				dependencies: project.dependencies,
				devDependencies: project.devDependencies,
				targetFolder: project.buildFolder,
				fileName: 'project-1.js'
			}));
		});

		it('returns concat result', () => {
			const promiseStub = {};
			concatStub.returns(promiseStub);
			const result = operation.perform(project);
			expect(result).equals(promiseStub);
		});
	});
});