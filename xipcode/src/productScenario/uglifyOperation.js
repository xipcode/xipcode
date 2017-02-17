import check from '../core/check';
import operation from '../model/operation';
import streams from '../core/streams';
import path from 'path';
import gulp from 'gulp';
import concat from 'gulp-concat';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';

function uglifyOperation() {
	const thisOperation = operation.create({ id: 'uglify-product-file', logMessage: 'Uglifying product file' });
	thisOperation.perform = ({ id, buildFolder }) => {
		check.definedString('id', id);
		check.definedString('buildFolder', buildFolder);

		const srcFileName = path.join(buildFolder, `${id}.js`);
		const destFileName = `${id}.min.js`;

		const stream = gulp.src(srcFileName)
			.pipe(sourcemaps.init({ loadMaps: true }))
			.pipe(concat(destFileName))
			.pipe(uglify({mangle: false}))
			.pipe(sourcemaps.write('.', { includeContent: true }))
			.pipe(gulp.dest(buildFolder));
		return streams.createPromiseFromStream(stream);

	};
	return thisOperation;
}

export default {
	create: uglifyOperation
}
