import check from '../core/check';
import scenarioRegistry from './scenarioRegistry';

function findPhase(phases, phaseId) {
	return phases.find((phase) => phase.id === phaseId);
}

function validateScenario(scenario, phases) {
	scenario.getParticipatingPhases().forEach((phaseId) => {
		const phase = findPhase(phases, phaseId);
		if (!phase) {
			throw new Error(`Scenario ${scenario.id} references non-existent phase: ${phaseId}`)
		}
	});
}

function validateScenarios(scenarios, phases) {
	scenarios.forEach((scenario) => {
		validateScenario(scenario, phases);
	});
}

function lifecycle({ id, phases, scenarios, initialize }) {
	check.definedString('id', id);
	check.nonEmptyArray('phases', phases);
	check.definedArray('scenarios', scenarios);
	check.definedFunction('initialize', initialize);
	const registry = scenarioRegistry.create(scenarios);
	validateScenarios(registry, phases);
	return {
		id,
		phases,
		scenarios: registry,
		getPhasePath(phaseId) {
			check.nonEmptyString('phaseId', phaseId);
			const targetIndex = phases.findIndex((phase) => phase.id === phaseId);
			if (targetIndex === -1) {
				const validPhaseIds = phases.map((phase) => phase.id).join(', ');
				throw new Error(`Lifecycle ${id} does not have a phase with id ${phaseId}.  Valid phases are: ${validPhaseIds}`);
			}
			return phases.slice(0, targetIndex + 1)
				.map((phase) => phase.id);
		},
		initialize: initialize
	}
}

export default {
	create: lifecycle
}
