import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import compileBrowserOperation from '../../src/browserScenario/compileBrowserOperation';
import browserReleaseCompiler from '../../src/browserScenario/browserReleaseCompiler';

describe('compileBrowserOperation', () => {

	const operation = compileBrowserOperation.create();

	describe('create', () => {

		it('returns an object', () => {
			expect(operation).not.equal(undefined);
			expect(typeof operation).equal('object');
		});

		it('sets the operation\'s id', () => {
			expect(operation.id).equal('compile-browser');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Compiling sources for browser');
		});
	});

	describe('perform', () => {

		let project;
		beforeEach(() => {
			project = {
				id: 'project-id',
				rootFolder: 'path/to/project',
				buildReleaseFolder: 'build/release',
				main: 'src/project1',
				browserCompiler: {},
				dependencies: ['dep1', 'dep2'],
				sourcesFolder: 'src',
				codebaseRoot: '.'
			};
		});

		const mockCompilerResult = 'compiler-result';

		let sandbox;
		let compileStub;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			compileStub = {
				compile: sandbox.stub().returns(mockCompilerResult)
			};
			sandbox.stub(browserReleaseCompiler, 'create').returns(compileStub);

		});
		afterEach(() => {
			sandbox.restore()
		});

		it('requires id', () => {
			delete project.id;
			expect(() => operation.perform(project)).throw('id must be defined');
		});

		it('requires rootFolder', () => {
			delete project.rootFolder;
			expect(() => operation.perform(project)).throw('rootFolder must be defined');
		});

		it('requires main', () => {
			delete project.main;
			expect(() => operation.perform(project)).throw('main must be defined');
		});

		it('requires browserCompiler', () => {
			delete project.browserCompiler;
			expect(() => operation.perform(project)).throw('browserCompiler must be defined');
		});

		it('requires buildReleaseFolder', () => {
			delete project.buildReleaseFolder;
			expect(() => operation.perform(project)).throw('buildReleaseFolder must be defined');
		});

		it('returns compiler result', () => {
			expect(operation.perform(project)).equal(mockCompilerResult);
		});

		it('compiles', () => {
			const promise = operation.perform(project);
			sinon.assert.calledOnce(compileStub.compile);
			sinon.assert.calledWith(compileStub.compile, {
				projectId: 'project-id',
				rootFolder: 'path/to/project',
				main: project.main,
				standalone: undefined,
				outputFolder: project.buildReleaseFolder,
				dependencies: ['dep1', 'dep2'],
				codebaseRoot: '.'
			});
			return promise;
		});
	});
});