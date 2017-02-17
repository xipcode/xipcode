import check from '../core/check';
import operation from '../model/operation';
import fs from 'fs-extra';
import path from 'path';
import npm from '../core/npm';
import files from '../core/files';
import browserLibraryCompiler from './browserLibraryCompiler';

function compileBrowserLibrariesOperation() {
	const thisOperation = operation.create({ id: 'compile-browser-libraries', logMessage: 'Compiling browser libraries' });
	thisOperation.perform = ({ codebaseRoot, dependencies, devDependencies }) => {
		check.definedString('codebaseRoot', codebaseRoot);
		check.definedArray('dependencies', dependencies);
		check.definedArray('devDependencies', devDependencies);

		const nodeModulesFolder = path.join(codebaseRoot, 'node_modules');
		const browserLibsFolder = path.join(codebaseRoot, 'build', 'browser-libs');
		const allDependencies = dependencies.concat(devDependencies);
		const transitiveDependencies = npm.getTransitiveDependencies(nodeModulesFolder, allDependencies);
		return compileModules(nodeModulesFolder, browserLibsFolder, transitiveDependencies, codebaseRoot);
	};
	return thisOperation;
}

function compileModules(nodeModulesFolder, browserLibsFolder, moduleNames, codebaseRoot) {
	const promises = [];
	moduleNames.forEach((moduleName) => {
		const moduleFolder = path.join(nodeModulesFolder, moduleName);
		checkModuleExists(moduleFolder, moduleName);

		const bundleFileName = `${moduleName}.bundle.js`;
		const bundleFile = path.join(browserLibsFolder, bundleFileName);
		const compilationNeeded = isCompilationNeeded(moduleFolder, bundleFile);
		if (compilationNeeded) {
			const promise = browserLibraryCompiler.create().compile({
				outputFolder: browserLibsFolder,
				targetFileName: bundleFileName,
				require: moduleName,
				codebaseRoot: codebaseRoot
			});
			promises.push(promise);
		}
	});
	return Promise.all(promises);
}

function isCompilationNeeded(moduleFolder, bundleFile) {
	const projectJsonFile = path.join(moduleFolder, 'project.json');
	if (fs.existsSync(projectJsonFile)) {
		return false;
	} else if (!fs.existsSync(bundleFile)) {
		return true;
	} else if (files.isFileNewer(moduleFolder, bundleFile)) {
		return true;
	}
	return false;
}

function checkModuleExists(moduleFolder, moduleName) {
	if (!fs.existsSync(moduleFolder)) {
		throw new Error(`Folder for module ${moduleName} does not exist: ${moduleFolder}`);
	}
}

export default {
	create: compileBrowserLibrariesOperation
}
