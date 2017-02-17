import check from './check';
import fs from 'fs-extra';
import precinct from 'precinct';
import files from './files';

function getForFolder(folder) {
	check.definedString('folder', folder);
	const filesInFolder = files.walkDirectory(folder);
	return filesInFolder.map((file) => {
		const content = fs.readFileSync(file, 'utf8');
		return precinct(content);
	}).reduce(concatenate);

}

function concatenate(a, b) {
	return a.concat(b);
}

export default {
	getForFolder
}