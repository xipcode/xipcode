import check from '../core/check';
import operation from '../model/operation';
import npm from '../core/npm';

function npmUninstallOperation() {
	const thisOperation = operation.create({ id: 'npm-uninstall', logMessage: 'Uninstalling npm package' });
	thisOperation.perform = ({ codebaseRoot, id }) => {
		check.definedString('codebaseRoot',  codebaseRoot);
		check.definedString('id',  id);
		return npm.uninstall(codebaseRoot, id);
	};
	return thisOperation;
}

export default {
	create: npmUninstallOperation
}
