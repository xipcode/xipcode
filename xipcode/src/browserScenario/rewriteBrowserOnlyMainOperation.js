import check from '../core/check';
import operation from '../model/operation';
import fs from 'fs-extra';
import path from 'path';

function rewriteBrowserOnlyMainOperation() {
	const thisOperation = operation.create({ id: 'rewrite-browser-only-main', logMessage: 'Rewriting package.json main' });
	thisOperation.perform = ({ id, scenarioIds, buildReleaseFolder }) => {
		check.definedString('id',  id);
		check.definedArray('scenarioIds', scenarioIds);
		check.definedString('buildReleaseFolder',  buildReleaseFolder);
		if (isBrowserOnlyModule(scenarioIds)) {
			rewriteMainEntry(id, buildReleaseFolder);
		}
		return Promise.resolve();
	};
	return thisOperation;
}

function isBrowserOnlyModule(scenarioIds) {
	return !scenarioIds.includes('node');
}

function rewriteMainEntry(id, buildReleaseFolder) {
	const packageJsonFile = path.join(buildReleaseFolder, 'package.json');
	const packageJson = fs.readJsonSync(packageJsonFile);
	packageJson.main = `${id}.bundle.js`;
	fs.writeJsonSync(packageJsonFile, packageJson);
}

export default {
	create: rewriteBrowserOnlyMainOperation
}
