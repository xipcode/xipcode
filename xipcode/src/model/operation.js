import check from '../core/check';

function operation({ id, logMessage }) {
	check.definedString('id', id);
	check.definedString('logMessage', logMessage);
	return {
		id,
		logMessage,
		perform() {
			throw new Error('Instances must override method \'perform\'');
		}
	}
}

export default {
	create: operation
}
