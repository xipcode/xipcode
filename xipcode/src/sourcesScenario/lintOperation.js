import check from '../core/check';
import operation from '../model/operation';
import gulp from 'gulp';
import eslint from 'gulp-eslint';
import streams from '../core/streams';

function lintOperation() {
	const thisOperation = operation.create({ id: 'lint', logMessage: 'Linting files' });
	thisOperation.perform = ({ sourcesPattern, testsPattern, lint }) => {
		check.definedString('sourcesPattern', sourcesPattern);
		check.definedString('testsPattern', testsPattern);
		check.definedObject('lint', lint);
		check.definedArray('lint.excludes', lint.excludes);
		const sources = [sourcesPattern, testsPattern].concat(createExcludes(lint));
		const stream = gulp.src(sources)
			.pipe(eslint())
			.pipe(eslint.format())
			.pipe(eslint.failAfterError());
		return streams.createPromiseFromStream(stream);
	};
	return thisOperation;
}

function createExcludes(lintConfig) {
	return lintConfig.excludes.map((entry) => `!${entry}`);
}

export default {
	create: lintOperation
}
