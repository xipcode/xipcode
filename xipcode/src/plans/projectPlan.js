import check from '../../src/core/check';
import phasePlan from './phasePlan';

function projectPlan(project, lifecycle, targetPhaseIds) {
	check.definedObject('project', project);
	check.definedObject('lifecycle', lifecycle);
	check.nonEmptyArray('targetPhaseIds', targetPhaseIds);

	return {
		project: project,
		phasePlans: createPhasePlans(project, lifecycle, targetPhaseIds)
	};
}

function createPhasePlans(project, lifecycle, targetPhaseIds) {
	return lifecycle.phases
		.filter((phase) => {
			return targetPhaseIds.includes(phase.id);
		})
		.map((phase) => {
			return phasePlan.create(project, phase, lifecycle.scenarios);
		});
}

export default {
	create: projectPlan
}
