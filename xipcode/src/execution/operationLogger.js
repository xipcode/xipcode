import check from '../core/check';
import logger from '../core/logger';

const datePartNumberFormat = new Intl.NumberFormat('en-US', { minimumIntegerDigits: 2 });

function operationLogger(count, total, projectId) {
	check.definedNumber('count', count);
	check.definedNumber('total', total);
	check.definedString('projectId', projectId);

	function createLogEntry(message) {
		return `[${createTimestamp()}] [${count}/${total}] [${projectId}] ${message}`;
	}

	return {
		log(message) {
			logger.log(createLogEntry(message));
		},
		warn(message) {
			logger.warn(createLogEntry(message));
		}
	}

}

function createTimestamp() {
	const now = new Date();
	return textToGray(`${format(now.getHours())}:${format(now.getMinutes())}:${format(now.getSeconds())}`);
}

function textToGray(text) {
	return '\x1b[90m' + text + '\x1b[0m';
}

function format(datePart) {
	return datePartNumberFormat.format(datePart);
}

export default {
	create: operationLogger
}
