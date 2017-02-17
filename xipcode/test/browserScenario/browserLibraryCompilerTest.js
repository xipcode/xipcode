import { expect } from 'chai';
import { describe, it } from 'mocha';
import gulp from 'gulp';
import browserLibraryCompiler from '../../src/browserScenario/browserLibraryCompiler';
import sinon from 'sinon';
import mockStream from '../core/mockStream';
import path from 'path';
import fs from 'fs-extra';

describe('browserLibraryCompiler', () => {

	const testCompiler = browserLibraryCompiler.create();
	const stream = mockStream.create();

	describe('create', () => {

		it('returns an object', () => {
			expect(testCompiler).not.equal(undefined);
			expect(typeof testCompiler).equal('object');
		});
	});

	describe('compile', () => {

		let sandbox;
		let gulpSrcStub;
		let compilerOptions;
		let fixtureFolder;
		let bundleFile;
		let bundleSourceMapFile;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			gulpSrcStub = sandbox.stub(gulp, 'src').returns(stream);
			compilerOptions = {
				outputFolder: './build/test-output/buildLifecycle/browserLibraryCompiler',
				targetFileName: 'core-js.bundle.js',
				require: 'core-js',
				codebaseRoot: '.'
			};
			fixtureFolder = 'test-data/buildLifecycle/browserCompiler/fixture';
			bundleFile = path.join(compilerOptions.outputFolder, compilerOptions.targetFileName);
			bundleSourceMapFile = path.join(compilerOptions.outputFolder, `${compilerOptions.targetFileName}.map`);
		});

		afterEach(() => {
			sandbox.restore()
		});

		it('requires outputFolder', () => {
			delete compilerOptions.outputFolder;
			expect(() => testCompiler.compile(compilerOptions)).throw('outputFolder must be defined');
		});

		it('requires targetFileName', () => {
			delete compilerOptions.targetFileName;
			expect(() => testCompiler.compile(compilerOptions)).throw('targetFileName must be defined');
		});

		it('requires require', () => {
			delete compilerOptions.require;
			expect(() => testCompiler.compile(compilerOptions)).throw('require must be defined');
		});

		it('requires codebaseRoot', () => {
			delete compilerOptions.codebaseRoot;
			expect(() => testCompiler.compile(compilerOptions)).throw('codebaseRoot must be defined');
		});

		it('compiles module with source map', () => {
			const promise = testCompiler.compile(compilerOptions);
			return promise.then(() => {
				expect(fs.existsSync(bundleFile)).equal(true);
				expect(fs.existsSync(bundleSourceMapFile)).equal(true);
				const content = fs.readFileSync(bundleFile);
				expect(/modules\/es6\.symbol/.test(content)).equal(true);
			});
		});

		it('writes the correct source path for the target module in the map', () => {
			const promise = testCompiler.compile(compilerOptions);
			return promise.then(() => {
				const mapJson = fs.readJSONSync(bundleSourceMapFile);
				const sourcesCount = mapJson.sources.length;
				expect(mapJson.sources[sourcesCount - 1]).to.equal('node_modules/core-js/index.js');
			});
		});

		it('writes the correct sourceRoot in the map', () => {
			const promise = testCompiler.compile(compilerOptions);
			return promise.then(() => {
				const mapJson = fs.readJSONSync(bundleSourceMapFile);
				expect(mapJson.sourceRoot).to.equal('../../../..');
			});
		});

		it('writes the correct source path for the target module\'s dependencies in the map', () => {
			const promise = testCompiler.compile(compilerOptions);
			return promise.then(() => {
				const mapJson = fs.readJSONSync(bundleSourceMapFile);
				mapJson.sources.forEach(source => {
					expect(source).to.match(/node_modules\/.*/);
				});
			});
		});
	});
});
