import { expect } from 'chai';
import { describe, it } from 'mocha';
import gulp from 'gulp';
import browserTestCompiler from '../../src/browserScenario/browserTestCompiler';
import sinon from 'sinon';
import mockStream from '../core/mockStream';
import path from 'path';
import fs from 'fs-extra';
import domain from 'domain';

describe('browserTestCompiler', () => {

	const testCompiler = browserTestCompiler.create();

	describe('create', () => {

		it('returns an object', () => {
			expect(testCompiler).not.equal(undefined);
			expect(typeof testCompiler).equal('object');
		});
	});

	describe('compile', () => {

		function getFileContents(folder, filename) {
			const file = path.join(folder, filename);
			return fs.readFileSync(file);
		}

		let sandbox;
		let gulpSrcStub;
		let compilerOptions;
		let fixtureFolder;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			gulpSrcStub = sandbox.stub(gulp, 'src').returns(stream);
			compilerOptions = {
				projectId: 'project-1',
				testsFolder: './test-data/buildLifecycle/browserCompiler/test',
				testsPattern: 'test/**/*.js',
				outputFolder: './build/test-output/buildLifecycle/browserCompiler/test/browser',
				dependencies: ['pluralize', 'mocha', 'chai']
			};
			fixtureFolder = 'test-data/buildLifecycle/browserCompiler/fixture';
		});

		afterEach(() => {
			sandbox.restore()
		});

		const stream = mockStream.create();

		it('requires projectId', () => {
			delete compilerOptions.projectId;
			expect(() => testCompiler.compile(compilerOptions)).throw('projectId must be defined');
		});

		it('requires testsFolder', () => {
			delete compilerOptions.testsFolder;
			expect(() => testCompiler.compile(compilerOptions)).throw('testsFolder must be defined');
		});

		it('requires outputFolder', () => {
			delete compilerOptions.outputFolder;
			expect(() => testCompiler.compile(compilerOptions)).throw('outputFolder must be defined');
		});

		it('requires dependencies', () => {
			delete compilerOptions.dependencies;
			expect(() => testCompiler.compile(compilerOptions)).throw('dependencies must be defined');
		});

		it('compiles test files', () => {
			const compiledFile = 'project-1.tests.bundle.js';
			const promise = testCompiler.compile(compilerOptions);
			return promise.then(() => {
				const outputContent = getFileContents(compilerOptions.outputFolder, compiledFile);
				const firstline = '(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;';
				expect(outputContent.indexOf(firstline)).eql(0);
				expect(/'thing 1s'/.test(outputContent)).equal(true);
				expect(/'thing 2s'/.test(outputContent)).equal(true);
			});
		});

		it('creates source maps for compiled files', () => {
			const sourcemap = 'project-1.tests.bundle.js.map';
			const promise = testCompiler.compile(compilerOptions);
			return promise.then(() => {
				const outputContent = getFileContents(compilerOptions.outputFolder, sourcemap);
				const firstline = '{"version":3,"sources":';
				expect(outputContent.indexOf(firstline)).eql(0);
			});
		});

		it('throws an error if a module imports a dependency that is not declared in project.json', (done) => {
			const d = domain.create();
			d.on('error', (err) => {
				d.exit();
				process.nextTick(function () {
					expect(err.message).to.equal('Module pluralize is imported within project-1 but is not ' +
						'declared as a dependency in project.json');
					done();
				});
			});
			d.run(function () {
				compilerOptions.dependencies.shift();
				testCompiler.compile(compilerOptions);
			});
		});
	})
});