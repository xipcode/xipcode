import { expect } from 'chai';
import { describe, it } from 'mocha';
import gulp from 'gulp';
import streams from '../../src/core/streams'
import { Writable } from 'stream';
import fs from 'fs-extra';
import * as path from 'path';
import sinon from 'sinon';

describe('streams', () => {

	describe('createPromiseFromStream', () => {

		const sourceDir = 'test-data/core/streams';
		const sourceFileName = 'file.txt';
		const targetDir = 'build/test-output/core/streams';

		let sandbox;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('requires stream', () => {
			expect(() => streams.createPromiseFromStream()).throw('stream must be defined');
		});

		it('creates a promise that resolves for a given transform stream', () => {
			const stream = gulp.src(path.join(sourceDir, sourceFileName))
				.pipe(gulp.dest(targetDir));
			const promise = streams.createPromiseFromStream(stream);
			return promise.then(() => {
				const targetFile = path.join(targetDir, sourceFileName);
				expect(fs.existsSync(targetFile)).equal(true);
			});
		});

		it('creates a promise that resolves for a given writable stream', () => {
			const stream = gulp.src(path.join(sourceDir, sourceFileName));
			return streams.createPromiseFromStream(stream);
		});

		it('listens for events', () => {
			const stream = { on() {} };
			const stub = sandbox.stub(stream , 'on');
			streams.createPromiseFromStream(stream);
			sinon.assert.callCount(stub, 4);
			sinon.assert.calledWith(stub, 'end');
			sinon.assert.calledWith(stub, 'finish');
			sinon.assert.calledWith(stub, 'error');
			sinon.assert.calledWith(stub, 'readable');
		});

		it('creates a promise that rejects', (done) => {
			const errorMessage = 'Extreme Error';
			const writableStream = Writable({ objectMode: true });
			writableStream._write = function(chunk, enc, next) {
				this.emit('error', errorMessage);
			};
			const stream = gulp.src('test-data/core/streams/file.txt')
				.pipe(writableStream);
			const promise = streams.createPromiseFromStream(stream);
			promise.catch((error) => {
				expect(error).equal(errorMessage);
				done();
			});
		});
	});
});