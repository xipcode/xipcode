import check from '../core/check';
import operation from '../model/operation';
import fs from 'fs-extra';
import path from 'path';

function packageOperation() {
	const thisOperation = operation.create({ id: 'package', logMessage: 'Creating package' });
	thisOperation.perform = ({ id, version, main, bin, rootFolder, buildReleaseFolder }) => {
		check.definedString('id',  id);
		check.definedString('version',  version);
		check.definedString('main',  main);
		check.definedString('rootFolder',  rootFolder);
		check.definedString('buildReleaseFolder',  buildReleaseFolder);
		writePackageJson(id, version, main, bin, buildReleaseFolder);
		copyProjectJson(rootFolder, buildReleaseFolder);
		return Promise.resolve();
	};
	return thisOperation;
}

function writePackageJson(id, version, main, bin, buildReleaseFolder) {
	const packageJson = createPackageJsonObject(id, version, main, bin);
	const packageJsonFile = path.join(buildReleaseFolder, 'package.json');
	fs.writeJsonSync(packageJsonFile, packageJson);
}

function createPackageJsonObject(projectId, projectVersion, projectMain, projectBin) {
	const packageJson = {
		name: projectId,
		version: projectVersion,
		main: projectMain
	};
	if (projectBin) {
		packageJson.bin = projectBin;
	}
	return packageJson;
}

function copyProjectJson(rootFolder, buildReleaseFolder) {
	const sourceFile = path.join(rootFolder, 'project.json');
	const targetFile = path.join(buildReleaseFolder, 'project.json');
	fs.copySync(sourceFile, targetFile);
}

export default {
	create: packageOperation
}
