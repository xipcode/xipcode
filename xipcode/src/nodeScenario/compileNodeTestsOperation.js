import check from '../core/check';
import operation from '../model/operation';
import nodeCompiler from './nodeCompiler';
import path from 'path';
import fs from 'fs-extra';

function compileNodeTestsOperation() {
	const thisOperation = operation.create({ id: 'compile-node-tests', logMessage: 'Compiling tests for node' });
	thisOperation.perform = ({ id, sourcesPattern, testsFolder, testsPattern, buildTestFolder, buildFolder }, logger) => {
		check.definedString('id', id);
		check.definedString('sourcesPattern', sourcesPattern);
		check.definedString('testsFolder', testsFolder);
		check.definedString('testsPattern', testsPattern);
		check.definedString('buildTestFolder', buildTestFolder);
		check.definedString('buildFolder', buildFolder);
		if (!fs.existsSync(testsFolder)) {
			logger.warn(`Project ${id} has no tests`);
			return Promise.resolve();
		}
		const buildNodeTestFolder = path.join(buildTestFolder, 'node');
		const buildInstrumentFolder = path.join(buildNodeTestFolder, 'instrument');
		const instrumentedSources = path.join(buildInstrumentFolder, sourcesPattern);
		const compileSrc = nodeCompiler.create().compile({
			sourcesPattern: instrumentedSources,
			outputFolder: buildNodeTestFolder,
			srcBase: buildInstrumentFolder
		});
		const compileTest = nodeCompiler.create().compile({
			sourcesPattern: testsPattern,
			outputFolder: buildNodeTestFolder,
			srcBase: '.'
		});
		return compileSrc.then(compileTest);
	};
	return thisOperation;
}

export default {
	create: compileNodeTestsOperation
}
