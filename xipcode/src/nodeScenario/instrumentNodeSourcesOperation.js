import check from '../core/check';
import operation from '../model/operation';
import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import istanbul from 'gulp-istanbul';
import streams from '../core/streams';
import path from 'path';
import fs from 'fs-extra';

const srcOptions = {
	base: '.'
};

const writeOptions = {
	includeContent: true,
	sourceRoot: '../..'
};

const istanbulOptions = {
	esModules: true
};

function instrumentNodeSourcesOperation() {
	const thisOperation = operation.create({ id: 'instrument-node-sources', logMessage: 'Instrumenting sources for node' });
	thisOperation.perform = ({ testsFolder, buildFolder, buildTestFolder, sourcesPattern }) => {
		check.definedString('testsFolder', testsFolder);
		check.definedString('buildFolder', buildFolder);
		check.definedString('buildTestFolder', buildTestFolder);
		check.definedString('sourcesPattern', sourcesPattern);
		if (!fs.existsSync(testsFolder)) {
			return Promise.resolve();
		}
		const buildInstrumentFolder = path.join(buildTestFolder, 'node', 'instrument');
		const sourcesPath = path.resolve(sourcesPattern);
		const stream = gulp.src(sourcesPath, srcOptions)
			.pipe(sourcemaps.init({ loadMaps: true }))
			.pipe(istanbul(istanbulOptions))
			.pipe(sourcemaps.write('.', writeOptions))
			.pipe(gulp.dest(buildInstrumentFolder));
		return streams.createPromiseFromStream(stream);
	};
	return thisOperation;
}

export default {
	create: instrumentNodeSourcesOperation
}
