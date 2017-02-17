import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import remapCoverageReportOperation from '../../src/browserScenario/remapCoverageReportOperation';
import fs from 'fs-extra';
import path from 'path';

describe('remapCoverageReportOperation', () => {

	const testBuildFolder = 'test-data/buildLifecycle/remapCoverageReportOperation';
	const buildTestOutputFolder = 'build/test-output/buildLifecycle/remapCoverageReportOperation';

	const operation = remapCoverageReportOperation.create();

	describe('create', () => {

		it('returns an object', () => {
			expect(operation).not.equal(undefined);
			expect(typeof operation).equal('object');
		});

		it('sets the operation\'s id', () => {
			expect(operation.id).equal('remap-coverage-report');
		});

		it('sets the operation\'s logMessage', () => {
			expect(operation.logMessage).equal('Remapping code coverage report');
		});
	});

	describe('perform', () => {

		let project;
		beforeEach(() => {
			project = {
				buildFolder: 'build'
			};
		});

		it('requires buildFolder', () => {
			delete project.buildFolder;
			expect(() => operation.perform(project)).throw('buildFolder must be defined');
		});

		it('creates report', () => {
			fs.copySync(testBuildFolder, buildTestOutputFolder);
			project.buildFolder = path.join(buildTestOutputFolder, 'test-build');
			const promise = operation.perform(project);
			expect(promise instanceof Promise).equals(true);
			return promise.then(() => {
				const reportHtml = path.join(buildTestOutputFolder, 'test-build', 'reports', 'browser', 'coverage-html', 'index.html');
				expect(fs.existsSync(reportHtml)).equals(true);
			});
		});
	});
});