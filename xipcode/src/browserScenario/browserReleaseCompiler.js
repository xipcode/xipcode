import check from '../core/check';
import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import browserify from 'browserify';
import streams from '../core/streams';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import insert from 'gulp-insert';
import browserCompiler from './browserCompiler';
import path from 'path';

function browserReleaseCompiler() {
	const thisCompiler = browserCompiler.create();
	thisCompiler.compile = ({ projectId, rootFolder, main, standalone, outputFolder, dependencies, codebaseRoot }) => {
		check.definedString('projectId', projectId);
		check.definedString('rootFolder', rootFolder);
		check.definedString('main', main);
		check.definedString('outputFolder', outputFolder);
		check.definedArray('dependencies', dependencies);
		check.definedString('codebaseRoot', codebaseRoot);
		const browserifyOptions = thisCompiler.getBrowserifyOptionsForEntry([], '.', standalone);
		const stream = browserify(browserifyOptions)
			.on('package', (pkg) => {
				thisCompiler.validateImport({pkg, dependencies, projectId});
			})
			.require(getEntryPoint(rootFolder, main), { expose: projectId })
			.external(dependencies)
			.bundle()
			.pipe(source(`${projectId}.bundle.js`))
			.pipe(buffer())
			.pipe(sourcemaps.init({loadMaps: true}))
			.pipe(sourcemaps.write('.', {
				includeContent: true,
				mapSources: (sourcePath) => {
					const pathToRootFolder = path.relative(codebaseRoot, rootFolder);
					if (pathToRootFolder === rootFolder) {
						return sourcePath;
					}
					return path.join(pathToRootFolder, sourcePath);
				},
				sourceRoot: path.relative(outputFolder, codebaseRoot)
			}))
			.pipe(buffer())
			.pipe(insert.transform(thisCompiler.addSemicolonToOutput))
			.pipe(gulp.dest(outputFolder));

		return streams.createPromiseFromStream(stream);
	};
	return thisCompiler;
}

function getEntryPoint(rootFolder, main) {
	const entryPoint = path.join(rootFolder, main);
	if (entryPoint.match(/^\/.*/)) {
		return entryPoint;
	}
	// Browserify cannot resolve the relative path without the leading dot
	return './' + entryPoint;
}

export default {
	create: browserReleaseCompiler
}
