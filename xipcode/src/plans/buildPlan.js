import check from '../core/check';
import projectPlan from './projectPlan';

function buildPlan(projects, lifecycle, targetPhaseIds) {
	check.nonEmptyArray('projects', projects);
	check.definedObject('lifecycle', lifecycle);
	check.nonEmptyArray('targetPhaseIds', targetPhaseIds);

	return {
		projectPlans: createProjectPlans(projects, lifecycle, targetPhaseIds)
	};
}

function createProjectPlans(projects, lifecycle, targetPhaseIds) {
	return projects.map((project) => {
		return projectPlan.create(project, lifecycle, targetPhaseIds);
	});
}

export default {
	create: buildPlan
}
