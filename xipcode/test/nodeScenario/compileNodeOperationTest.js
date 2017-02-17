import { expect } from 'chai';
import { describe, it } from 'mocha';
import compileNodeOperation from '../../src/nodeScenario/compileNodeOperation';
import sinon from 'sinon';
import nodeCompiler from '../../src/nodeScenario/nodeCompiler';

describe('compileNodeOperation', () => {

	const operation = compileNodeOperation.create();

	describe('create', () => {

		it('returns an object', () => {
			expect(operation).not.equal(undefined);
			expect(typeof operation).equal('object');
		});

		it('sets the operation\'s id', () => {
			expect(operation.id).equal('compile-node');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Compiling sources for node');
		});
	});

	describe('perform', () => {

		let project;
		beforeEach(() => {
			project = {
				sourcesFolder: 'test-data/core/dependency',
				buildReleaseFolder: 'build/release',
				sourcesPattern: '**/*.js',
				dependencies: ['module1', 'module2', 'module3', 'moduleA', 'moduleB']
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
			sandbox.stub(nodeCompiler, 'create').returns(compileStub);

		});
		afterEach(() => {
			sandbox.restore()
		});

		it('requires sourcesPattern', () => {
			delete project.sourcesPattern;
			expect(() => operation.perform(project)).throw('sourcesPattern must be defined');
		});

		it('requires buildReleaseFolder', () => {
			delete project.buildReleaseFolder;
			expect(() => operation.perform(project)).throw('buildReleaseFolder must be defined');
		});

		it('requires dependencies', () => {
			delete project.dependencies;
			expect(() => operation.perform(project)).throw('dependencies must be defined');
		});

		it('returns compiler result', () => {
			expect(operation.perform(project)).equal(mockCompilerResult);
		});

		it('compiles', () => {
			const promise = operation.perform(project);
			sinon.assert.calledOnce(compileStub.compile);
			sinon.assert.calledWith(compileStub.compile, {
				sourcesPattern: project.sourcesPattern,
				outputFolder: project.buildReleaseFolder,
				srcBase: '.'
			});
			return promise;
		});

		it('throws an error if an external dependency is used but not declared', () => {
			project.dependencies = project.dependencies.slice(0, 3);
			expect(() => operation.perform(project)).to.throw('The following dependencies are referenced in this ' +
				'project but not declared in its project.json: [moduleA, moduleB]');
		});

	});
});