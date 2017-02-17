import check from './check';
import gulp from 'gulp';
import concat from 'gulp-concat';
import sourcemaps from 'gulp-sourcemaps';
import npm from './npm';
import streams from './streams';
import browserBundleLocator from './browserBundleLocator';
import path from 'path';

function browserDependencyConcatenator() {
	return {
		concat ({ polyfill, codebaseRoot, nodeModulesFolder, browserLibsFolder, dependencies, devDependencies, targetFolder, fileName }) {
			check.definedObject('polyfill', polyfill);
			check.definedString('codebaseRoot', codebaseRoot);
			check.definedString('nodeModulesFolder', nodeModulesFolder);
			check.definedString('browserLibsFolder', browserLibsFolder);
			check.definedArray('dependencies', dependencies);
			check.definedArray('devDependencies', devDependencies);
			check.definedString('targetFolder', targetFolder);
			check.definedString('fileName', fileName);

			const allDependencies = [polyfill.moduleName].concat(dependencies).concat(devDependencies);
			const transitiveDependencies = npm.getTransitiveDependencies(nodeModulesFolder, allDependencies);
			const bundleLocator = browserBundleLocator.create(nodeModulesFolder, browserLibsFolder);
			const filesToCopy = bundleLocator.locate(transitiveDependencies);
			const stream = gulp.src(filesToCopy)
				.pipe(sourcemaps.init({ loadMaps: true }))
				.pipe(concat(fileName))
				.pipe(sourcemaps.write('.', {
					includeContent: true,
					mapSources: (sourcePath) => {
						if (sourcePath === polyfill.bundleName) {
							const pathToBrowserLibs = path.relative(codebaseRoot, browserLibsFolder);
							return path.join(pathToBrowserLibs, polyfill.bundleName);
						}
						return sourcePath.replace(/\.\.\//g, '');
					},
					sourceRoot: path.relative(targetFolder, codebaseRoot)
				}))
				.pipe(gulp.dest(targetFolder));
			return streams.createPromiseFromStream(stream);
		}
	};
}

export default {
	create: browserDependencyConcatenator
}
