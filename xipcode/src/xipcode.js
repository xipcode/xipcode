import gulp from 'gulp';
import commandline from './core/commandline';
import projectCreator from './projects/projectCreator';
import projectLoader from './projects/projectLoader';
import codebaseProjectsLoader from './projects/codebaseProjectsLoader';
import sourceMapSupport from 'source-map-support';
import lifecycleTasksGenerator from './gulp/lifecycleTasksGenerator';
import buildProfile from './model/buildProfile';
import codebaseTaskGenerator from './gulp/codebaseTaskGenerator';

function initialize() {

	sourceMapSupport.install();

	const currentFolder = process.env.PWD;
	const profile = getProfile();
	const watchEnabled = isWatchEnabled();
	generateTasks(lifecycleTasksGenerator.create(watchEnabled), projectLoader, profile, currentFolder);
	generateTasks(codebaseTaskGenerator.create(watchEnabled, profile), codebaseProjectsLoader, profile, currentFolder);

	gulp.task('create-project', () => {
		const id = commandline.getParsedArgs()['id'];
		if (!id) {
			throw new Error('Command line argument for the project id is required. E.g. --id=<project-id>');
		}
		projectCreator.createProject({'id': id, 'basePath': currentFolder});
	});
}

function generateTasks(generator, loader, profile, currentFolder) {
	const thisLoader = loader.create(profile);
	const projects = thisLoader.loadProjects(currentFolder) || thisLoader.loadProjects(process.cwd());
	if (projects) {
		generator.generate(projects);
	}
}

function getProfile() {
	const profile = commandline.getParsedArgs()['profile'];
	if (!profile) {
		return buildProfile.LOCAL;
	}
	buildProfile.validate(profile);
	return profile;
}

function isWatchEnabled() {
	const watch = commandline.getParsedArgs()['watch'];
	return watch !== undefined;
}

export {
	initialize
};
