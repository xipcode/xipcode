import { expect } from 'chai';
import { describe, it } from 'mocha';
import testNodeOperation from '../../src/nodeScenario/testNodeOperation';
import sinon from 'sinon';
import gulp from 'gulp';
import fs from 'fs-extra';
import mockStream from '../core/mockStream';
import istanbul from 'gulp-istanbul';

describe('testNodeOperation', () => {

	const operation = testNodeOperation.create();

	describe('create', () => {

		it('returns an object', () => {
			expect(operation).not.equal(undefined);
			expect(typeof operation).equal('object');
		});

		it('sets the operation\'s id', () => {
			expect(operation.id).equal('test-node');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Running tests for node');
		});
	});

	describe('perform', () => {

		let project;
		beforeEach(() => {
			project = {
				id: 'project-id',
				testsFolder: 'testsFolder',
				buildFolder: 'build',
				buildTestFolder: 'build/test',
				sourcesPattern: 'src/**/*.js',
				testsPattern: 'test/**/*.js',
				buildProfile: 'spec'
			};
		});

		const stream = mockStream.create();

		let sandbox;
		let gulpSrcStub;
		let istanbulSpy;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			gulpSrcStub = sandbox.stub(gulp, 'src').returns(stream);
			istanbulSpy = sandbox.spy(istanbul, 'writeReports');
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

		it('requires testsPattern', () => {
			delete project.testsPattern;
			expect(() => operation.perform(project)).throw('testsPattern must be defined');
		});

		it('requires buildProfile', () => {
			delete project.buildProfile;
			expect(() => operation.perform(project)).throw('buildProfile must be defined');
		});

		it('returns a promise', () => {
			const promise = operation.perform(project);
			expect(promise instanceof Promise).equal(true);
			return promise;
		});

		it('skips tests when project has no tests', () => {
			sandbox.stub(fs, 'existsSync').withArgs(project.testsFolder).returns(false);
			const promise = operation.perform(project);
			sinon.assert.notCalled(gulpSrcStub);
		});

		it('uses gulp on the correct source folders', () => {
			sandbox.stub(fs, 'existsSync').withArgs(project.testsFolder).returns(true);
			const promise = operation.perform(project);
			sinon.assert.calledOnce(gulpSrcStub);
			sinon.assert.calledWith(gulpSrcStub, ['build/test/node/src/**/*.js', 'build/test/node/test/**/*.js']);
			istanbulSpy.calledWith({
				fail: true,
				reporters: ['json', 'html'],
				reportOpts: {
					json: {
						dir: 'build/report/node',
						file: 'coverage.json'
					},
					html: {
						dir: 'build/report/node/html'
					}
				}
			});
			return promise;
		});
	});
});
