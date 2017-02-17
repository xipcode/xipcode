
function getValueByKeyMatch(targetObject, regex) {
	const match = Object.keys(targetObject).filter((prop) => {
		if (prop.match(regex)) {
			return prop;
		}
	})[0];
	return targetObject[match];
}

export default {
	getValueByKeyMatch
}