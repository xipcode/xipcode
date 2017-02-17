import check from '../core/check';
import phasesTaskGenerator from './phaseTasksGenerator';
import buildLifecycle from '../buildLifecycle/buildLifecycle';
import cleanLifecycle from '../cleanLifecycle/cleanLifecycle';

function lifecycleTasksGenerator(watchEnabled) {
	check.definedBoolean('watchEnabled', watchEnabled);

	return {
		generate(projects) {
			check.nonEmptyArray('projects', projects);
			phasesTaskGenerator.generate({
				projects,
				lifecycle: buildLifecycle.create(),
				watchEnabled
			});
			phasesTaskGenerator.generate({
				projects,
				lifecycle: cleanLifecycle.create(),
				watchEnabled
			});
		}
	}
}

export default {
	create: lifecycleTasksGenerator
}