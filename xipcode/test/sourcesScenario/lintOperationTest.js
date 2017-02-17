import { expect } from 'chai';
import { describe, it } from 'mocha';
import lintOperation from '../../src/sourcesScenario/lintOperation';
import sinon from 'sinon';
import gulp from 'gulp';
import eslint from 'gulp-eslint';
import mockStream from '../core/mockStream';

describe('lintOperation', () => {

	const operation = lintOperation.create();

	describe('create', () => {

		it('returns an object', () => {
			expect(typeof operation).equal('object');
		});

		it('sets the operation\'s id', () => {
			expect(operation.id).equal('lint');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Linting files');
		});
	});

	describe('perform', () => {

		const stream = mockStream.create();

		let project;
		beforeEach(() => {
			project = {
				sourcesPattern: 'test-data/buildLifecycle/lintOperation/src/**/*.js',
				testsPattern: 'test-data/buildLifecycle/lintOperation/test/**/*.js',
				lint: {
					excludes: []
				}
			}
		});

		let sandbox;
		let gulpSrcStub;
		let formatSpy;
		let failAfterErrorSpy;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			gulpSrcStub = sandbox.stub(gulp, 'src').returns(stream);
			formatSpy = sandbox.spy(eslint, 'format');
			failAfterErrorSpy = sandbox.spy(eslint, 'failAfterError');
		});
		afterEach(() => {
			sandbox.restore();
		});

		it('requires sourcesPattern', () => {
			delete project.sourcesPattern;
			expect(() => operation.perform(project)).throw('sourcesPattern must be defined');
		});

		it('requires testsPattern', () => {
			delete project.testsPattern;
			expect(() => operation.perform(project)).throw('testsPattern must be defined');
		});

		it('requires lint', () => {
			delete project.lint;
			expect(() => operation.perform(project)).throw('lint must be defined');
		});

		it('requires lint.excludes', () => {
			delete project.lint.excludes;
			expect(() => operation.perform(project)).throw('lint.excludes must be defined');
		});

		it('returns a promise', () => {
			const promise = operation.perform(project);
			expect(promise instanceof Promise).equal(true);
			return promise;
		});

		it('lints', () => {
			const promise = operation.perform(project);
			sinon.assert.calledOnce(gulpSrcStub);
			sinon.assert.calledWith(gulpSrcStub, [project.sourcesPattern, project.testsPattern]);
			sinon.assert.calledOnce(formatSpy);
			sinon.assert.calledOnce(failAfterErrorSpy);
			return promise;
		});

		it('uses excludes', () => {
			project.lint.excludes = ['excludes1', 'excludes2'];
			operation.perform(project);
			sinon.assert.calledOnce(gulpSrcStub);
			sinon.assert.calledWith(gulpSrcStub, [project.sourcesPattern, project.testsPattern, '!excludes1', '!excludes2']);
		});

		it('lints many files', () => {
			sandbox.restore();
			return operation.perform(project);
		});
	});
});
