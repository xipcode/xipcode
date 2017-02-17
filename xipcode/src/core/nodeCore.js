import repl from 'repl';

function isCoreModule(moduleName) {
	return repl._builtinLibs.includes(moduleName);
}

export default {
	isCoreModule
}