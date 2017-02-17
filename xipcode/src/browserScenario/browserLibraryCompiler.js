import check from '../core/check';
import browserCompiler from './browserCompiler';
import browserify from 'browserify';
import sourcemaps from 'gulp-sourcemaps';
import insert from 'gulp-insert';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import streams from '../core/streams';
import gulp from 'gulp';
import path from 'path';

// Avoid name shadowing for the compiler's 'require' parameter.
const resolve = require.resolve;

function browserLibraryCompiler() {
	const thisCompiler = browserCompiler.create();
	thisCompiler.compile = ({ outputFolder, targetFileName, require, codebaseRoot }) => {
		check.definedString('require', require);
		check.definedString('outputFolder', outputFolder);
		check.definedString('targetFileName', targetFileName);
		check.definedString('codebaseRoot', codebaseRoot);
		const browserifyOptions = thisCompiler.getBrowserifyOptionsForEntry([], codebaseRoot);
		let stream = browserify(browserifyOptions)
			.require(require)
			.bundle()
			.pipe(source(targetFileName))
			.pipe(buffer())
			.pipe(sourcemaps.init({ loadMaps: true }))
			.pipe(sourcemaps.write('.', {
				includeContent: true,
				mapSources: function(sourcePath) {
					if (path.basename(sourcePath) === require) {
						const entryPoint = resolve(require);
						return path.relative(codebaseRoot, entryPoint);
					}
					return sourcePath;
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

export default {
	create: browserLibraryCompiler
}