import check from '../core/check';
import operation from '../model/operation';
import fs from 'fs-extra';

function initializeOperation() {
	const thisOperation = operation.create({ id: 'initialize', logMessage: 'Initializing project' });
	thisOperation.perform = ({ rootFolder, buildFolder }) => {
		check.definedString('rootFolder', rootFolder);
		check.definedString('buildFolder', buildFolder);
		process.chdir(rootFolder);
		fs.mkdirsSync(buildFolder);
		return Promise.resolve();
	};
	return thisOperation;
}

export default {
	create: initializeOperation
}
