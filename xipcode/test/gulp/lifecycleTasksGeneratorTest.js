import {expect} from 'chai';
import {describe, it} from 'mocha';
import sinon from 'sinon';
import mockGulp from './mockGulp';
import lifecycleTasksGenerator from '../../src/gulp/lifecycleTasksGenerator';
import phaseTasksGenerator from '../../src/gulp/phaseTasksGenerator';

describe('lifecycleTasksGenerator', () => {

	describe('create', () => {

		it('requires watchEnabled', () => {
			expect(() => lifecycleTasksGenerator.create(undefined)).throw('watchEnabled must be defined');
		});
	});

	describe('generate', () => {

		const generator = lifecycleTasksGenerator.create(true);
		const mockProject = {};

		let sandbox;
		let gulp;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			gulp = mockGulp.create(sandbox);
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('requires projects', () => {
			expect(() => generator.generate(undefined)).throw('projects must be defined');
		});

		it('generates gulp tasks', () => {
			const generateStub = sandbox.stub(phaseTasksGenerator, 'generate');
			const projects = [mockProject];
			generator.generate(projects);
			sinon.assert.calledTwice(generateStub);
			sinon.assert.calledWith(generateStub, {
				projects: projects,
				lifecycle: sinon.match.any,
				watchEnabled: true
			});
		});
	});
});
