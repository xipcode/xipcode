import gulp from 'gulp';

function mockGulp(sandbox) {
	const functionByTaskId = {};
	sandbox.stub(gulp, 'task', (taskId, taskFunction) => {
		functionByTaskId[taskId] = taskFunction;
	});
	return {
		functionByTaskId
	};
}

export default {
	create: mockGulp
}
