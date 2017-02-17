import check from '../core/check';
import path from 'path';
import gulp from 'gulp';
import logger from '../core/logger';

function watch(projects, lifecycle, targetPhaseIds, callback) {
	check.nonEmptyArray('projects', projects);
	check.definedObject('lifecycle', lifecycle);
	check.nonEmptyArray('targetPhaseIds', targetPhaseIds);
	check.definedFunction('callback', callback);
	logWatching(projects.length);
	const filesToWatch = calculateWatchPatterns(projects);
	gulp.watch(filesToWatch, (event) => {
		return handleEvent(projects, lifecycle, targetPhaseIds, callback, event);
	});
}

function handleEvent(projects, lifecycle, targetPhaseIds, callback, event) {
	const targetProject = findTargetProject(projects, event);
	logger.log(`Detected change in project ${targetProject.id}: ${event.path}`);
	const affectedProjects = calculateAffectedProjects(projects, targetProject);
	return callback(affectedProjects, lifecycle, targetPhaseIds)
		.then(() => {
			logWatching(projects.length);
		})
}

function logWatching(numProjects) {
	const logMessage = `Watching for file changes on ${numProjects} projects`;
	logger.log('-'.repeat(logMessage.length));
	logger.log(logMessage);
	logger.log('-'.repeat(logMessage.length));
}

function calculateWatchPatterns(projects) {
	return projects.map((project) => {
		const sources = path.join(project.rootFolder, project.sourcesPattern);
		const tests = path.join(project.rootFolder, project.testsPattern);
		return [sources, tests];
	}).reduce(concatenate);
}

function findTargetProject(projects, event) {
	const project = projects.find((project) => {
		const sourcesPath = path.join(project.rootFolder, project.sourcesFolder);
		const testsPath = path.join(project.rootFolder, project.testsFolder);
		return isProjectFile(sourcesPath, event) || isProjectFile(testsPath, event);
	});
	if (project) {
		return project;
	}
	throw new Error(`Could not find project for changed file ${event.path}`);
}

function calculateAffectedProjects(projects, targetProject) {
	const copy = projects.slice(0);
	while(copy.length !== 0) {
		if (copy[0].id === targetProject.id) {
			return copy;
		}
		copy.shift();
	}
	throw new Error(`Could not find targetProject ${targetProject.id} in ${projects.map((project) => project.id)}`);
}

function concatenate(a, b) {
	return a.concat(b);
}

function isProjectFile(projectFolder, event) {
	return event.path.startsWith(projectFolder);
}

export default {
	watch
}
