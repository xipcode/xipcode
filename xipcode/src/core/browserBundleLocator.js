import check from '../core/check';
import path from 'path';
import fs from 'fs-extra';

function browserBundleLocator(nodeModulesFolder, browserLibsFolder) {
	check.definedString('nodeModulesFolder', nodeModulesFolder);
	check.definedString('browserLibsFolder', browserLibsFolder);
	return {
		locate(moduleNames) {
			check.definedArray('moduleNames', moduleNames);
			const files = [];
			moduleNames.forEach((moduleName) => {
				const fileToCopy = locateBrowserBundle(nodeModulesFolder, browserLibsFolder, moduleName);
				files.push(fileToCopy);
			});
			return files;
		}
	}
}

function locateBrowserBundle(nodeModulesFolder, browserLibsFolder, moduleName) {
	const moduleFolder = path.join(nodeModulesFolder, moduleName);
	const projectJsonFile = path.join(moduleFolder, 'project.json');
	const bundleFileName = `${moduleName}.bundle.js`;
	const moduleFile = path.join(moduleFolder, bundleFileName);
	const bundleFile = path.join(browserLibsFolder, bundleFileName);
	if (fs.existsSync(projectJsonFile)) {
		return moduleFile;
	} else if (fs.existsSync(bundleFile)) {
		return bundleFile;
	}
	throw new Error(`Could not find bundle for module ${moduleName}. Looked in locations: ${moduleFile} and ${bundleFile}`);
}

export default {
	create: browserBundleLocator
}
