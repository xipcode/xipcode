import fs from 'fs-extra';
import path from 'path';
import check from './check';

function findFileInPath(fileName, startPath) {
	check.definedString('fileName', fileName);
	check.definedString('startPath', startPath);
	const resolvedStartPath = path.resolve(startPath);
	let previousPath = null;
	let currentPath = resolvedStartPath;
	while (currentPath !== previousPath) {
		let file = path.join(currentPath, fileName);
		if (fs.existsSync(file)) {
			return file;
		}
		previousPath = currentPath;
		currentPath = path.dirname(currentPath);
	}
	throw new Error(`File '${fileName}' not found in directory or its ancestors: ${resolvedStartPath}`);
}

function updateJsonFile({file, key, value}) {
	check.definedString('file', file);
	check.definedString('key', key);
	check.definedString('value', value);
	const projectObject = fs.readJSONSync(file);
	projectObject[key] = value;
	fs.writeJSONSync(file, projectObject);
}

function findCodebaseRoot(startPath) {
	check.definedString('startPath', startPath);
	const nodeModulesFolder = findFileInPath('node_modules', startPath);
	return path.dirname(nodeModulesFolder);
}

function isFileNewer(file1, file2) {
	check.definedString('file1', file1);
	check.definedString('file2', file2);
	const file1Stats = fs.statSync(file1);
	const file2Stats = fs.statSync(file2);
	return file2Stats.ctime.getTime() < file1Stats.ctime.getTime();
}

function walkDirectory(dir) {

	function walk(dir, list = []) {
		const files = fs.readdirSync(dir);
		files.forEach(file => {
			const filePath = path.join(dir, file);
			const isDirectory = fs.lstatSync(filePath).isDirectory();
			if (isDirectory) {
				walk(filePath, list);
			}
			else {
				list.push(filePath);
			}
		});
		return list;
	}

	return walk(dir);
}

export default {
	findFileInPath,
	updateJsonFile,
	findCodebaseRoot,
	isFileNewer,
	walkDirectory
}
