import check from '../core/check';
import operation from '../model/operation';
import path from 'path';
import fs from 'fs-extra';

function cleanOperation() {
	const thisOperation = operation.create({ id: 'clean', logMessage: 'Cleaning project' });
	thisOperation.perform = ({ rootFolder, buildFolder }) => {
		check.definedString('rootFolder', rootFolder);
		check.definedString('buildFolder', buildFolder);
		fs.removeSync(path.join(rootFolder, buildFolder));
		return Promise.resolve();
	};
	return thisOperation;
}

export default {
	create: cleanOperation
}
