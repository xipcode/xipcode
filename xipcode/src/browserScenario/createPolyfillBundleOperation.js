import check from '../core/check';
import operation from '../model/operation';
import path from 'path';
import fs from 'fs-extra';

function createPolyfillBundle(polyfill) {
	check.definedObject('polyfill', polyfill);
	const thisOperation = operation.create({ id: 'create-polyfill-bundle', logMessage: 'Creating polyfill bundle' });
	thisOperation.perform = ({ nodeModulesFolder, browserLibsFolder }) => {
		check.definedString('nodeModulesFolder', nodeModulesFolder);
		check.definedString('browserLibsFolder', browserLibsFolder);
		const source = path.join(nodeModulesFolder, polyfill.moduleName, polyfill.file);
		const target = path.join(browserLibsFolder, `${polyfill.moduleName}.bundle.js`);
		return new Promise((resolve, reject) => {
			fs.copy(source, target, (error) => {
				if (error) {
					reject(error);
				}
				resolve();
			});
		});
	};
	return thisOperation;
}

export default {
	create: createPolyfillBundle
}
