import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import testBrowserOperation from '../../src/browserScenario/testBrowserOperation';
import path from 'path';
import fs from 'fs-extra';
import karma from 'karma';
import sinon from 'sinon';

describe('testBrowserOperation', () => {

	const testBuildFolder = 'test-data/buildLifecycle/testBrowserOperation/test-build';
	const buildTestOutputFolder = 'build/test-output/buildLifecycle/testBrowserOperation';
	const logger = [{
		type: 'file',
		filename: path.join(buildTestOutputFolder, 'karma.log')
	}];
	const operation = testBrowserOperation.create(logger);

	describe('create', () => {

		it('returns an object', () => {
			expect(operation).not.equal(undefined);
			expect(typeof operation).equal('object');
		});

		it('sets the operation\'s id', () => {
			expect(operation.id).equal('test-browser');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Running browser tests');
		});
	});

	describe('perform', () => {

		let sandbox;
		let project;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			project = {
				id: 'project-1',
				buildFolder: buildTestOutputFolder,
				buildProfile: 'local'
			};
			fs.mkdirs(buildTestOutputFolder);
		});
		afterEach(() => {
			sandbox.restore();
		});

		function createServerStub() {
			function stub() {
				return {
					start() {}
				}
			}

			return sandbox.stub(karma, 'Server', stub);
		}

		it('requires id', () => {
			delete project.id;
			expect(() => operation.perform(project)).throw('id must be defined');
		});

		it('requires buildFolder', () => {
			delete project.buildFolder;
			expect(() => operation.perform(project)).throw('buildFolder must be defined');
		});

		it('throws an error if karma fails', () => {
			project.buildFolder = path.join(buildTestOutputFolder, 'empty/folder');
			const testsFolder = path.join(project.buildFolder, 'test', 'browser');
			fs.mkdirsSync(testsFolder);
			fs.writeFileSync(path.join(testsFolder, 'project-1.tests.bundle.js'), 'invalid test file');
			return operation.perform(project)
				.then(() => {
					throw new Error('Expected an error to be thrown');
				})
				.catch((e) => {
					expect(e.message).to.eql('Karma test run completed with failures.');
				});
		});

		it('does not run karma if there are no tests', () => {
			const serverStub = createServerStub();
			sandbox.stub(fs, 'existsSync').withArgs('build/test/browser/project-1.tests.bundle.js').returns(false);
			return operation.perform(project).then(() => {
				sinon.assert.notCalled(serverStub);
			});
		});

		it('runs karma', () => {
			fs.copySync(testBuildFolder, buildTestOutputFolder);
			const promise = operation.perform(project).then(() => {
				const karmaLog = fs.readFileSync(logger[0].filename, 'utf8');
				expect(karmaLog.match(/karma - Karma v1.3.0 server started at http:\/\/localhost:9876\//)).to.not.be.null;
				expect(karmaLog.match(/launcher - Launching browser PhantomJS with concurrency 1/)).to.not.be.null;
				expect(karmaLog.match(/launcher - Starting browser PhantomJS/)).to.not.be.null;
				expect(karmaLog.match(/PhantomJS.* - Connected on socket/)).to.not.be.null;

				const coverageReport = path.join(buildTestOutputFolder, 'reports', 'browser', 'coverage-instrumented.json');
				expect(fs.existsSync(coverageReport)).equal(true);
			});
			expect(promise instanceof Promise).equal(true);
			return promise;
		});

		it('starts karma server with options for local build', () => {
			const serverStub = createServerStub();
			operation.perform(project);
			sinon.assert.calledOnce(serverStub);
			sinon.assert.calledWithMatch(serverStub, {
				basePath: 'build/test-output/buildLifecycle/testBrowserOperation',
				frameworks: ['mocha', 'chai', 'sinon'],
				reporters: ['mocha', 'coverage'],
				files: ['test/browser/project-1.libs.bundle.js', 'test/browser/project-1.tests.bundle.js'],
				port: 9876,
				colors: true,
				autoWatch: false,
				browsers: ['PhantomJS'],
				browserNoActivityTimeout: 35000,
				singleRun: true,
				concurrency: 1,
				client: {
					mocha: {
						reporter: 'spec',
						timeout: 30000
					}
				}
			});
		});

		it('starts karma server with options for server build', () => {
			const serverStub = createServerStub();
			project.buildProfile = 'server';
			operation.perform(project);
			sinon.assert.calledOnce(serverStub);
			sinon.assert.calledWithMatch(serverStub, {
				basePath: 'build/test-output/buildLifecycle/testBrowserOperation',
				frameworks: ['mocha', 'chai', 'sinon'],
				reporters: ['mocha', 'coverage', 'bamboo'],
				files: ['test/browser/project-1.libs.bundle.js', 'test/browser/project-1.tests.bundle.js'],
				preprocessors: {
					'test/browser/project-1.libs.bundle.js': ['sourcemap'],
					'test/browser/project-1.tests.bundle.js': ['sourcemap', 'coverage']
				},
				port: 9876,
				colors: true,
				autoWatch: false,
				browsers: ['PhantomJS'],
				browserNoActivityTimeout: 35000,
				singleRun: true,
				concurrency: 1,
				client: {
					mocha: {
						reporter: 'spec',
						timeout: 30000
					}
				},
				bambooReporter: {
					filename: 'build/test-output/buildLifecycle/testBrowserOperation/test/browser/mocha.json'
				}
			});
		});
	});
});
