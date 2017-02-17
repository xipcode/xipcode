import check from '../core/check';
import operation from '../model/operation';
import browserTestCompiler from './browserTestCompiler';
import path from 'path';
import fs from 'fs-extra';

function compileBrowserTestsOperation() {
	const thisOperation = operation.create({ id: 'compile-browser-tests', logMessage: 'Compiling tests for browser' });
	thisOperation.perform = ({ id, testsFolder, buildTestFolder, dependencies, devDependencies }, logger) => {
		check.definedString('id', id);
		check.definedString('testsFolder', testsFolder);
		check.definedString('buildTestFolder', buildTestFolder);
		check.definedArray('dependencies', dependencies);
		check.definedArray('devDependencies', devDependencies);
		if (!fs.existsSync(testsFolder)) {
			logger.warn(`Project ${id} has no tests`);
			return Promise.resolve();
		}
		const combinedDependencies = dependencies.concat(devDependencies);
		return browserTestCompiler.create().compile({
			projectId: id,
			testsFolder: testsFolder,
			outputFolder: path.join(buildTestFolder, 'browser'),
			dependencies: combinedDependencies
		});
	};
	return thisOperation;
}

export default {
	create: compileBrowserTestsOperation
}
