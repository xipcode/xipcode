import check from '../core/check';

function phase({ id }) {
	check.definedString('id', id);
	return {
		id
	}
}

export default {
	create: phase
}
