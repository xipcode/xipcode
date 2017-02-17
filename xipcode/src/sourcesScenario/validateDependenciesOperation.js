import operation from '../model/operation';
import check from '../core/check';
import path from 'path';
import fs from 'fs-extra';
import nodeCore from '../core/nodeCore';

function validateDependenciesOperation() {
	const thisOperation = operation.create({ id: 'validate-dependencies', logMessage: 'Validating dependencies'});
	thisOperation.perform = ({ dependencies, devDependencies, nodeModulesFolder, codebaseRoot }) => {
		check.definedArray('dependencies', dependencies);
		check.definedArray('devDependencies', devDependencies);
		check.definedString('nodeModulesFolder', nodeModulesFolder);
		check.definedString('codebaseRoot', codebaseRoot);
		const allDependencies = dependencies.concat(devDependencies);
		allDependencies.map((dependencyName) => {
			const moduleFolder = path.join(nodeModulesFolder, dependencyName);
			checkModuleExists(moduleFolder, dependencyName, codebaseRoot);
		});
		return Promise.resolve();
	};
	return thisOperation;
}

function checkModuleExists(dependencyFolder, dependencyName, codebaseRoot) {
	if (!fs.existsSync(dependencyFolder) && !nodeCore.isCoreModule(dependencyName)) {
		throw new Error(`Dependency [${dependencyName}] is not installed. ` +
			'If this is a Xipcode project, you probably need to run \`gulp install\` on it. ' +
			`Otherwise, run \`npm install\` from ${codebaseRoot}.`);
	}
}

export default {
	create: validateDependenciesOperation
}
