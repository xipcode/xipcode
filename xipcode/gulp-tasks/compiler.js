'use strict';

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');

const writeOptions = {
	includeContent: false,
	sourceRoot: '../..'
};

const babelOptions = {
	presets: ['es2015']
};

function compiler() {
	return {
		compile(opts) {
			const srcOptions = {
				base: opts.srcBase
			};
			return gulp.src([opts.sourcesPattern], srcOptions)
				.pipe(sourcemaps.init({ loadMaps: true }))
				.pipe(babel(babelOptions))
				.pipe(sourcemaps.write('.', writeOptions))
				.pipe(gulp.dest(opts.outputFolder))
		}
	}
}

module.exports.create = compiler;