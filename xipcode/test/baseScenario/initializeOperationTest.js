import { expect } from 'chai';
import { describe, it } from 'mocha';
import initializeOperation from '../../src/baseScenario/initializeOperation';
import sinon from 'sinon';
import fs from 'fs-extra';

describe('initializeOperation', () => {

	const operation = initializeOperation.create();

	describe('create', () => {

		it('returns an object', () => {
			expect(typeof operation).equal('object');
		});

		it('sets the operation\'s id', () => {
			expect(operation.id).equal('initialize');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Initializing project');
		});
	});

	describe('perform', () => {

		let sandbox;
		let chdirStub;
		let mkdirsSync;
		let project;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			chdirStub = sandbox.stub(process, 'chdir');
			mkdirsSync = sandbox.stub(fs, 'mkdirsSync');
			project = {
				rootFolder: '.',
				buildFolder: 'build'
			};
		});
		afterEach(() => {
			sandbox.restore()
		});

		it('requires rootFolder', () => {
			delete project.rootFolder;
			expect(() => operation.perform(project)).throw('rootFolder must be defined');
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

		it('changes current working directory', () => {
			operation.perform(project);
			sinon.assert.calledWith(chdirStub, project.rootFolder);
		});

		it('makes the buildFolder', () => {
			operation.perform(project);
			sinon.assert.calledWith(mkdirsSync, project.buildFolder);
		});
	});
});