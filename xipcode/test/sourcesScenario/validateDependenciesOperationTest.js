import { expect } from 'chai';
import { describe, it } from 'mocha';
import validateDependenciesOperation from '../../src/sourcesScenario/validateDependenciesOperation';
import sinon from 'sinon';
import fs from 'fs-extra';
import path from 'path';
import nodeCore from '../../src/core/nodeCore';

describe('validateDependenciesOperation', () => {

	const operation = validateDependenciesOperation.create();

	describe('create', () => {

		it('returns an object', () => {
			expect(typeof operation).equal('object');
		});

		it('sets the operation\'s id', () => {
			expect(operation.id).equal('validate-dependencies');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Validating dependencies');
		});

	});

	describe('perform', () => {

		let project;
		let sandbox;
		beforeEach(() => {
			project = {
				dependencies: ['dep1', 'dep2'],
				devDependencies: ['devDep1', 'devDep2'],
				nodeModulesFolder: 'path/to/node/mdoules',
				codebaseRoot: 'path/to/codebase/root'
			};
			sandbox = sinon.sandbox.create();
		});
		afterEach(() => {
			sandbox.restore();
		});

		function getDependencyPath(dependencyName) {
			return path.join(project.nodeModulesFolder, dependencyName);
		}

		function configureFsStub(fsStub, args) {
			fsStub.withArgs(args).returns(true);
		}

		it('requires dependencies', () => {
			delete project.dependencies;
			expect(() => operation.perform(project)).throw('dependencies must be defined');
		});

		it('requires devDependencies', () => {
			delete project.devDependencies;
			expect(() => operation.perform(project)).throw('devDependencies must be defined');
		});

		it('requires nodeModulesFolder', () => {
			delete project.nodeModulesFolder;
			expect(() => operation.perform(project)).throw('nodeModulesFolder must be defined');
		});

		it('requires codebaseRoot', () => {
			delete project.codebaseRoot;
			expect(() => operation.perform(project)).throw('codebaseRoot must be defined');
		});

		it('returns a promise', () => {
			const fsStub = sandbox.stub(fs, 'existsSync');
			const folders = {
				dep1Folder: getDependencyPath('dep1'),
				dep2Folder: getDependencyPath('dep2'),
				devDep1Folder: getDependencyPath('devDep1'),
				devDep2Folder: getDependencyPath('devDep2')
			};
			configureFsStub(fsStub, folders.dep1Folder);
			configureFsStub(fsStub, folders.dep2Folder);
			configureFsStub(fsStub, folders.devDep1Folder);
			configureFsStub(fsStub, folders.devDep2Folder);
			const promise = operation.perform(project);
			expect(promise instanceof Promise).equal(true);
			return promise;
		});

		it('throws an error if a dependency cannot be found', () => {
			expect(() => operation.perform(project)).to.throw('Dependency [dep1] is not installed.');
		});

		it('throws an error if a devDependency cannot be found', () => {
			const fsStub = sandbox.stub(fs, 'existsSync');
			const folders = {
				dep1Folder: getDependencyPath('dep1'),
				dep2Folder: getDependencyPath('dep2')
			};
			configureFsStub(fsStub, folders.dep1Folder);
			configureFsStub(fsStub, folders.dep2Folder);
			expect(() => operation.perform(project)).to.throw('Dependency [devDep1] is not installed.');
		});

		it('does not throw an error if a dependency is a core node module', () => {
			sandbox.stub(fs, 'existsSync').returns(false);
			sandbox.stub(nodeCore, 'isCoreModule').returns(true);
			expect(() => operation.perform(project)).not.to.throw();
		});
	});
});
