import projectLoader from '../src/projects/projectLoader';
import buildProfile from '../src/model/buildProfile';
import buildRunner from '../src/execution/buildRunner';
import buildLifecycle from '../src/buildLifecycle/buildLifecycle';
import fs from 'fs-extra';
import path from 'path';

const lifecycle = buildLifecycle.create();

function create(directory) {
	const sourceFolder = path.join('test-data/integration/', directory);
	const targetFolder = path.join('build/test/test-output', directory);
	createTargetFolder(sourceFolder, targetFolder);
	const loader = projectLoader.create(buildProfile.LOCAL);
	const projects = loader.loadProjects(targetFolder);
	return {
		targetFolder: targetFolder,
		execute(phase) {
			console.log(`===== START: ${directory} ====`); // eslint-disable-line no-console
			const runner = buildRunner.create(false);
			const phaseIds = lifecycle.getPhasePath(phase);
			return runner.run(projects, lifecycle, phaseIds)
				.then(() => {
					console.log(`===== DONE: ${directory} ====`); // eslint-disable-line no-console
				});
		},
		getPath(relativePath) {
			return path.join(targetFolder, relativePath);
		}
	}
}

function createTargetFolder(sourceFolder, targetFolder) {
	fs.mkdirsSync(targetFolder);
	fs.copySync('test-data/integration/template', targetFolder);
	fs.copySync(sourceFolder, targetFolder);
}

export default {
	create
}
