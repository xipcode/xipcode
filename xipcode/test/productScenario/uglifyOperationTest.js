import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import uglifyOperation from '../../src/productScenario/uglifyOperation';
import sinon from 'sinon';
import path from 'path';
import fs from 'fs-extra';

describe('uglifyOperation', () => {

	const operation = uglifyOperation.create();

	describe('create', () => {

		it('returns an object', () => {
			expect(operation).not.equal(undefined);
			expect(typeof operation).equal('object');
		});

		it('sets the operation\'s id', () => {
			expect(operation.id).equal('uglify-product-file');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Uglifying product file');
		});
	});

	describe('perform', () => {

		let sandbox;
		let project;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			project = {
				id: 'project-1',
				buildFolder: 'build/test-output/uglifyOperation/build'
			};
		});
		afterEach(() => {
			sandbox.restore()
		});

		it('requires id', () => {
			delete project.id;
			expect(() => operation.perform(project)).throw('id must be defined');
		});

		it('requires buildFolder', () => {
			delete project.buildFolder;
			expect(() => operation.perform(project)).throw('buildFolder must be defined');
		});

		it('uglifies', () => {
			fs.mkdirsSync(project.buildFolder);
			const releaseFile = path.join(project.buildFolder, `${project.id}.js`);
			const releaseFileMin = path.join(project.buildFolder, `${project.id}.min.js`);
			fs.writeFileSync(releaseFile, 'var test = 1;');
			return operation.perform(project)
				.then(() => {
					expect(fs.existsSync(releaseFileMin)).equal(true);
					const minFileContent = fs.readFileSync(releaseFileMin, 'utf-8');
					expect(minFileContent).equal('var test=1;\n//# sourceMappingURL=project-1.min.js.map\n');
				});
		});
	});
});