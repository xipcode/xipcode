import { expect } from 'chai';
import { describe, it } from 'mocha';
import browserCompiler from '../../src/browserScenario/browserCompiler';

describe('browserCompiler', () => {

	const testCompiler = browserCompiler.create();

	const expectedTransform = [['babelify', {
		presets: ['es2015'],
		sourceMaps: true
	}]];

	describe('create', () => {

		it('returns an object', () => {
			expect(testCompiler).not.equal(undefined);
			expect(typeof testCompiler).equal('object');
		});
	});

	describe('compile', () => {

		it('requires compile to be overridden', () => {
			expect(() => testCompiler.compile()).throw('Instances must override method \'compile\'');
		});

	});

	describe('getBrowserifyOptionsForEntry', () => {

		it('requires entries', () => {
			expect(() => testCompiler.getBrowserifyOptionsForEntry(undefined, 'path/to/sources')).throw('entries must be defined');
			expect(() => testCompiler.getBrowserifyOptionsForEntry('not-an-array', 'path/to/sources')).throw('entries must be of type array.');
		});

		it('requires sourcesFolder', () => {
			expect(() => testCompiler.getBrowserifyOptionsForEntry([], undefined)).throw('sourcesFolder must be defined');
			expect(() => testCompiler.getBrowserifyOptionsForEntry([], 999)).throw('sourcesFolder must be of type string.');
		});

		it('returns browserify options for a given entry', () => {
			const testEntries = ['module.js'];
			const sourcesFolder = 'path/to/sources';
			const options = testCompiler.getBrowserifyOptionsForEntry(testEntries, sourcesFolder);
			const expectedOptions = {
				entries: testEntries,
				transform: expectedTransform,
				debug: true,
				basedir: sourcesFolder
			};
			expect(options).to.eql(expectedOptions);
		});

		it('returns browserify options with standalone option', () => {
			const testEntries = ['module.js'];
			const sourcesFolder = 'path/to/sources';
			const standalone = 'myApi';
			const options = testCompiler.getBrowserifyOptionsForEntry(testEntries, sourcesFolder, standalone);
			const expectedOptions = {
				entries: testEntries,
				transform: expectedTransform,
				debug: true,
				basedir: sourcesFolder,
				standalone: 'myApi'
			};
			expect(options).to.eql(expectedOptions);
		});

	});

	describe('addSemicolonToOutput', () => {

		it('adds a semicolon to browserified output if needed', () => {
			const testOutput = '//# sourceMappingURL=module1Test.bundle.js.map';
			const amendedOutput = testCompiler.addSemicolonToOutput(testOutput);
			expect(amendedOutput).to.equal(';\n//# sourceMappingURL=module1Test.bundle.js.map');
		});

		it('has no effect if semicolon is already present', () => {
			const testOutput = ';\n\n\n//# sourceMappingURL=module1Test.bundle.js.map';
			const amendedOutput = testCompiler.addSemicolonToOutput(testOutput);
			expect(testOutput).to.equal(amendedOutput);
		});
	});

	describe('validateImport', () => {

		let validateImportArgs;
		beforeEach(() => {
			validateImportArgs = {
				pkg: {
					name: 'package-name',
					__dirname: 'path/to/node_modules/name'
				},
				dependencies: ['package-name'],
				projectId: 'project-id'
			}
		});

		it('requires pkg', () => {
			delete validateImportArgs.pkg;
			expect(() => testCompiler.validateImport(validateImportArgs)).throw('pkg must be defined');
		});

		it('requires dependencies', () => {
			delete validateImportArgs.dependencies;
			expect(() => testCompiler.validateImport(validateImportArgs)).throw('dependencies must be defined');
		});

		it('requires projectId', () => {
			delete validateImportArgs.projectId;
			expect(() => testCompiler.validateImport(validateImportArgs)).throw('projectId must be defined');
		});

		it('does not throw an error if the imported package is not a node module', () => {
			validateImportArgs.pkg.__dirname = 'path/to/project/root';
			expect(() => testCompiler.validateImport(validateImportArgs)).not.to.throw();
		});

		it('does not throw an error if the imported node module is a declared dependency', () => {
			expect(() => testCompiler.validateImport(validateImportArgs)).not.to.throw();
		});

		it('throws an error if the imported node module is not a declared dependency', () => {
			validateImportArgs.dependencies = [];
			expect(() => testCompiler.validateImport(validateImportArgs)).to.throw('Module package-name ' +
				'is imported within project-id but is not declared as a dependency in project.json');
		});
	});
});