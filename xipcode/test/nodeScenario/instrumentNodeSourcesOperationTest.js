import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import gulp from 'gulp';
import path from 'path';
import fs from 'fs-extra';
import mockStream from '../core/mockStream';
import instrumentNodeSourcesOperation from '../../src/nodeScenario/instrumentNodeSourcesOperation';

describe('instrumentNodeSourcesOperation', () => {

	const operation = instrumentNodeSourcesOperation.create();

	describe('create', () => {

		it('returns an object', () => {
			expect(operation).not.equal(undefined);
			expect(typeof operation).equal('object');
		});

		it('sets the operation\'s id', () => {
			expect(operation.id).equal('instrument-node-sources');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Instrumenting sources for node');
		});
	});

	describe('perform', () => {

		let project;
		beforeEach(() => {
			project = {
				testsFolder: 'test',
				buildFolder: 'build',
				buildTestFolder: 'build/test',
				sourcesPattern: 'src/**/*.js'
			};
		});

		const stream = mockStream.create();

		let sandbox;
		let gulpSrcStub;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			gulpSrcStub = sandbox.stub(gulp, 'src').returns(stream);

		});
		afterEach(() => {
			sandbox.restore()
		});

		it('requires testsFolder', () => {
			delete project.testsFolder;
			expect(() => operation.perform(project)).throw('testsFolder must be defined');
		});

		it('requires buildFolder', () => {
			delete project.buildFolder;
			expect(() => operation.perform(project)).throw('buildFolder must be defined');
		});

		it('requires buildTestFolder', () => {
			delete project.buildTestFolder;
			expect(() => operation.perform(project)).throw('buildTestFolder must be defined');
		});

		it('requires sourcesPattern', () => {
			delete project.sourcesPattern;
			expect(() => operation.perform(project)).throw('sourcesPattern must be defined');
		});

		it('returns a promise', () => {
			const promise = operation.perform(project);
			expect(promise instanceof Promise).equal(true);
			return promise;
		});

		it('skips instrumentation when no tests exist', () => {
			sandbox.stub(fs, 'existsSync').withArgs(project.testsFolder).returns(false);
			const promise = operation.perform(project);
			sinon.assert.notCalled(gulpSrcStub);
			return promise;
		});

		it('calls gulp on the correct source folders', () => {
			sandbox.stub(fs, 'existsSync').withArgs(project.testsFolder).returns(true);
			const promise = operation.perform(project);
			const sourcesPath = path.resolve(project.sourcesPattern);
			sinon.assert.calledOnce(gulpSrcStub);
			sinon.assert.calledWith(gulpSrcStub, sourcesPath, { base: '.' });
			return promise;
		});
	});
});