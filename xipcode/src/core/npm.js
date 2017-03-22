import check from '../core/check';
import fs from 'fs-extra';
import path from 'path';
import topologicalSorter from './topologicalSorter';

function install(codebaseRoot, installFromFolder) {
	check.definedString('codebaseRoot', codebaseRoot);
	check.definedString('installFromFolder', installFromFolder);
	if (!fs.existsSync(installFromFolder)) {
		throw new Error(`npm install folder does not exist: ${installFromFolder}`);
	}
	const packageJsonFile = path.join(installFromFolder, 'package.json');
	const packageJson = fs.readJsonSync(packageJsonFile);
	const moduleFolder = path.join(codebaseRoot, 'node_modules', packageJson.name);
	fs.mkdirsSync(moduleFolder);
	return new Promise((resolve, reject) => {
		fs.copy(installFromFolder, moduleFolder, (error) => {
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		});
	});
}

function uninstall(codebaseRoot, packageName) {
	check.definedString('codebaseRoot', codebaseRoot);
	check.definedString('packageName', packageName);
	const moduleFolder = path.join(codebaseRoot, 'node_modules', packageName);
	if (!fs.existsSync(moduleFolder)) {
		return Promise.resolve();
	}
	return new Promise((resolve, reject) => {
		fs.remove(moduleFolder, (error) => {
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		})
	});
}

function getTransitiveDependencies(nodeModulesFolder, moduleNames) {
	check.definedString('nodeModulesFolder', nodeModulesFolder);
	check.definedArray('moduleNames', moduleNames);
	const transitiveDependencies = visitTransitiveDependencies(nodeModulesFolder, moduleNames, new Set());
	return topologicalSorter.sort(transitiveDependencies);
}

function visitTransitiveDependencies(nodeModulesFolder, moduleNames, visited) {
	const allModules = {};
	moduleNames.forEach((moduleName) => {
		if (!visited.has(moduleName)) {
			visited.add(moduleName);
			const dependencies = readProjectDependencies(nodeModulesFolder, moduleName);
			allModules[moduleName] = dependencies;
			const transitiveDependencies = visitTransitiveDependencies(nodeModulesFolder, dependencies, visited);
			Object.assign(allModules, transitiveDependencies);
		}
	});
	return allModules;
}

function readProjectDependencies(nodeModulesFolder, moduleName) {
	const moduleFolder = path.join(nodeModulesFolder, moduleName);
	checkModuleExists(moduleFolder, moduleName);
	let dependencies = [];
	const projectJsonFile = path.join(moduleFolder, 'project.json');
	if (fs.existsSync(projectJsonFile)) {
		const projectJson = fs.readJsonSync(projectJsonFile, 'utf-8');
		if (projectJson.dependencies) {
			dependencies = dependencies.concat(projectJson.dependencies);
		}
		if (projectJson.devDependencies) {
			dependencies = dependencies.concat(projectJson.devDependencies);
		}
	}
	return dependencies;
}

function checkModuleExists(moduleFolder, moduleName) {
	if (!fs.existsSync(moduleFolder)) {
		throw new Error(`Folder for module ${moduleName} does not exist: ${moduleFolder}`);
	}
}

function isXipcodeModule(nodeModulesFolder, moduleName) {
	const moduleFolder = path.join(nodeModulesFolder, moduleName);
	const projectJsonFile = path.join(moduleFolder, 'project.json');
	return fs.existsSync(projectJsonFile);
}

export default {
	install,
	uninstall,
	getTransitiveDependencies,
	isXipcodeModule
}
