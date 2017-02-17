import check from '../core/check';
import { join } from 'path';
import files from '../core/files';

function project({ id, version, main, bin, scenarioIds, rootFolder, dependencies = [], devDependencies = [], projects = [], lint, browserCompiler, buildProfile }) {
	check.definedString('id', id);
	check.definedArray('scenarioIds', scenarioIds);
	check.definedString('rootFolder', rootFolder);
	check.definedArray('dependencies', dependencies);
	check.definedArray('devDependencies', devDependencies);
	check.definedArray('projects', projects);
	check.definedString('buildProfile', buildProfile);

	const buildFolder = 'build';
	const buildReleaseFolder = join(buildFolder, 'release');
	const buildTestFolder = join(buildFolder,  'test');
	const sourcesFolder = 'src';
	const testsFolder = 'test';
	const sourcesPattern = join(sourcesFolder, '**/*.js');
	const testsPattern = join(testsFolder, '**/*.js');
	const codebaseRoot = files.findCodebaseRoot(rootFolder);
	const nodeModulesFolder = join(codebaseRoot, 'node_modules');
	const browserLibsFolder = join(codebaseRoot, buildFolder, 'browser-libs');

	return {
		id,
		version: checkVersion(version),
		main,
		bin,
		scenarioIds,
		rootFolder,
		dependencies,
		devDependencies,
		projects,
		lint: checkLint(lint),
		browserCompiler: checkBrowserCompiler(browserCompiler),
		buildFolder,
		buildReleaseFolder,
		buildTestFolder,
		sourcesFolder,
		sourcesPattern,
		testsFolder,
		testsPattern,
		codebaseRoot,
		nodeModulesFolder,
		browserLibsFolder,
		buildProfile
	}
}

function checkVersion(version) {
	return version || '1.0.0-latest';
}

function checkLint(lint) {
	let excludes = [];
	if (lint && lint.excludes) {
		excludes =  check.definedArray('lint.excludes', lint.excludes);
	}
	return { excludes };
}

function checkBrowserCompiler(browserCompiler) {
	if (browserCompiler) {
		check.definedString('browserCompiler.standalone', browserCompiler.standalone);
		return browserCompiler;
	}
	return {};
}

export default {
	create: project
}
