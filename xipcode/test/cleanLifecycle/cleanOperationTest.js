import { expect } from 'chai';
import { describe, it } from 'mocha';
import cleanOperation from '../../src/cleanLifecycle/cleanOperation';
import sinon from 'sinon';
import fs from 'fs-extra';

describe('cleanOperation', () => {

	const operation = cleanOperation.create();

	describe('create', () => {

		it('returns an object', () => {
			expect(typeof operation).equal('object');
		});

		it('sets the operation\'s id', () => {
			expect(operation.id).equal('clean');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Cleaning project');
		});
	});

	describe('perform', () => {

		let sandbox;
		let removeStub;
		let project;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			removeStub = sandbox.stub(fs, 'removeSync');
			project = {
				rootFolder: 'project-root',
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

		it('cleans', () => {
			const promise = operation.perform(project);
			sinon.assert.calledOnce(removeStub);
			sinon.assert.calledWith(removeStub, 'project-root/build');
			return promise;
		});
	});
});