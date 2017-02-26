import check from '../core/check';

function codebase({workflows = {}}) {
	check.definedObject('workflows', workflows);

	return {
		workflows

	}
}

export default {
	create: codebase
}
