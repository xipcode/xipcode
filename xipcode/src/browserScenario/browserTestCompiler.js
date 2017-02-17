import check from '../core/check';
import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import browserify from 'browserify';
import streams from '../core/streams';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import insert from 'gulp-insert';
import browserCompiler from './browserCompiler';
import files from '../core/files';
import path from 'path';

function browserTestCompiler() {
	const thisCompiler = browserCompiler.create();
	thisCompiler.compile = ({ projectId, testsFolder, outputFolder, dependencies }) => {
		check.definedString('projectId', projectId);
		check.definedString('testsFolder', testsFolder);
		check.definedString('outputFolder', outputFolder);
		check.definedArray('dependencies', dependencies);
		const entries = getEntries(testsFolder);
		const browserifyOptions = thisCompiler.getBrowserifyOptionsForEntry(entries, testsFolder);
		const stream = browserify(browserifyOptions)
			.on('package', (pkg) => {
				thisCompiler.validateImport({pkg, dependencies, projectId});
			})
			.external(dependencies)
			.bundle()
			.pipe(source(`${projectId}.tests.bundle.js`))
			.pipe(buffer())
			.pipe(sourcemaps.init({ loadMaps: true }))
			.pipe(sourcemaps.write('.', {
				includeContent: true,
				sourceRoot: path.relative(outputFolder, testsFolder)
			}))
			.pipe(buffer())
			.pipe(insert.transform(thisCompiler.addSemicolonToOutput))
			.pipe(gulp.dest(outputFolder));
		return streams.createPromiseFromStream(stream);
	};
	return thisCompiler;
}

function getEntries(testsFolder) {
	return files.walkDirectory(testsFolder)
		.filter((file) => {
			return path.extname(file) === '.js';
		}).map((file) => {
			return path.relative(testsFolder, file);
		});
}

export default {
	create: browserTestCompiler
}
