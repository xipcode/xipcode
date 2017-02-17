import check from '../core/check';
import operationLogger from './operationLogger';
import executionContext from './executionContext';

function buildPlanExecutor() {
	return {
		execute(buildPlan) {
			check.definedObject('buildPlan', buildPlan);
			const execContext = executionContext.create(buildPlan);
			return executeOperations(execContext);
		}
	}
}

function executeOperations(execContext) {
	let promise = Promise.resolve();
	const totalOperations = execContext.length;
	let operationCount = 0;
	execContext.forEach((operationContext) => {
		promise = promise.then(() => {
			operationCount++;
			const logger = operationLogger.create(operationCount, totalOperations, operationContext.project.id);
			logger.log(operationContext.operation.logMessage);
			const operation = operationContext.operation;
			const project = operationContext.project;
			return operation.perform(project, logger);
		});
	});
	return promise;
}

export default {
	create: buildPlanExecutor
}
