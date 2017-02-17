import check from '../core/check';
import operation from '../model/operation';
import logger from '../core/logger';
import karma from 'karma';
import path from 'path';
import fs from 'fs-extra';

function testBrowserOperation(loggers = []) {
	const thisOperation = operation.create({ id: 'test-browser', logMessage: 'Running browser tests' });
	thisOperation.perform = ({ id, buildFolder, buildProfile }) => {
		check.definedString('id', id);
		check.definedString('buildFolder', buildFolder);
		check.definedString('buildProfile', buildProfile);
		if (!testsExist(buildFolder, id)) {
			return Promise.resolve();
		}
		const karmaOpts = getKarmaOptions(buildProfile, id, buildFolder, loggers);
		return new Promise((resolve, reject) => {
			const server = new karma.Server(karmaOpts, (exitCode) => {
				if (exitCode !== 0) {
					reject(new Error('Karma test run completed with failures.'));
				}
				logger.log(`Karma exit code: ${exitCode}`);
				resolve();
			});
			server.start();
		});
	};
	return thisOperation;
}

function testsExist(buildFolder, projectId) {
	const browserTestBundle = path.join(buildFolder, 'test', 'browser',`${projectId}.tests.bundle.js`);
	return fs.existsSync(browserTestBundle);
}

function getKarmaOptions(buildProfile, projectId, buildFolder, loggers) {
	const timeout = 30000;
	const browserTestFolder = path.join('test', 'browser');
	const libraryBundle = path.join(browserTestFolder, `${projectId}.libs.bundle.js`);
	const testsBundle =  path.join(browserTestFolder, `${projectId}.tests.bundle.js`);
	const opts = {
		basePath: buildFolder,
		frameworks: ['mocha', 'chai', 'sinon'],
		reporters: ['mocha', 'coverage'],
		files: [libraryBundle, testsBundle],
		port: 9876,
		colors: true,
		autoWatch: false,
		browsers: ['PhantomJS'],
		browserNoActivityTimeout: timeout + 5000,
		singleRun: true,
		concurrency: 1,
		loggers: loggers,
		client: {
			mocha: {
				reporter: 'spec',
				timeout: timeout
			}
		},
		coverageReporter: {
			dir: 'reports',
			reporters: [
				{
					type: 'json',
					subdir: 'browser',
					file: 'coverage-instrumented.json'
				}
			],
			instrumenterOptions: {
				istanbul: { noCompact: true }
			}
		}
	};
	opts.preprocessors = {};
	opts.preprocessors[libraryBundle] = ['sourcemap'];
	opts.preprocessors[testsBundle] = ['sourcemap', 'coverage'];
	if (buildProfile === 'server') {
		opts.reporters.push('bamboo');
		opts['bambooReporter'] = {
			filename: path.join(buildFolder, 'test', 'browser', 'mocha.json')
		};
	}
	return opts;
}

export default {
	create: testBrowserOperation
}
