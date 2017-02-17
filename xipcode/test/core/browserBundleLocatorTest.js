import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import browserBundleLocator from '../../src/core/browserBundleLocator';
import sinon from 'sinon';
import fs from 'fs-extra';
import path from 'path';

describe('browserBundleLocator', () => {

	describe('create', () => {

		it('requires nodeModulesFolder', () => {
			expect(() => browserBundleLocator.create(undefined, 'browserLibsFolder')).throw('nodeModulesFolder must be defined');
		});

		it('requires browserLibsFolder', () => {
			expect(() => browserBundleLocator.create('nodeModulesFolder', undefined)).throw('browserLibsFolder must be defined');
		});
	});

	describe('locate', () => {

		const codebaseRoot = 'path/to/codebase';
		const nodeModulesFolder = path.join(codebaseRoot, 'node_modules');
		const browserLibsFolder = path.join(codebaseRoot, 'build', 'browser-libs');
		const locator = browserBundleLocator.create(nodeModulesFolder, browserLibsFolder);

		let sandbox;
		let existsSyncStub;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			existsSyncStub = sandbox.stub(fs, 'existsSync');
		});
		afterEach(() => {
			sandbox.restore()
		});

		function stubLibraryModule(moduleName) {
			const moduleFolder = path.join(nodeModulesFolder, moduleName);
			const projectJsonFile = path.join(moduleFolder, 'project.json');
			const bundleFile = path.join(browserLibsFolder, `${moduleName}.bundle.js`);
			existsSyncStub.withArgs(moduleFolder).returns(true);
			existsSyncStub.withArgs(projectJsonFile).returns(false);
			existsSyncStub.withArgs(bundleFile).returns(true);
		}

		function stubProjectModule(moduleName) {
			const moduleFolder = path.join(nodeModulesFolder, moduleName);
			const projectJsonFile = path.join(moduleFolder, 'project.json');
			existsSyncStub.withArgs(moduleFolder).returns(true);
			existsSyncStub.withArgs(projectJsonFile).returns(true);
		}

		it('requires moduleNames', () => {
			expect(() => locator.locate()).throw('moduleNames must be defined');
		});

		it('returns nothing when there are no dependencies', () => {
			const files = locator.locate([]);
			expect(files.length).equal(0);
		});

		it('locates xipcode project dependencies', () => {
			stubProjectModule('dep1');
			stubProjectModule('dep2');
			const files = locator.locate(['dep1', 'dep2']);
			const dep1Path = path.join(nodeModulesFolder, 'dep1', 'dep1.bundle.js');
			const dep2Path = path.join(nodeModulesFolder, 'dep2', 'dep2.bundle.js');
			expect(files).eql([dep1Path, dep2Path]);
		});

		it('locates library dependencies', () => {
			stubLibraryModule('dep1');
			stubLibraryModule('dep2');
			const files = locator.locate(['dep1', 'dep2']);
			const dep1Path = path.join(browserLibsFolder, 'dep1.bundle.js');
			const dep2Path = path.join(browserLibsFolder, 'dep2.bundle.js');
			expect(files).eql([dep1Path, dep2Path]);
		});

		it('locates mixed dependencies', () => {
			stubProjectModule('dep1');
			stubLibraryModule('dep2');
			const files = locator.locate(['dep1', 'dep2']);
			const dep1Path = path.join(nodeModulesFolder, 'dep1', 'dep1.bundle.js');
			const dep2Path = path.join(browserLibsFolder, 'dep2.bundle.js');
			expect(files).eql([dep1Path, dep2Path]);
		});

		it('rejects missing bundle', () => {
			const expectedMessage = 'Could not find bundle for module dep1. Looked in locations: path/to/codebase/node_modules/dep1/dep1.bundle.js and path/to/codebase/build/browser-libs/dep1.bundle.js';
			expect(() => locator.locate(['dep1'])).throws(expectedMessage);
		});
	});
});