import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import compileBrowserLibrariesOperation from '../../src/browserScenario/compileBrowserLibrariesOperation';
import browserLibraryCompiler from '../../src/browserScenario/browserLibraryCompiler';
import sinon from 'sinon';
import npm from '../../src/core/npm';
import fs from 'fs-extra';
import files from '../../src/core/files';
import path from 'path';

describe('compileBrowserLibrariesOperation', () => {

	const operation = compileBrowserLibrariesOperation.create();

	describe('create', () => {

		it('returns an object', () => {
			expect(operation).not.equal(undefined);
			expect(typeof operation).equal('object');
		});

		it('sets the operation\'s id', () => {
			expect(operation.id).equal('compile-browser-libraries');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Compiling browser libraries');
		});
	});

	describe('perform', () => {

		const codebaseRoot = 'path/to/codebase';
		const nodeModulesFolder = path.join(codebaseRoot, 'node_modules');
		const browserLibsFolder = path.join(codebaseRoot, 'build', 'browser-libs');

		let sandbox;
		let project;
		let getTransitiveDependenciesStub;
		let compilerStub;
		let existsSyncStub;
		let isFileNewerStub;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			project = {
				codebaseRoot: codebaseRoot,
				dependencies: ['dep1', 'dep2'],
				devDependencies: ['dev1, dev2']
			};
			getTransitiveDependenciesStub = sandbox.stub(npm, 'getTransitiveDependencies');
			compilerStub = {
				compile: sandbox.stub().returns(Promise.resolve())
			};
			sandbox.stub(browserLibraryCompiler, 'create').returns(compilerStub);
			existsSyncStub = sandbox.stub(fs, 'existsSync');
			isFileNewerStub = sandbox.stub(files, 'isFileNewer');
		});
		afterEach(() => {
			sandbox.restore()
		});

		function stubLibraryModule(moduleName, isCompiled, isOutOfDate) {
			const moduleFolder = path.join(nodeModulesFolder, moduleName);
			const projectJsonFile = path.join(moduleFolder, 'project.json');
			const bundleFile = path.join(browserLibsFolder, `${moduleName}.bundle.js`);
			existsSyncStub.withArgs(moduleFolder).returns(true);
			existsSyncStub.withArgs(projectJsonFile).returns(false);
			existsSyncStub.withArgs(bundleFile).returns(isCompiled);
			isFileNewerStub.withArgs(moduleFolder, bundleFile).returns(isOutOfDate);
		}

		function stubCompiledLibraryModule(moduleName) {
			stubLibraryModule(moduleName, true, false);
		}

		function stubUncompiledLibraryModule(moduleName) {
			stubLibraryModule(moduleName, false, false);
		}

		function stubOutOfDateLibraryModule(moduleName) {
			stubLibraryModule(moduleName, true, true);
		}

		function stubProjectModule(moduleName) {
			const moduleFolder = path.join(nodeModulesFolder, moduleName);
			const projectJsonFile = path.join(moduleFolder, 'project.json');
			existsSyncStub.withArgs(moduleFolder).returns(true);
			existsSyncStub.withArgs(projectJsonFile).returns(true);
		}

		function stubNonexistentModule(moduleName) {
			existsSyncStub.withArgs(path.join(nodeModulesFolder, moduleName)).returns(false);
		}

		function assertCompiled(moduleName) {
			sinon.assert.calledWith(compilerStub.compile, {
				outputFolder: browserLibsFolder,
				targetFileName: `${moduleName}.bundle.js`,
				require: moduleName,
				codebaseRoot: codebaseRoot
			});
		}

		it('requires codebaseRoot', () => {
			delete project.codebaseRoot;
			expect(() => operation.perform(project)).throw('codebaseRoot must be defined');
		});

		it('requires dependencies', () => {
			delete project.dependencies;
			expect(() => operation.perform(project)).throw('dependencies must be defined');
		});

		it('requires devDependencies', () => {
			delete project.devDependencies;
			expect(() => operation.perform(project)).throw('devDependencies must be defined');
		});

		it('does nothing when no dependencies specified', () => {
			getTransitiveDependenciesStub.returns([]);
			operation.perform(project);
			sinon.assert.notCalled(compilerStub.compile);
		});

		it('compiles libraries', () => {
			stubUncompiledLibraryModule('lib1');
			stubUncompiledLibraryModule('lib2');
			getTransitiveDependenciesStub.returns(['lib1', 'lib2']);
			operation.perform(project);
			sinon.assert.callCount(compilerStub.compile, 2);
			assertCompiled('lib1');
			assertCompiled('lib2');
		});

		it('compiles out of date libraries', () => {
			stubUncompiledLibraryModule('lib1');
			stubOutOfDateLibraryModule('lib2');
			getTransitiveDependenciesStub.returns(['lib1', 'lib2']);
			operation.perform(project);
			sinon.assert.callCount(compilerStub.compile, 2);
			assertCompiled('lib1');
			assertCompiled('lib2');
		});

		it('does not compile project modules', () => {
			stubProjectModule('lib1');
			stubUncompiledLibraryModule('lib2');
			getTransitiveDependenciesStub.returns(['lib1', 'lib2']);
			operation.perform(project);
			sinon.assert.callCount(compilerStub.compile, 1);
			assertCompiled('lib2');
		});

		it('does not compile already compiles libraries', () => {
			stubCompiledLibraryModule('lib1');
			stubCompiledLibraryModule('lib2');
			getTransitiveDependenciesStub.returns(['lib1', 'lib2']);
			operation.perform(project);
			sinon.assert.callCount(compilerStub.compile, 0);
		});

		it('rejects non-existent module', () => {
			stubNonexistentModule('lib1');
			getTransitiveDependenciesStub.returns(['lib1']);
			expect(() => operation.perform(project)).throws('Folder for module lib1 does not exist: path/to/codebase/node_modules/lib1');
		});
	});
});