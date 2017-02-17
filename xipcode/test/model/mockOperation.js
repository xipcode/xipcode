import operation from '../../src/model/operation';

function create(id, resultCollector) {
	const thisOperation = operation.create({ id, logMessage: 'Mock logMessage' });
	thisOperation.perform = (project) => {
		return new Promise((resolve, reject) => {
			process.nextTick(() => {
				resultCollector.addResult(id, project.id);
				resolve();
			})
		});
	};
	return thisOperation;
}

function createResultCollector() {
	const results = [];
	return {
		results,
		addResult(operationId, projectId) {
			const result = {
				operationId,
				projectId
			};
			results.push(result);
		}
	}
}

export default {
	createResultCollector,
	create
}