import check from '../core/check';
import operation from '../model/operation';
import npm from '../core/npm';
import path from 'path';

function npmInstallOperation() {
	const thisOperation = operation.create({ id: 'npm-install', logMessage: 'Installing npm package' });
	thisOperation.perform = ({ codebaseRoot, rootFolder, buildReleaseFolder }) => {
		check.definedString('codebaseRoot',  codebaseRoot);
		check.definedString('rootFolder',  rootFolder);
		check.definedString('buildReleaseFolder',  buildReleaseFolder);
		const installFromFolder = path.join(rootFolder, buildReleaseFolder);
		return npm.install(codebaseRoot, installFromFolder);
	};
	return thisOperation;
}

export default {
	create: npmInstallOperation
}
