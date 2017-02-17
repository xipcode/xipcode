import { expect } from 'chai';
import { describe, it } from 'mocha';
import gulp from 'gulp';
import browserReleaseCompiler from '../../src/browserScenario/browserReleaseCompiler';
import sinon from 'sinon';
import mockStream from '../core/mockStream';
import path from 'path';
import fs from 'fs-extra';
import domain from 'domain';

describe('browserReleaseCompiler', () => {

	const testCompiler = browserReleaseCompiler.create();

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
		let bundleSourceMapFile;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			gulpSrcStub = sandbox.stub(gulp, 'src').returns(stream);
			compilerOptions = {
				projectId: 'project-id',
				rootFolder: 'test-data/buildLifecycle/browserCompiler',
				main: 'src/module1.js',
				outputFolder: './build/test-output/buildLifecycle/browserCompiler/library/release',
				dependencies: ['pluralize'],
				codebaseRoot: '.'
			};
			fixtureFolder = 'test-data/buildLifecycle/browserCompiler/fixture';
			bundleSourceMapFile = path.join(compilerOptions.outputFolder, `${compilerOptions.projectId}.bundle.js.map`);
		});

		afterEach(() => {
			sandbox.restore()
		});

		const stream = mockStream.create();

		it('requires projectId', () => {
			delete compilerOptions.projectId;
			expect(() => testCompiler.compile(compilerOptions)).throw('projectId must be defined');
		});

		it('requires rootFolder', () => {
			delete compilerOptions.rootFolder;
			expect(() => testCompiler.compile(compilerOptions)).throw('rootFolder must be defined');
		});

		it('requires main', () => {
			delete compilerOptions.main;
			expect(() => testCompiler.compile(compilerOptions)).throw('main must be defined');
		});

		it('requires outputFolder', () => {
			delete compilerOptions.outputFolder;
			expect(() => testCompiler.compile(compilerOptions)).throw('outputFolder must be defined');
		});

		it('requires dependencies', () => {
			delete compilerOptions.dependencies;
			expect(() => testCompiler.compile(compilerOptions)).throw('dependencies must be defined');
		});

		it('compiles source files', () => {
			const compiledFile = 'project-id.bundle.js';
			const promise = testCompiler.compile(compilerOptions);
			return promise.then(() => {
				const outputContent = getFileContents(compilerOptions.outputFolder, compiledFile);
				const firstline = 'require=(function e(t,n,r)';
				expect(outputContent.indexOf(firstline)).eql(0);
				expect(/{"project-id":\[function\(require,module,exports\)/.test(outputContent)).equal(true);
			});
		});

		it('creates source maps for compiled files', () => {
			const sourcemap = 'project-id.bundle.js.map';
			const promise = testCompiler.compile(compilerOptions);
			return promise.then(() => {
				const outputContent = getFileContents(compilerOptions.outputFolder, sourcemap);
				const firstline = '{"version":3,"sources":';
				expect(outputContent.indexOf(firstline)).eql(0);
			});
		});

		it('compiles standalone file', () => {
			compilerOptions.outputFolder = './build/test-output/buildLifecycle/browserCompiler/standalone/release';
			compilerOptions.standalone = 'myApi';
			const compiledFile = 'project-id.bundle.js';

			const promise = testCompiler.compile(compilerOptions);
			return promise.then(() => {
				const outputContent = getFileContents(compilerOptions.outputFolder, compiledFile);
				expect(/g\.myApi/.test(outputContent)).equal(true);
			});
		});

		it('throws an error if a module imports a dependency that is not declared in project.json', (done) => {
			const d = domain.create();
			d.on('error', (err) => {
				d.exit();
				process.nextTick(function () {
					expect(err.message).to.equal('Module pluralize is imported within project-id but is not ' +
						'declared as a dependency in project.json');
					done();
				});
			});
			d.run(function () {
				compilerOptions.dependencies = [];
				testCompiler.compile(compilerOptions);
			});
		});

		it('writes the correct source paths in the map', () => {
			const promise = testCompiler.compile(compilerOptions);
			return promise.then(() => {
				const mapJson = fs.readJSONSync(bundleSourceMapFile);
				expect(mapJson.sources[0]).to.equal('node_modules/browser-pack/_prelude.js');
				expect(mapJson.sources[1]).to.equal('test-data/buildLifecycle/browserCompiler/src/module1.js');
			});
		});

		it('writes the correct sourceRoot in the map', () => {
			const promise = testCompiler.compile(compilerOptions);
			return promise.then(() => {
				const mapJson = fs.readJSONSync(bundleSourceMapFile);
				expect(mapJson.sourceRoot).to.equal('../../../../../..');
			});
		});
	})
});