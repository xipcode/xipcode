import check from '../core/check';
import operation from '../model/operation';
import path from 'path';
import browserDependencyConcatenator from '../core/browserDependencyConcatenator';

function collectBrowserLibrariesOperation(polyfill) {
	check.definedObject('polyfill', polyfill);
	const thisOperation = operation.create({ id: 'collect-browser-libraries', logMessage: 'Collecting browser libraries' });
	thisOperation.perform = ({ id, codebaseRoot, nodeModulesFolder, browserLibsFolder, buildFolder, dependencies, devDependencies }) => {
		check.definedString('id', id);
		check.definedString('codebaseRoot', codebaseRoot);
		check.definedString('buildFolder', buildFolder);
		check.definedString('nodeModulesFolder', nodeModulesFolder);
		check.definedString('browserLibsFolder', browserLibsFolder);
		check.definedArray('dependencies', dependencies);
		check.definedArray('devDependencies', devDependencies);

		const projectTestFolder = path.join(buildFolder, 'test', 'browser');
		const concatenator = browserDependencyConcatenator.create();
		return concatenator.concat({
			polyfill,
			codebaseRoot,
			nodeModulesFolder,
			browserLibsFolder,
			dependencies,
			devDependencies,
			targetFolder: projectTestFolder,
			fileName: `${id}.libs.bundle.js`

		});
	};
	return thisOperation;
}

export default {
	create: collectBrowserLibrariesOperation
}
