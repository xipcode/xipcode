import check from '../core/check';
import object from '../core/object';
import operation from '../model/operation';
import gulp from 'gulp';
import streams from '../core/streams';
import mocha from 'gulp-mocha';
import path from 'path';
import fs from 'fs-extra';
import istanbul from 'gulp-istanbul';

function testNodeOperation() {
	const thisOperation = operation.create({ id: 'test-node', logMessage: 'Running tests for node' });
	thisOperation.perform = ({ id, buildFolder, testsFolder, buildTestFolder, sourcesPattern, testsPattern, buildProfile }) => {
		check.definedString('id', id);
		check.definedString('buildFolder', buildFolder);
		check.definedString('testsFolder', testsFolder);
		check.definedString('buildTestFolder', buildTestFolder);
		check.definedString('sourcesPattern', sourcesPattern);
		check.definedString('testsPattern', testsPattern);
		check.definedString('buildProfile', buildProfile);
		if (!fs.existsSync(testsFolder)) {
			return Promise.resolve();
		}
		const builtSources = path.join(buildTestFolder, 'node', sourcesPattern);
		const builtTests = path.join(buildTestFolder, 'node', testsPattern);
		const buildNodeTestFolder = path.join(buildTestFolder, 'node');
		const mochaOptions = getMochaOptions(buildProfile, buildNodeTestFolder);
		const istanbulOptions = getIstanbulOptions(buildFolder);
		resetIstanbulCoverageGlobal(id);
		const stream = gulp.src([builtSources, builtTests])
			.pipe(mocha(mochaOptions))
			.pipe(istanbul.writeReports(istanbulOptions));
		return streams.createPromiseFromStream(stream);
	};
	return thisOperation;
}

function getMochaOptions(buildProfile, buildNodeTestFolder) {
	const timeout = 30000;
	const localOptions = {
		reporter: 'spec',
		timeout: timeout
	};
	const bambooOptions = {
		reporter: 'mocha-bamboo-reporter',
		reporterOptions: {
			output: path.join(buildNodeTestFolder, 'mocha.json')
		},
		timeout: timeout
	};
	return (buildProfile === 'server') ? bambooOptions : localOptions;
}

function getIstanbulOptions(buildFolder) {
	const buildNodeReportsFolder = path.join(buildFolder, 'reports', 'node');
	return {
		fail: true,
		reporters: ['json', 'html'],
		reportOpts: {
			json: {
				dir: buildNodeReportsFolder,
				file: 'coverage.json'
			},
			html: {
				dir: path.join(buildNodeReportsFolder, 'html')
			}
		}
	};
}

function resetIstanbulCoverageGlobal(id) {
	/*
	The gulp-istanbul module saves the data from a particular invocation
	of writeReports in a global variable of the form $$cov_<datetime>$$, where
	<datetime> is the current time in milliseconds. A side-effect of this is
	that subsequent invocations within the same process use the data obtained
	from previous runs. This method clears that previous data so that each xipcode
	project only gets reports for its own source code.
	 */
	const globalVar = object.getValueByKeyMatch(global, '\\$\\$cov_');
	if (globalVar) {
		for (let prop in globalVar) {
			const re = new RegExp(id, 'g');
			if (!prop.match(re)) {
				delete globalVar[prop];
			}
		}
	}
}

export default {
	create: testNodeOperation
}
