import string from 'string';

function getString() {
	return string('this is a test string').left(14).s;
}

export default {
	getString
}
