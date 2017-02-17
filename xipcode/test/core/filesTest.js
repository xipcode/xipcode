import { expect } from 'chai';
import { describe, it } from 'mocha';
import files from '../../src/core/files'
import fs from 'fs-extra';
import path from 'path';
import sinon from 'sinon';

describe('files', () => {

	const testDataDir = path.join('test-data', 'core', 'files');
	const testDataDirRegex = /xipcode\/test-data\/core\/files/;
	const buildTestOutputDir = './build/test-output';

	let sandbox;
	beforeEach(() => {
		sandbox = sinon.sandbox.create();
	});
	afterEach(() => {
		sandbox.restore();
	});

	describe('findFileInPath', () => {

		it('requires fileName', function() {
			expect(() => { files.findFileInPath() }).throw('fileName must be defined');
		});

		it('requires startPath', function() {
			expect(() => { files.findFileInPath('file.txt') }).throw('startPath must be defined');
		});

		it('returns true for file found in start path', function() {
			const searchPath = path.join(testDataDir, 'testDirectory');
			const foundFile = files.findFileInPath('file2.txt', searchPath);
			expect(foundFile).not.equal(undefined);
			const match = /xipcode\/test-data\/core\/files\/testDirectory\/file2.txt/.test(foundFile);
			expect(match).equal(true);
		});

		it('returns true for file found in start path\'s parent', function() {
			const searchPath = path.join(testDataDir, 'testDirectory');
			const foundFile = files.findFileInPath('file1.txt', searchPath);
			expect(foundFile).not.equal(undefined);
			const match = /xipcode\/test-data\/core\/files\/file1.txt/.test(foundFile);
			expect(match).equal(true);
		});

		it('throws an exception for file not found', function() {
			const searchPath = path.join(testDataDir, 'testDirectory');
			const fileName = 'not-a-file-that-will-exist-anywhere';
			const expectedMessage = 'File \'not-a-file-that-will-exist-anywhere\' not found';
			expect(() => files.findFileInPath(fileName, searchPath)).throw(expectedMessage);
		});
	});

	describe('updateJsonFile', () => {

		it('updates a kvp in a given json file', () => {
			const jsonFile = path.join(testDataDir, 'test.json');
			const testJsonFile = path.join(buildTestOutputDir, 'test.json');
			fs.copySync(jsonFile, testJsonFile);

			const oldValue = fs.readJSONSync(testJsonFile).someKey;
			expect(oldValue).to.equal('someValue');

			files.updateJsonFile({
				file: testJsonFile,
				key: 'someKey',
				value: 'newValue'
			});
			const newValue = fs.readJSONSync(testJsonFile).someKey;
			expect(newValue).to.equal('newValue');

		});
	});

	describe('findCodebaseRoot', () => {

		it('requires startPath', function() {
			expect(() => { files.findCodebaseRoot(undefined) }).throw('startPath must be defined');
		});

		it('finds codebase root from codebase root', function() {
			const codebaseRoot = files.findCodebaseRoot(testDataDir);
			expect(testDataDirRegex.test(codebaseRoot)).equals(true);
		});

		it('finds codebase root from codebase subfolder', function() {
			const testDirectory = path.join(testDataDir, 'testDirectory');
			const codebaseRoot = files.findCodebaseRoot(testDirectory);
			expect(testDataDirRegex.test(codebaseRoot)).equals(true);
		});
	});

	describe('isFileNewer', () => {

		it('requires file1', function() {
			expect(() => { files.isFileNewer(undefined) }).throw('file1 must be defined');
		});

		it('requires file2', function() {
			expect(() => { files.isFileNewer('file1', undefined) }).throw('file2 must be defined');
		});

		it('return true for newer file', function() {
			const stub = sandbox.stub(fs, 'statSync');
			stub.withArgs('file1').returns({ ctime: new Date(100) });
			stub.withArgs('file2').returns({ ctime: new Date(50) });
			expect(files.isFileNewer('file1', 'file2')).equal(true);
		});

		it('return false for older file', function() {
			const stub = sandbox.stub(fs, 'statSync');
			stub.withArgs('file1').returns({ ctime: new Date(50) });
			stub.withArgs('file2').returns({ ctime: new Date(100) });
			expect(files.isFileNewer('file1', 'file2')).equal(false);
		});

		it('return false for same timestamp file', function() {
			const stub = sandbox.stub(fs, 'statSync');
			stub.withArgs('file1').returns({ ctime: new Date(100) });
			stub.withArgs('file2').returns({ ctime: new Date(100) });
			expect(files.isFileNewer('file1', 'file2')).equal(false);
		});
	});

	describe('walkDirectory', () => {

		const walkTestDirectory = path.join(testDataDir, 'walkTestDirectory');

		it('recursively lists all files in directory', () => {
			const allFiles = files.walkDirectory(walkTestDirectory);
			expect(allFiles.length).to.equal(7);
			expect(allFiles).to.eql([
				'test-data/core/files/walkTestDirectory/top1/middle1/bottom1/bottomFile1',
				'test-data/core/files/walkTestDirectory/top1/middle1/middleFile1',
				'test-data/core/files/walkTestDirectory/top1/middle1/middleFile2',
				'test-data/core/files/walkTestDirectory/top1/topFile1',
				'test-data/core/files/walkTestDirectory/top2/middle2/middleFile1',
				'test-data/core/files/walkTestDirectory/top2/middle2/middleFile2',
				'test-data/core/files/walkTestDirectory/top2/topFile1'
			]);
		});

	});
});