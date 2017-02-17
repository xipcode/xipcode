import gulp from 'gulp';
import buildLifecycle from '../buildLifecycle/buildLifecycle';
import check from '../core/check';
import projectLoader from '../projects/projectLoader';
import buildRunner from '../execution/buildRunner';

function codebaseTaskGenerator(watchEnabled, profile) {
	check.definedString('profile', profile);
	check.definedBoolean('watchEnabled', watchEnabled);
	return {
		generate(projects) {
			check.definedArray('projects', projects);
			projects.forEach(project => {
				generateInstallTasks(project, profile, watchEnabled);
				generateDevTasks(project, profile, watchEnabled);
			});
		}
	}
}

function generateInstallTasks(project, profile, watchEnabled) {
	gulp.task(project.id, () => {
		const lifecycle = buildLifecycle.create();
		const phaseIds = lifecycle.getPhasePath('install');
		return runBuild(project, profile, watchEnabled, lifecycle, phaseIds);
	});
}

function generateDevTasks(project, profile, watchEnabled) {
	gulp.task(`dev:${project.id}`, () => {
		const lifecycle = buildLifecycle.create();
		const phaseIds = ['initialize', 'compile', 'package', 'install'];
		return runBuild(project, profile, watchEnabled, lifecycle, phaseIds);
	});
}

function runBuild(project, profile, watchEnabled, lifecycle, phaseIds) {
	const externalProjects = projectLoader.create(profile).loadProjects(project.rootFolder);
	return buildRunner.create(watchEnabled).run(externalProjects, lifecycle, phaseIds);
}

export default {
	create: codebaseTaskGenerator
}