import { expect } from 'chai';
import { describe, it } from 'mocha';
import project from '../../src/model/project'
import files from '../../src/core/files';
import sinon from 'sinon';

describe('project', () => {

	let sandbox;
	let project1;
	let testProject;
	beforeEach(() => {
		sandbox = sinon.sandbox.create();
		sandbox.stub(files, 'findCodebaseRoot').returns('codebase/root');
		project1 = {
			id: 'project-1',
			main: 'src/project1.js',
			rootFolder: 'path/to/project',
			scenarioIds: [
				'scenario-1',
				'scenario-2'
			],
			projects: ['project-2', 'project-3'],
			dependencies: ['dependency-1', 'dependency-2'],
			devDependencies: ['devdependency-1', 'devdependency-2'],
			buildProfile: 'bamboo'
		};
		testProject = project.create(project1);
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('create', () => {

		it('requires id', () => {
			delete project1.id;
			expect(() => project.create(project1)).throw('id must be defined');
		});

		it('does not require main', () => {
			delete project1.main;
			const p = project.create(project1);
			expect(p.main).equal(undefined);
		});

		it('allows main to be optional when scenarioIds is empty', () => {
			project1.scenarioIds = [];
			delete project1.main;
			expect(project.create(project1).main).equal(undefined);
		});

		it('requires scenarioIds', () => {
			delete project1.scenarioIds;
			expect(() => project.create(project1)).throw('scenarioIds must be defined');
		});

		it('requires rootFolder', () => {
			delete project1.rootFolder;
			expect(() => project.create(project1)).throw('rootFolder must be defined');
		});

		it('requires lint.excludes to be an array', () => {
			project1.lint = { excludes: 'not-an-array' };
			expect(() => project.create(project1)).throw('lint.excludes must be of type array');
		});

		it('requires dependencies to be an array', () => {
			project1.dependencies = 'dep1';
			expect(() => project.create(project1)).throw('dependencies must be of type array');
		});

		it('creates with default empty dependencies', () => {
			project1.dependencies = undefined;
			expect(project.create(project1).dependencies).eql([]);
		});

		it('creates with default empty devDependencies', () => {
			project1.devDependencies = undefined;
			expect(project.create(project1).devDependencies).eql([]);
		});

		it('requires projects to be an array', () => {
			project1.projects = 'p2';
			expect(() => project.create(project1)).throw('projects must be of type array');
		});

		it('requires buildProfile', () => {
			delete project1.buildProfile;
			expect(() => project.create(project1)).throw('buildProfile must be defined');
		});

		it('creates with default empty projects', () => {
			project1.projects = undefined;
			expect(project.create(project1).projects).eql([]);
		});

		it('creates', () => {
			expect(testProject.id).equal('project-1');
			expect(testProject.main).equal('src/project1.js');
			expect(testProject.scenarioIds).eql(['scenario-1', 'scenario-2']);
			expect(testProject.rootFolder).equal('path/to/project');
			expect(testProject.buildFolder).equal('build');
			expect(testProject.buildReleaseFolder).equal('build/release');
			expect(testProject.buildTestFolder).equal('build/test');
			expect(testProject.sourcesFolder).equal('src');
			expect(testProject.sourcesPattern).equal('src/**/*.js');
			expect(testProject.testsFolder).equal('test');
			expect(testProject.testsPattern).equal('test/**/*.js');
			expect(testProject.dependencies).eql(['dependency-1', 'dependency-2']);
			expect(testProject.devDependencies).eql(['devdependency-1', 'devdependency-2']);
			expect(testProject.projects).eql(['project-2', 'project-3']);
			expect(testProject.codebaseRoot).equal('codebase/root');
			expect(testProject.nodeModulesFolder).equal('codebase/root/node_modules');
			expect(testProject.browserLibsFolder).equal('codebase/root/build/browser-libs');
		});

		it('creates with default lint excludes', () => {
			expect(testProject.lint).eql({ excludes: [] });
		});

		it('creates with provided lint excludes', () => {
			project1.lint = { excludes: ['exclude1'] };
			testProject = project.create(project1);
			expect(testProject.lint).eql({ excludes: ['exclude1'] });
		});

		it('requires browserCompiler.standalone to be string', () => {
			project1.browserCompiler = { standalone: 123 };
			expect(() => project.create(project1)).throw('browserCompiler.standalone must be of type string. Found: [object Number]');
		});

		it('creates with provided browserCompiler', () => {
			project1.browserCompiler = { standalone: 'myApi' };
			testProject = project.create(project1);
			expect(testProject.browserCompiler).eql({ standalone: 'myApi' });
		});

		it('creates with default browserCompiler', () => {
			expect(testProject.browserCompiler).eql({});
		});

		it('creates with optional bin', () => {
			expect(testProject.bin).eql(undefined);
			project1.bin = 'src/cli.js';
			testProject = project.create(project1);
			expect(testProject.bin).eql('src/cli.js');
		});

		it('creates with default version', () => {
			expect(testProject.version).eql('1.0.0-latest');
			project1.version = '2.0.1';
			testProject = project.create(project1);
			expect(testProject.version).eql('2.0.1');
		});
	});
});
