import { expect } from 'chai';
import { describe, it } from 'mocha';
import gulp from 'gulp';
import nodeCompiler from '../../src/nodeScenario/nodeCompiler';
import sinon from 'sinon';
import mockStream from '../core/mockStream';

describe('nodeCompiler', () => {

	const testCompiler = nodeCompiler.create();

	describe('create', () => {

		it('returns an object', () => {
			expect(testCompiler).not.equal(undefined);
			expect(typeof testCompiler).equal('object');
		});
	});

	describe('compile', () => {

		let compilerOptions;
		beforeEach(() => {
			compilerOptions = {
				srcBase: '.',
				sourcesPattern: '*',
				outputFolder: 'build'
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

		it('requires srcBase', () => {
			delete compilerOptions.srcBase;
			expect(() => testCompiler.compile(compilerOptions)).throw('srcBase must be defined');
		});

		it('requires sourcesPattern', () => {
			delete compilerOptions.sourcesPattern;
			expect(() => testCompiler.compile(compilerOptions)).throw('sourcesPattern must be defined');
		});

		it('requires outputFolder', () => {
			delete compilerOptions.outputFolder;
			expect(() => testCompiler.compile(compilerOptions)).throw('outputFolder must be defined');
		});

		it('returns a promise from a gulp stream', () => {
			const promise = testCompiler.compile(compilerOptions);
			expect(promise instanceof Promise).equal(true);
			sinon.assert.calledOnce(gulpSrcStub);
			return promise;
		});
	})
});