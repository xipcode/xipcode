import check from '../core/check';
import operation from '../model/operation';
import gulp from 'gulp';
import remapIstanbul from 'remap-istanbul/lib/gulpRemapIstanbul';
import path from 'path';
import streams from '../core/streams';

function remapCoverageReportOperation() {
	const thisOperation = operation.create({ id: 'remap-coverage-report', logMessage: 'Remapping code coverage report' });
	thisOperation.perform = ({ buildFolder }) => {
		check.definedString('buildFolder', buildFolder);
		const inputCoverageFile = path.join(buildFolder, 'reports', 'browser', 'coverage-instrumented.json');
		const outputCoverageFile = path.join(buildFolder, 'reports', 'browser', 'coverage.json');
		const htmlFolder = path.join(buildFolder, 'reports', 'browser', 'coverage-html');
		const opts = {
			fail: true,
			reports: {
				json: outputCoverageFile,
				html: htmlFolder
			},
			exclude: /node_modules/
		};
		const stream = gulp.src([inputCoverageFile])
			.pipe(remapIstanbul(opts));
		return streams.createPromiseFromStream(stream);
	};
	return thisOperation;
}

export default {
	create: remapCoverageReportOperation
}