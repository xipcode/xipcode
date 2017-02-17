import phase from '../../src/model/phase';
import project from '../../src/model/project';
import scenario from '../../src/model/scenario';
import lifecycle from '../../src/model/lifecycle';
import mockOperation from '../model/mockOperation';

function builder() {
	const resultCollector = mockOperation.createResultCollector();
	const phases = [];
	const scenarios = [];
	const projects = [];
	let targetPhaseIds;

	return {
		withPhases(phaseIds) {
			phaseIds.forEach((phaseId) => {
				phases.push(phase.create({ id: phaseId }));
			});
			return this;
		},

		withScenario(scenarioId, isDefault, phaseIds, requires) {
			const operationsByPhaseId = {};
			phaseIds.forEach((phaseId) => {
				operationsByPhaseId[phaseId] = [mockOperation.create(`${scenarioId}-${phaseId}-operation`, resultCollector)];
			});
			const newScenario = scenario.create({
				id: scenarioId,
				isDefault,
				operationsByPhaseId,
				requires
			});
			scenarios.push(newScenario);
			return this;
		},

		withProject(projectId, scenarioIds) {
			const newProject = project.create({
				id: projectId,
				main: `src/${projectId}.js`,
				scenarioIds,
				rootFolder: `path/to/${projectId}`,
				buildProfile: 'local'
			});
			projects.push(newProject);
			return this;
		},

		targetPhases(phaseIds) {
			targetPhaseIds = phaseIds;
			return this;
		},

		create() {
			const newLifecycle = lifecycle.create({
				id: 'lifecycle',
				phases,
				scenarios,
				initialize: () => {}
			});
			return {
				resultCollector,
				projects,
				lifecycle: newLifecycle,
				targetPhaseIds,
				watchEnabled: false
			}
		}
	}
}


export default {
	builder
}
