import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import files from '../../src/core/files';
import fs from 'fs-extra';
import path from 'path';
import project from '../../src/model/project';
import projectLoader from '../../src/projects/projectLoader';
import { LoadProjectError }  from '../../src/errors/error';

const rootDir = 'path/to/root';
const foundProjectJsonFile = path.join(rootDir, 'topProjectFolder', 'project.json');

const singleProjectJson = {
	id: 'project-1',
	version: '2.0.0',
	main: 'src/projectId.js',
	bin: 'src/cli.js',
	scenarios: ['scenario-1', 'scenario-2'],
	dependencies: ['dep1', 'dep2'],
	devDependencies: ['devdep1', 'devdep2'],
	lint: {
		excludes: ['excluded']
	},
	browserCompiler: {
		standalone: 'myApi'
	}
};

const parentProjectJson = {
	id: 'parent',
	projects: [
		'child1',
		'child2'
	]
};

const childProject1Json = {
	id: 'child-1',
	projects: [
		'grandchild1'
	]
};

const grandchildProject1Json = {
	id: 'grandchild-1'
};

const childProject2Json = {
	id: 'child-2'
};

const duplicateProjectJson = {
	id: 'child-1'
};

const cycleProject1Json = {
	id: 'cycle-1',
	projects: [ 'cycle2' ]
};

const cycleProject2Json = {
	id: 'cycle-2',
	projects: [ '..' ]
};

const buildProfile = 'spec';

describe('projectLoader', () => {

	describe('create', () => {

		it('creates', () => {
			const loader = projectLoader.create(buildProfile);
			expect(loader).not.to.be.undefined;
			expect(loader.loadProjects).not.to.be.undefined;
		});

	});

	describe('loadProjects', () => {

		let sandbox;
		let readJsonSyncStub;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
		});
		afterEach(() => {
			readJsonSyncStub = undefined;
			sandbox = sandbox.restore();
		});

		function stubFile(projectFolder, projectJson) {
			const projectJsonFile = path.join(rootDir, projectFolder, 'project.json');
			if (!readJsonSyncStub) {
				readJsonSyncStub = sandbox.stub(fs, 'readJSONSync');
			}
			readJsonSyncStub.withArgs(projectJsonFile).returns(projectJson);
		}

		function stubFileWithLoadError(projectFolder) {
			const projectJsonFile = path.join(rootDir, projectFolder, 'project.json');
			if (!readJsonSyncStub) {
				readJsonSyncStub = sandbox.stub(fs, 'readJSONSync');
			}
			readJsonSyncStub.withArgs(projectJsonFile).throws(
				new LoadProjectError('Failed to load project from project.json')
			);
		}

		it('requires folder', () => {
			expect(() => projectLoader.create(buildProfile).loadProjects()).to.throw('folder must be defined');
		});

		it('returns a project from the nearest config file', () => {
			sandbox.stub(files, 'findFileInPath').returns(foundProjectJsonFile);
			sandbox.stub(fs, 'existsSync').returns(true);
			stubFile('topProjectFolder', singleProjectJson);
			const expectedProject = projectLoader.create(buildProfile).loadProjects('./');
			expect(expectedProject.length).to.eql(1);
			expect(expectedProject[0].id).to.eql('project-1');
			expect(expectedProject[0].version).to.eql('2.0.0');
			expect(expectedProject[0].main).to.eql('src/projectId.js');
			expect(expectedProject[0].bin).to.eql('src/cli.js');
			expect(expectedProject[0].scenarioIds).eql(['scenario-1', 'scenario-2']);
			expect(expectedProject[0].dependencies).to.eql(['dep1', 'dep2']);
			expect(expectedProject[0].devDependencies).to.eql(['devdep1', 'devdep2']);
			expect(expectedProject[0].lint).to.eql({ excludes: ['excluded'] });
			expect(expectedProject[0].browserCompiler).to.eql({ standalone: 'myApi' });
		});

		it('returns multiple projects when the nearest config file has child projects', () => {
			sandbox.stub(files, 'findFileInPath').returns(foundProjectJsonFile);
			sandbox.stub(fs, 'existsSync').returns(true);
			stubFile('topProjectFolder', parentProjectJson);
			stubFile('topProjectFolder/child1', childProject1Json);
			stubFile('topProjectFolder/child1/grandchild1', grandchildProject1Json);
			stubFile('topProjectFolder/child2', childProject2Json);
			const expectedProject = projectLoader.create(buildProfile).loadProjects('./');
			expect(expectedProject.length).to.eql(4);
			expect(expectedProject[0].id).to.eql('grandchild-1');
			expect(expectedProject[1].id).to.eql('child-1');
			expect(expectedProject[2].id).to.eql('child-2');
			expect(expectedProject[3].id).to.eql('parent');
		});

		it('rejects cycles in project hierarchy', () => {
			sandbox.stub(files, 'findFileInPath').returns(foundProjectJsonFile);
			sandbox.stub(fs, 'existsSync').returns(true);
			stubFile('topProjectFolder', cycleProject1Json);
			stubFile('topProjectFolder/cycle2', cycleProject2Json);
			const loader = projectLoader.create(buildProfile);
			expect(() => loader.loadProjects('./')).to.throw('Found cycle in project hierarchy');
		});

		it('throws an error if project.json cannot be read', () => {
			sandbox.stub(files, 'findFileInPath').returns(foundProjectJsonFile);
			stubFileWithLoadError('topProjectFolder', parentProjectJson);
			expect(() => projectLoader.create(buildProfile).loadProjects('./')).throw(LoadProjectError);
		});

		it('throws an error if the project object cannot be created', () => {
			sandbox.stub(project, 'create').throws(new LoadProjectError('Failed to load project from project.json'));
			sandbox.stub(files, 'findFileInPath').returns(foundProjectJsonFile);
			stubFile('topProjectFolder', singleProjectJson);
			expect(() => projectLoader.create(buildProfile).loadProjects('./')).throw(LoadProjectError);
		});

		it('throws an error if a child project listed in project.json does not exist', () => {
			expect(() => projectLoader.create(buildProfile).loadProjects('./test-data/projects/projectLoader/project-1')).to.throw('LoadProjectError: Invalid child project');
		});

		it('returns null if project config cannot be found', () => {
			sandbox.stub(files, 'findFileInPath').throws(Error);
			const projects = projectLoader.create(buildProfile).loadProjects('./');
			expect(projects).to.be.null;
		});

		it('throws an error if any loaded projects have duplicate ids', () => {
			sandbox.stub(files, 'findFileInPath').returns(foundProjectJsonFile);
			sandbox.stub(fs, 'existsSync').returns(true);
			parentProjectJson.id = 'child-1';
			childProject1Json.id = 'child-1';
			stubFile('topProjectFolder', parentProjectJson);
			stubFile('topProjectFolder/child1', childProject1Json);
			stubFile('topProjectFolder/child1/grandchild1', duplicateProjectJson);
			stubFile('topProjectFolder/child2', childProject2Json);
			const expectedError = 'LoadProjectError: Duplicate project ids found in: [path/to/root/topProjectFolder/child1/grandchild1/project.json, ' +
				'path/to/root/topProjectFolder/child1/project.json, path/to/root/topProjectFolder/project.json]';
			expect(() => projectLoader.create(buildProfile).loadProjects('./')).to.throw(expectedError);
		});
	})
});