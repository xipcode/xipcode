import check from '../core/check';
import operation from '../model/operation';
import browserReleaseCompiler from './browserReleaseCompiler';

function compileBrowserOperation() {
	const thisOperation = operation.create({ id: 'compile-browser', logMessage: 'Compiling sources for browser' });
	thisOperation.perform = ({ id, rootFolder, main, browserCompiler, buildReleaseFolder, dependencies, codebaseRoot }) => {
		check.definedString('id',  id);
		check.definedString('rootFolder',  rootFolder);
		check.definedString('main',  main);
		check.definedObject('browserCompiler',  browserCompiler);
		check.definedString('buildReleaseFolder',  buildReleaseFolder);
		check.definedArray('dependencies',  dependencies);
		check.definedString('codebaseRoot', codebaseRoot);
		return browserReleaseCompiler.create().compile({
			projectId: id,
			rootFolder: rootFolder,
			main: main,
			standalone: browserCompiler.standalone,
			outputFolder: buildReleaseFolder,
			dependencies: dependencies,
			codebaseRoot: codebaseRoot
		});
	};
	return thisOperation;
}

export default {
	create: compileBrowserOperation
}
