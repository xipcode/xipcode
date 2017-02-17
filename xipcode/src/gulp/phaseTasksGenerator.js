import check from '../core/check';
import gulp from 'gulp';
import buildRunner from '../execution/buildRunner';

function generatePhaseTasks({ projects, lifecycle, watchEnabled }) {
	check.nonEmptyArray('projects', projects);
	check.definedObject('lifecycle', lifecycle);
	check.definedBoolean('enableWatch', watchEnabled);

	lifecycle.phases.forEach((targetPhase) => {
		createGulpTask(projects, lifecycle, targetPhase.id, watchEnabled);
	});
}

function createGulpTask(projects, lifecycle, targetPhaseId, watchEnabled) {
	gulp.task(targetPhaseId, () => {
		const phaseIds = lifecycle.getPhasePath(targetPhaseId);
		const runner = buildRunner.create(watchEnabled);
		return runner.run(projects, lifecycle, phaseIds);
	})
}



export default {
	generate: generatePhaseTasks
}
