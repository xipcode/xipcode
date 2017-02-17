import {expect} from 'chai';
import {describe, it} from 'mocha';
import fs from 'fs-extra';
import path from 'path';
import sinon from 'sinon';

import projectCreator from '../../src/projects/projectCreator';

describe('projectCreator', () => {

	describe('createProject', () => {

		let sandbox;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
		});
		afterEach(() => {
			sandbox = sandbox.restore();
		});

		it('throws an error if \'id\' is not defined', () => {
			expect(() => projectCreator.createProject({id: undefined})).to.throw('id must be defined');
		});

		it('creates a new project', () => {
			const destPath = './build/test-output';
			projectCreator.createProject({'id': 'testingId', 'basePath': destPath});
			const didCreate = fs.statSync(path.join(destPath, 'testingId')).isDirectory();
			expect(didCreate).to.be.true;
		});

		it('updates the project.json file with the given \'id\'', () => {
			const destPath = './build/test-output';
			projectCreator.createProject({'id': 'test', 'basePath': destPath});
			const projectJson = path.join(destPath, 'test', 'project.json');
			const projectObject = fs.readJSONSync(projectJson);
			expect(projectObject.id).to.equal('test');
		});

		it('throws an error if the destination folder already exists', () => {
			sandbox.stub(fs, 'existsSync').returns(true);
			expect(() => projectCreator.createProject({
				'id': 'test',
				'basePath': './build/test-output'
			})).to.throw('Project [test] already exists in this folder.');
		});
	});
});
