import check from '../core/check';
import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';
import streams from '../core/streams';

const writeOptions = {
	includeContent: true,
	sourceRoot: '../../..'
};

const babelOptions = {
	presets: ['es2015']
};

function nodeCompiler() {
	return {
		compile({ srcBase, sourcesPattern, outputFolder }) {
			check.definedString('srcBase', srcBase);
			check.definedString('sourcesPattern', sourcesPattern);
			check.definedString('outputFolder', outputFolder);
			const srcOptions = {
				base: srcBase
			};
			const stream = gulp.src([sourcesPattern], srcOptions)
					.pipe(sourcemaps.init({ loadMaps: true }))
					.pipe(babel(babelOptions))
					.pipe(sourcemaps.write('.', writeOptions))
					.pipe(gulp.dest(outputFolder));
			return streams.createPromiseFromStream(stream);
		}
	}
}

export default {
	create: nodeCompiler
}
