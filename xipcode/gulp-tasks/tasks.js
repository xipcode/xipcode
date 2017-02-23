'use strict';

const os = require('os');
const path = require('path');
const gulp = require('gulp');
const clean = require('gulp-clean');
const eslint = require('gulp-eslint');
const sequence = require('gulp-sequence');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const sourcemapSupport = require('source-map-support');
const compiler = require('./compiler');
const instrumenter = require('./instrumenter');
const childProcess = require('child_process');
const fs = require('fs-extra');

const buildFolder = 'build';
const resourcesFolder = 'resources';
const sourcesPattern = 'src/**/*.js';
const testsPattern = 'test/**/*.js';
const integrationTestsPattern = 'integration/**/*.js';
const buildReleaseFolder = path.join(buildFolder, 'release');
const buildInstrumentFolder = path.join(buildFolder, 'instrument');
const buildTestFolder = path.join(buildFolder, 'test');
const buildTestDataFolder = path.join(buildTestFolder, 'test-output');
const builtSources = path.join(buildTestFolder, sourcesPattern);
const instrumentedSources = path.join(buildInstrumentFolder, sourcesPattern);
const builtTests = path.join(buildTestFolder, testsPattern);
const builtIntegrationTests = path.join(buildTestFolder, 'integration/**/*.js');
const babelCompiler = compiler.create();
const istanbulInstrumenter = instrumenter.create();

const mochaOptions = {
	reporter: 'spec',
	timeout: 10000
};

const mochaIntegrationTestOptions = Object.assign({}, mochaOptions);

const istanbulOptions = {
	fail: true,
	reporters: ['json', 'html'],
	reportOpts: {
		json: {
			dir: path.join(buildFolder, 'reports'),
			file: 'coverage.json'
		},
		html: {
			dir: path.join(buildFolder, 'reports', 'html')
		}
	}
};

gulp.task('clean', () => {
	return gulp.src(buildFolder)
		.pipe(clean());
});

gulp.task('log-environment', () => {
	console.log('Operating System Type     : ' + os.type());
	console.log('Operating System Release  : ' + os.release());
	console.log('Hostname                  : ' + os.hostname());
	console.log('Free System Memory        : ' + os.freemem());
	console.log('Node Version              : ' + process.versions.node);
});

gulp.task('initialize', () => {
	fs.mkdirsSync(buildFolder);
});

gulp.task('lint', () => {
	return gulp.src([sourcesPattern, testsPattern])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('compile:release', () => {
	return babelCompiler.compile({
		sourcesPattern,
		outputFolder: buildReleaseFolder,
		srcBase: '.'
	});
});

gulp.task('compile:instrument:src', () => {
	return istanbulInstrumenter.instrument({
		sourcesPattern: sourcesPattern,
		outputFolder: buildInstrumentFolder
	});
});

gulp.task('compile:test:src', () => {
	return babelCompiler.compile({
		sourcesPattern: instrumentedSources,
		outputFolder: buildTestFolder,
		srcBase: buildInstrumentFolder
	});
});

gulp.task('compile:test:unit', () => {
	return babelCompiler.compile({
		sourcesPattern: testsPattern,
		outputFolder: buildTestFolder,
		srcBase: '.'
	});
});

gulp.task('compile:test:integration', () => {
	return babelCompiler.compile({
		sourcesPattern: integrationTestsPattern,
		outputFolder: buildTestFolder,
		srcBase: '.'
	});
});

gulp.task('compile:test:resources', () => {
	copyResources(buildTestFolder);
});

gulp.task('test:unit', () => {
	sourcemapSupport.install();
	fs.mkdirSync(buildTestDataFolder);
	return gulp.src([builtSources, builtTests])
		.pipe(mocha(mochaOptions))
		.pipe(istanbul.writeReports(istanbulOptions));
});

gulp.task('test:integration', () => {
	const options = Object.assign({}, mochaOptions);
	return gulp.src([builtSources, builtIntegrationTests])
		.pipe(mocha(mochaIntegrationTestOptions));
});

function copyPackageJson() {
	const packageJson = fs.readJsonSync('package.json');
	delete packageJson.devDependencies;
	const targetFile = path.join(buildReleaseFolder, 'package.json');
	fs.writeJsonSync(targetFile, packageJson);
}

function copyNpmFiles() {
	return gulp.src(['../README.md', '../LICENSE'])
		.pipe(gulp.dest(buildReleaseFolder));
}

function copyResources(dest) {
	return gulp.src(path.join(resourcesFolder, '**/*'))
		.pipe(gulp.dest(path.join(dest, 'resources')));
}

function copyImages() {
	return gulp.src(['img/xipcode-logo-250x100.png'])
		.pipe(gulp.dest(path.join(buildReleaseFolder, 'img')));
}

function createDistributionFile() {
	const options = {
		cwd: buildFolder
	};
	const callback = (error, stdout, stderr) => {
		if (error) {
			console.log('Error packing release folder: ' + error);
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
		}
	};
	childProcess.execSync('npm pack release', options, callback);
}

function verifyDistributionFile() {
	const packageJson = fs.readJsonSync('package.json');
	const version = packageJson.version;
	const expectedFile = path.join(buildFolder, 'xipcode-' + version + '.tgz');
	if (!fs.existsSync(expectedFile)) {
		throw new Error('Distribution file not found: ' + expectedFile);
	}
}

gulp.task('package:resources', () => {
	return copyResources(buildReleaseFolder);
});

gulp.task('package', ['package:resources'], () => {
	copyPackageJson();
	copyNpmFiles();
	copyImages();
	createDistributionFile();
	verifyDistributionFile();
});

gulp.task('default', sequence(
	'clean',
	'log-environment',
	'initialize',
	'lint',
	'compile:release',
	'compile:instrument:src',
	'compile:test:src',
	'compile:test:unit',
	'compile:test:integration',
	'compile:test:resources',
	'test:unit',
	'test:integration',
	'package'
));

gulp.task('bamboo', () => {
	mochaOptions.reporter = 'mocha-bamboo-reporter';
	mochaOptions.reporterOptions = {
		output: path.join(buildFolder, 'mocha-unit-test-results.json')
	};
	mochaIntegrationTestOptions.reporter  = mochaOptions.reporter;
	mochaIntegrationTestOptions.reporterOptions  = {
		output: path.join(buildFolder, 'mocha-integration-test-results.json')
	};
	gulp.start('default');
});
