import util from 'util';

function LoadProjectError(message, cause) {
	this.name = 'LoadProjectError';
	this.message = message;
	Error.captureStackTrace(this, LoadProjectError);
	if (cause) {
		this.stack = this.stack + '\nCause: ' + cause.stack;
	}
}

util.inherits(LoadProjectError, Error);

export {
	LoadProjectError
}
