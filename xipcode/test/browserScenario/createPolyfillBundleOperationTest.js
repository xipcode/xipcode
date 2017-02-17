import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import createPolyfillBundleOperation from '../../src/browserScenario/createPolyfillBundleOperation';
import sinon from 'sinon';
import fs from 'fs-extra';

describe('createPolyfillBundleOperation', () => {

	const polyfill = {
		moduleName: 'babel-polyfill',
		file: 'browser.js'
	};

	const operation = createPolyfillBundleOperation.create(polyfill);

	describe('create', () => {

		it('requires polyfill', () => {
			expect(() => createPolyfillBundleOperation.create()).throw('polyfill must be defined');
		});

		it('returns an object', () => {
			expect(operation).not.equal(undefined);
			expect(typeof operation).equal('object');
		});

		it('sets the operation\'s id', () => {
			expect(operation.id).equal('create-polyfill-bundle');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Creating polyfill bundle');
		});
	});

	describe('perform', () => {

		let sandbox;
		let project;
		let copyStub;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			project = {
				nodeModulesFolder: 'path/to/node_modules',
				browserLibsFolder: 'path/to/browser-libs'
			};
			copyStub = sandbox.stub(fs, 'copy');
		});
		afterEach(() => {
			sandbox.restore()
		});

		it('requires nodeModulesFolder', () => {
			delete project.nodeModulesFolder;
			expect(() => operation.perform(project)).throw('nodeModulesFolder must be defined');
		});

		it('requires browserLibsFolder', () => {
			delete project.browserLibsFolder;
			expect(() => operation.perform(project)).throw('browserLibsFolder must be defined');
		});

		it('returns a promise', () => {
			copyStub.callsArg(2);
			const promise = operation.perform(project);
			expect(promise instanceof Promise).equals(true);
			return promise;
		});

		it('copies the bundles', () => {
			copyStub.callsArg(2);
			return operation.perform(project)
				.then(() => {
					sinon.assert.calledWith(copyStub, 'path/to/node_modules/babel-polyfill/browser.js', 'path/to/browser-libs/babel-polyfill.bundle.js');
				});
		});

		it('handles errors', () => {
			const errorMessage = 'error message';
			copyStub.callsArgWith(2, errorMessage);
			return operation.perform(project)
				.then(() => {
					throw new Error('Expected an error to be thrown');
				})
				.catch((error) => {
					expect(error).equals(errorMessage);
				});
		});
	});
});