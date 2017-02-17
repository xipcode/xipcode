import check from '../core/check';
import operation from '../model/operation';
import browserDependencyConcatenator from '../core/browserDependencyConcatenator';

function createProductFileOperation(polyfill) {
	check.definedObject('polyfill', polyfill);
	const thisOperation = operation.create({ id: 'create-product-file', logMessage: 'Creating product file' });
	thisOperation.perform = ({ id, codebaseRoot, buildFolder, nodeModulesFolder, browserLibsFolder, dependencies, devDependencies }) => {
		check.definedString('id', id);
		check.definedString('codebaseRoot', codebaseRoot);
		check.definedString('buildFolder', buildFolder);
		check.definedString('nodeModulesFolder', nodeModulesFolder);
		check.definedString('browserLibsFolder', browserLibsFolder);
		check.definedArray('dependencies', dependencies);
		check.definedArray('devDependencies', devDependencies);

		const concatenator = browserDependencyConcatenator.create();
		return concatenator.concat({
			polyfill,
			codebaseRoot,
			nodeModulesFolder,
			browserLibsFolder,
			dependencies,
			devDependencies,
			targetFolder: buildFolder,
			fileName: `${id}.js`
		});
	};
	return thisOperation;
}

export default {
	create: createProductFileOperation
}
