import string from 'string';

function getString() {
	console.log('rejected by no-console lint rule');
	const mantra = 'this is a shared-project-1 test string';
	return string(mantra).chompRight(' string').s;
}

export default {
	getString
}