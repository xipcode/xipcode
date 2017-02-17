
function isDefined(value) {
	return value !== null && value !== undefined;
}

function getTypeAsString(value) {
	return Object.prototype.toString.call(value);
}

function createTypeErrorMessage(name, expectedType, value) {
	const type = getTypeAsString(value);
	return `${name} must be of type ${expectedType}. Found: ${type}`;
}

function defined(name, value) {
	if (!isDefined(name)) {
		throw new Error('name must be defined');
	}
	if (!isDefined(value)) {
		throw new Error(`${name} must be defined`);
	}
	return value;
}

function definedString(name, value) {
	const string = defined(name, value);
	if (typeof string !== 'string' && !(string instanceof String)) {
		throw new Error(createTypeErrorMessage(name, 'string', value));
	}
	return string;
}

function nonEmptyString(name, value) {
	const string = definedString(name, value);
	if (string === '') {
		throw new Error(`${name} must not be empty.`);
	}
	return string;
}

function definedBoolean(name, value) {
	const boolean = defined(name, value);
	if (typeof boolean !== 'boolean') {
		throw new Error(createTypeErrorMessage(name, 'boolean', value));
	}
	return boolean;
}

function definedNumber(name, value) {
	const number = defined(name, value);
	if (typeof number !== 'number') {
		throw new Error(createTypeErrorMessage(name, 'number', value));
	}
	return number;
}

function definedArray(name, value) {
	const array = defined(name, value);
	if (!Array.isArray(array)) {
		throw new Error(createTypeErrorMessage(name, 'array', value));
	}
	return array;
}

function nonEmptyArray(name, value) {
	const array = definedArray(name, value);
	if (array.length === 0) {
		throw new Error(`${name} must not be empty.`);
	}
	return array;
}

function definedObject(name, value) {
	const object = defined(name, value);
	if (typeof object !== 'object') {
		throw new Error(createTypeErrorMessage(name, 'object', value));
	}
	return object;
}

function definedFunction(name, value) {
	const func = defined(name, value);
	if (typeof func !== 'function') {
		throw new Error(createTypeErrorMessage(name, 'function', value));
	}
	return func;
}

export default {
	defined,
	definedBoolean,
	definedNumber,
	definedString,
	definedArray,
	nonEmptyArray,
	definedObject,
	nonEmptyString,
	definedFunction
}
