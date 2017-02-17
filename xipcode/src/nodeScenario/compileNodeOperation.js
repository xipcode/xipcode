import check from '../core/check';
import operation from '../model/operation';
import nodeCompiler from './nodeCompiler';
import dependency from '../core/dependency';
import nodeCore from '../core/nodeCore';

function compileNodeOperation() {
	const thisOperation = operation.create({ id: 'compile-node', logMessage: 'Compiling sources for node' });
	thisOperation.perform = ({ sourcesFolder, sourcesPattern, buildReleaseFolder, dependencies }) => {
		check.definedString('sourcesFolder',  sourcesFolder);
		check.definedString('sourcesPattern',  sourcesPattern);
		check.definedString('buildReleaseFolder',  buildReleaseFolder);
		check.definedArray('dependencies',  dependencies);
		validateDependencies(sourcesFolder, dependencies);
		return nodeCompiler.create().compile({
			sourcesPattern: sourcesPattern,
			outputFolder: buildReleaseFolder,
			srcBase: '.'
		});
	};
	return thisOperation;
}

function validateDependencies(sourcesFolder, dependencies) {
	const usedDeps = dependency.getForFolder(sourcesFolder);
	const undeclaredDeps = usedDeps.filter((dep) => {
		return !isInternalModule(dep) && !nodeCore.isCoreModule(dep) && !dependencies.includes(dep);
	});
	if (undeclaredDeps.length > 0) {
		throw new Error('The following dependencies are referenced in this project but not declared ' +
			'in its project.json: [' + undeclaredDeps.join(', ') + ']');
	}
}

function isInternalModule(moduleName) {
	return /\.\//.test(moduleName);
}

export default {
	create: compileNodeOperation
}
