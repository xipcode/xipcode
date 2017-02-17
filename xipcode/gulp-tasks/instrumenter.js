'use strict';

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const istanbul = require('gulp-istanbul');

const srcOptions = {
	base: '.'
};

const istanbulOptions = {
	esModules: true
};

const writeOptions = {
	includeContent: false,
	sourceRoot: '../..'
};

function instrumenter() {
	return {
		instrument(opts) {
			return gulp.src([opts.sourcesPattern], srcOptions)
				.pipe(sourcemaps.init({ loadMaps: true }))
				.pipe(istanbul(istanbulOptions))
				.pipe(sourcemaps.write('.', writeOptions))
				.pipe(gulp.dest(opts.outputFolder));
		}
	}
}

module.exports.create = instrumenter;