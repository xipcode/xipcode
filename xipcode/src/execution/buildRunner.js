import check from '../core/check';
import buildPlan from '../plans/buildPlan';
import buildPlanExecutor from './buildPlanExecutor';
import watcher from './watcher';


function buildRunner(watchEnabled) {
	check.definedBoolean('watchEnabled', watchEnabled);
	return {
		run(projects, lifecycle, targetPhaseIds) {
			check.nonEmptyArray('projects', projects);
			check.definedObject('lifecycle', lifecycle);
			check.nonEmptyArray('targetPhaseIds', targetPhaseIds);
			return runBuild(projects, lifecycle, targetPhaseIds)
				.then(() => {
					if (watchEnabled) {
						watcher.watch(projects, lifecycle, targetPhaseIds, runBuild);
					}
				})
		}
	};
}

function runBuild(projects, lifecycle, targetPhaseIds) {
	lifecycle.initialize();
	const cwd = process.cwd();
	const plan = buildPlan.create(projects, lifecycle, targetPhaseIds);
	return buildPlanExecutor.create().execute(plan)
		.then(() => {
			process.chdir(cwd);
		});
}

export default {
	create: buildRunner
}