import {expect} from 'chai';
import {describe, it} from 'mocha';
import codebaseLoader from '../../src/projects/codebaseLoader';
import sinon from 'sinon';
import files from '../../src/core/files';
import projectLoader from '../../src/projects/projectLoader';

describe('codebaseLoader', () => {

	const buildProfile = 'local';

	describe('create', () => {

		it('creates', () => {
			const loader = codebaseLoader.create(buildProfile);
			expect(loader).not.to.be.undefined;
			expect(loader.loadProjects).not.to.be.undefined;
		})
	});

	describe('loadProjects', () => {

		let sandbox;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
		});
		afterEach(() => {
			sandbox = sandbox.restore();
		});

		it('requires folder', () => {
			expect(() => codebaseLoader.create(buildProfile).loadProjects()).to.throw('folder must be defined');
		});

		it('loads projects from the codebaseRoot', () => {
			sandbox.stub(files, 'findCodebaseRoot').returns('/path/to/codebase/root');
			sandbox.stub(projectLoader, 'create').returns({
				loadProjects() {
					return [
						{ id: 'project-1' }
					];
				}
			});
			const loader = codebaseLoader.create(buildProfile);
			expect(loader.loadProjects('/some/folder')).to.eql([
				{ id: 'project-1' }
			])
		});
	})
});