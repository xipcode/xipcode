
function getParsedArgs() {
	const rawArgs = process.argv.slice(2);
	const args = {};
	rawArgs.forEach((arg) => {
		if (isKvp(arg)) {
			const kvp = getKvp(arg);
			const key = getKey(kvp[0]);
			const value = kvp[1];
			args[key] = value;
		} else if (isFlag(arg)) {
			const key = getKey(arg);
			args[key] = true;
		}
	});
	return args;
}

function isKvp(arg) {
	return arg.match(/^--\w+=.+/);
}

function getKvp(arg) {
	return arg.split('=');
}

function isFlag(arg) {
	return arg.match(/^--\w+$/);
}

function getKey(arg) {
	return arg.replace(/-/g, '');
}

module.exports = {
	getParsedArgs
};