import {expect} from 'chai';
import {describe, it} from 'mocha';
import codebaseTaskGenerator from '../../src/gulp/codebaseTaskGenerator';
import mockGulp from './mockGulp';
import sinon from 'sinon';
import buildRunner from '../../src/execution/buildRunner';
import projectLoader from '../../src/projects/projectLoader';

describe('codebaseTaskGenerator', () => {

	const buildProfile = 'local';

	describe('create', () => {

		it('requires watchEnabled', () => {
			expect(() => codebaseTaskGenerator.create(undefined, buildProfile)).throw('watchEnabled must be defined');
		});
		
		it('requires profile', () => {
			expect(() => codebaseTaskGenerator.create(true, undefined)).throw('profile must be defined');
		});
	});

	describe('generate', () => {

		const generator = codebaseTaskGenerator.create(true, buildProfile);

		const mockProjects = [
			{ id: 'project-1' },
			{ id: 'project-2' },
			{ id: 'project-3' }
		];

		let sandbox;
		let gulp;
		let projectLoaderStub;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			gulp = mockGulp.create(sandbox);
			projectLoaderStub = sandbox.stub(projectLoader, 'create').returns({
				loadProjects() {
					return mockProjects;
				}
			});
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('requires projects', () => {
			expect(() => generator.generate(undefined)).throw('projects must be defined');
		});

		it('generates install and dev gulp tasks for each project', () => {
			generator.generate(mockProjects);
			expect(gulp.functionByTaskId['project-1']).not.equal(undefined);
			expect(gulp.functionByTaskId['project-2']).not.equal(undefined);
			expect(gulp.functionByTaskId['project-3']).not.equal(undefined);
			expect(gulp.functionByTaskId['dev:project-1']).not.equal(undefined);
			expect(gulp.functionByTaskId['dev:project-2']).not.equal(undefined);
			expect(gulp.functionByTaskId['dev:project-3']).not.equal(undefined);

		});

		it('generates a gulp task that executes all phases for an install', () => {
			const runStub = { run: sandbox.stub() };
			const createStub = sandbox.stub(buildRunner, 'create').returns(runStub);
			generator.generate(mockProjects);
			gulp.functionByTaskId['project-1']();
			sinon.assert.calledOnce(runStub.run);
			sinon.assert.calledWith(runStub.run, mockProjects, sinon.match.any, ['initialize', 'lint', 'compile', 'compile-tests', 'test', 'package', 'install']);
		});

		it('generates a gulp task with dev phases', () => {
			const runStub = { run: sandbox.stub() };
			const createStub = sandbox.stub(buildRunner, 'create').returns(runStub);
			generator.generate(mockProjects);
			gulp.functionByTaskId['dev:project-1']();
			sinon.assert.calledOnce(runStub.run);
			sinon.assert.calledWith(runStub.run, mockProjects, sinon.match.any, ['initialize', 'compile', 'package', 'install']);
		});
	});
});