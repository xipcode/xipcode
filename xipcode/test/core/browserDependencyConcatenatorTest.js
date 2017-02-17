import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import browserDependencyConcatenator from '../../src/core/browserDependencyConcatenator';
import browserBundleLocator from '../../src/core/browserBundleLocator';
import polyfillDescriptor from '../../src/browserScenario/polyfillDescriptor';
import sinon from 'sinon';
import gulp from 'gulp';
import mockStream from '../core/mockStream';
import npm from '../../src/core/npm';
import fs from 'fs-extra';
import path from 'path';

describe('browserDependencyConcatenator', () => {

	const concatenator = browserDependencyConcatenator.create();

	describe('concat', () => {

		const codebaseRoot = 'path/to/codebase';
		const nodeModulesFolder = path.join(codebaseRoot, 'node_modules');
		const browserLibsFolder = path.join(codebaseRoot, 'build', 'browser-libs');
		const stream = mockStream.create();

		let sandbox;
		let opts;
		let getTransitiveDependenciesStub;
		let existsSyncStub;
		let gulpSrcStub;
		let bundleLocatorStub;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			opts = {
				polyfill: polyfillDescriptor,
				codebaseRoot,
				nodeModulesFolder,
				browserLibsFolder,
				dependencies: ['dep1', 'dep2'],
				devDependencies: ['dev1', 'dev2'],
				targetFolder: 'target/folder',
				fileName: 'fileName'
			};
			getTransitiveDependenciesStub = sandbox.stub(npm, 'getTransitiveDependencies');
			existsSyncStub = sandbox.stub(fs, 'existsSync');
			gulpSrcStub = sandbox.stub(gulp, 'src').returns(stream);
			bundleLocatorStub = sandbox.stub();
			sandbox.stub(browserBundleLocator, 'create').returns({ locate: bundleLocatorStub});
		});
		afterEach(() => {
			sandbox.restore()
		});

		it('requires polyfill', () => {
			delete opts.polyfill;
			expect(() => concatenator.concat(opts)).throw('polyfill must be defined');
		});

		it('requires codebaseRoot', () => {
			delete opts.codebaseRoot;
			expect(() => concatenator.concat(opts)).throw('codebaseRoot must be defined');
		});

		it('requires nodeModulesFolder', () => {
			delete opts.nodeModulesFolder;
			expect(() => concatenator.concat(opts)).throw('nodeModulesFolder must be defined');
		});

		it('requires browserLibsFolder', () => {
			delete opts.browserLibsFolder;
			expect(() => concatenator.concat(opts)).throw('browserLibsFolder must be defined');
		});

		it('requires dependencies', () => {
			delete opts.dependencies;
			expect(() => concatenator.concat(opts)).throw('dependencies must be defined');
		});

		it('requires devDependencies', () => {
			delete opts.devDependencies;
			expect(() => concatenator.concat(opts)).throw('devDependencies must be defined');
		});

		it('requires targetFolder', () => {
			delete opts.targetFolder;
			expect(() => concatenator.concat(opts)).throw('targetFolder must be defined');
		});

		it('requires fileName', () => {
			delete opts.fileName;
			expect(() => concatenator.concat(opts)).throw('fileName must be defined');
		});

		it('returns a promise', () => {
			opts.dependencies = [];
			opts.devDependencies = [];
			getTransitiveDependenciesStub.withArgs(nodeModulesFolder, [polyfillDescriptor.moduleName]).returns([]);
			bundleLocatorStub.withArgs([]).returns([]);
			const promise = concatenator.concat(opts);
			expect(promise instanceof Promise).equals(true);
			return promise;
		});

		it('concats nothing when there are no dependencies', () => {
			opts.dependencies = [];
			opts.devDependencies = [];
			getTransitiveDependenciesStub.withArgs(nodeModulesFolder, [polyfillDescriptor.moduleName]).returns([]);
			bundleLocatorStub.withArgs([]).returns([]);
			concatenator.concat(opts);
			sinon.assert.calledWith(gulpSrcStub, []);
		});

		it('concats project dependencies', () => {
			opts.dependencies = ['dep1'];
			opts.devDependencies = [];
			getTransitiveDependenciesStub.withArgs(nodeModulesFolder, [polyfillDescriptor.moduleName, 'dep1']).returns(['dep1', 'dep2']);
			const dep1Path = path.join(nodeModulesFolder, 'dep1', 'dep1.bundle.js');
			const dep2Path = path.join(nodeModulesFolder, 'dep2', 'dep2.bundle.js');
			bundleLocatorStub.withArgs(['dep1', 'dep2']).returns([dep1Path, dep2Path]);
			concatenator.concat(opts);
			sinon.assert.calledWith(gulpSrcStub, [dep1Path, dep2Path]);
		});
	});
});