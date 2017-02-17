import logger from '../core/logger';
import * as path from 'path';
import check from '../core/check';
import * as fs from 'fs-extra';
import files from '../core/files';

const templatePath = '/../../resources/templates/new-project/';
const projectJsonFileName = 'project.json';

function createProject({id, basePath='./'}) {
	check.definedString('id', id);
	logger.log(`Creating new project called '${id}'`);
	const sourceDir = path.join(__dirname, templatePath);
	const destDir = path.join(basePath, id);
	tryCreateProjectFolder(id, sourceDir, destDir);
	files.updateJsonFile({
		file: path.join(destDir, projectJsonFileName),
		key: 'id',
		value: id
	});
}

function tryCreateProjectFolder(id, sourceDir, destDir) {
	if (fs.existsSync(destDir)) {
		throw new Error(`Project [${id}] already exists in this folder.`)
	}
	fs.copySync(sourceDir, destDir, {overwrite: false, errorOnExist: true});
}

export default {
	createProject
}