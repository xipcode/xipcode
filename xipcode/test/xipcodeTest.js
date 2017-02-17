import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import commandline from '../src/core/commandline';
import * as xipcode from '../src/xipcode';
import projectCreator from '../src/projects/projectCreator';
import projectLoader from '../src/projects/projectLoader';
import codebaseLoader from '../src/projects/codebaseLoader';
import mockGulp from './gulp/mockGulp';
import lifecycleTasksGenerator from '../src/gulp/lifecycleTasksGenerator';
import sourceMapSuport from 'source-map-support';
import { LoadProjectError }  from '../src/errors/error';
import files from '../src/core/files';
import codebaseTaskGenerator from '../src/gulp/codebaseTaskGenerator';
import buildProfile from '../src/model/buildProfile';

const buildPath = './build/test-output/';

describe('xipcode', () => {

	describe('initialize', () => {

		let mockProject;
		const mockProjectLoader = {
			loadProjects() {
				if (mockProject) {
					return [mockProject];
				}
				throw new Error('Mock exception');
			}
		};
		const mockCodebaseLoader = {
			loadProjects() {}
		};

		let sandbox;
		let gulp;
		let oldPwd;
		let projectLoaderStub;
		beforeEach(() => {
			mockProject = null;
			sandbox = sinon.sandbox.create();
			sandbox.stub(files, 'findCodebaseRoot').returns(buildPath);
			gulp = mockGulp.create(sandbox);
			oldPwd = process.env.PWD;
			process.env.PWD = buildPath;
		});
		afterEach(() => {
			sandbox.restore();
			process.env.PWD = oldPwd;
		});

		it('installs source map support', () => {
			const sourceMapSupportSpy = sandbox.spy(sourceMapSuport, 'install');
			xipcode.initialize();
			sinon.assert.calledOnce(sourceMapSupportSpy);
		});

		it('adds a \'create-project\' task', () => {
			xipcode.initialize();
			expect(gulp.functionByTaskId['create-project']).not.to.be.undefined;
		});

		it('implements the \'create-project\' task', () => {
			sandbox.stub(commandline, 'getParsedArgs', () => {
				return { id: 'testId' };
			});
			const spy = sandbox.spy(projectCreator, 'createProject');

			xipcode.initialize();
			gulp.functionByTaskId['create-project']();
			expect(spy.calledWith({ 'id': 'testId', 'basePath': buildPath })).to.be.true;
		});

		it('\'create-project\' task throws an exception for missing id parameter', () => {
			sandbox.stub(commandline, 'getParsedArgs', () => { return {}; });
			xipcode.initialize();
			expect(gulp.functionByTaskId['create-project']).throw('Command line argument for the project id is required. E.g. --id=<project-id>');
		});

		it('loads project from process.env.PWD', () => {
			mockProject = { id: 'project-id', rootFolder: buildPath };
			projectLoaderStub = sandbox.stub(projectLoader, 'create').returns(mockProjectLoader);
			const loadProjectSpy = sandbox.spy(mockProjectLoader, 'loadProjects');
			xipcode.initialize();
			sinon.assert.calledWith(loadProjectSpy, buildPath);
		});

		it('loads project from process.cwd for lifecycle tasks', () => {
			mockProject = { id: 'project-id', rootFolder: buildPath };
			sandbox.stub(projectLoader, 'create').returns(mockProjectLoader);
			const loadProjectsStub = sandbox.stub(mockProjectLoader, 'loadProjects');
			loadProjectsStub.withArgs(undefined).returns(null);
			const oldPwd = process.env.PWD;
			process.env.PWD = undefined;
			xipcode.initialize();
			sinon.assert.calledWith(loadProjectsStub, process.cwd());
			process.env.PWD = oldPwd;
		});

		it('loads project from process.cwd for codebase tasks', () => {
			mockProject = { id: 'project-id', rootFolder: buildPath };
			sandbox.stub(projectLoader, 'create').returns(mockProjectLoader);
			sandbox.stub(codebaseLoader, 'create').returns(mockCodebaseLoader);
			const loadProjectsSpy = sandbox.spy(mockCodebaseLoader, 'loadProjects');
			xipcode.initialize();
			sinon.assert.calledWith(loadProjectsSpy, process.cwd());
		});

		it('loads projects with the server build profile', () => {
			mockProject = { id: 'project-id', rootFolder: buildPath };
			projectLoaderStub = sandbox.stub(projectLoader, 'create').returns(mockProjectLoader);
			sandbox.stub(commandline, 'getParsedArgs', () => {
				return {
					id: 'testId',
					profile: 'server'
				};
			});
			xipcode.initialize();
			sinon.assert.calledWith(projectLoaderStub, 'server');
		});

		it('throws an error for an invalid build profile', () => {
			mockProject = { id: 'project-id' };
			projectLoaderStub = sandbox.stub(projectLoader, 'create').returns(mockProjectLoader);
			const invalidProfile = {
				id: 'testId',
				profile: 'invalid-profile'
			};
			sandbox.stub(commandline, 'getParsedArgs', () => {
				return invalidProfile;
			});
			const errorMessage = '\'invalid-profile\' is not a valid profile. A profile must be one of [server,local]';
			sandbox.stub(buildProfile, 'validate').withArgs('invalid-profile').throws(errorMessage);
			expect(() => xipcode.initialize()).to.throw();
		});

		it('does not generate lifecycle tasks when no project available', () => {
			const generateStub = { generate: sandbox.stub() };
			sandbox.stub(lifecycleTasksGenerator, 'create').returns(generateStub);
			sandbox.stub(projectLoader, 'create').returns({
				loadProjects() {
					return null;
				}
			});
			xipcode.initialize();
			sinon.assert.notCalled(generateStub.generate);
		});

		it('generates lifecycle tasks for project', () => {
			mockProject = { id: 'project-id', rootFolder: buildPath };
			projectLoaderStub = sandbox.stub(projectLoader, 'create').returns(mockProjectLoader);
			const generateStub = { generate: sandbox.stub() };
			sandbox.stub(lifecycleTasksGenerator, 'create').returns(generateStub);
			xipcode.initialize();
			sinon.assert.calledOnce(generateStub.generate);
			sinon.assert.calledWith(generateStub.generate, [mockProject]);
		});

		it('generates codebase tasks', () => {
			mockProject = { id: 'project-id', rootFolder: buildPath };
			projectLoaderStub = sandbox.stub(projectLoader, 'create').returns(mockProjectLoader);
			const generateStub = { generate: sandbox.stub() };
			const createStub = sandbox.stub(codebaseTaskGenerator, 'create').returns(generateStub);
			xipcode.initialize();
			sinon.assert.calledOnce(createStub);
			sinon.assert.calledWith(createStub, false, buildProfile.LOCAL);
			sinon.assert.calledOnce(generateStub.generate);
			sinon.assert.calledWith(generateStub.generate, [mockProject]);
		});

		it('does not generate codebase tasks when no there is no project.json at the codebase root', () => {
			mockProject = { id: 'project-id', rootFolder: buildPath };
			sandbox.stub(projectLoader, 'create').returns(mockProjectLoader);
			sandbox.stub(codebaseLoader, 'create').returns(mockCodebaseLoader);
			const generateStub = { generate: sandbox.stub() };
			const createStub  = sandbox.stub(codebaseTaskGenerator, 'create').returns(generateStub);
			xipcode.initialize();
			sinon.assert.calledWith(createStub, false, buildProfile.LOCAL);
			sinon.assert.notCalled(generateStub.generate);
		});

		it('enables watching', () => {
			sandbox.stub(commandline, 'getParsedArgs', () => { return { 'watch': true}; });
			mockProject = { id: 'project-id', rootFolder: buildPath };
			sandbox.stub(projectLoader, 'create').returns(mockProjectLoader);
			sandbox.stub(codebaseLoader, 'create').returns(mockCodebaseLoader);
			const lifecycleTaskGeneratorStub = sandbox.spy(lifecycleTasksGenerator, 'create');
			const codebaseTaskGeneratorStub = sandbox.stub(codebaseTaskGenerator, 'create');
			xipcode.initialize();
			sinon.assert.calledWith(lifecycleTaskGeneratorStub, true);
			sinon.assert.calledWith(codebaseTaskGeneratorStub, true, buildProfile.LOCAL);
		});

		it('throws a LoadProjectError error if loadProjectsFromFolder fails', () => {
			projectLoaderStub = sandbox.stub(projectLoader, 'create').returns(mockProjectLoader);
			sandbox.stub(mockProjectLoader, 'loadProjects').throws(new LoadProjectError('test message'));
			expect(() => xipcode.initialize()).to.throw();
		});
	});
});
