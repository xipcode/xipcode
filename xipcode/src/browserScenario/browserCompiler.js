import check from '../core/check';
import path from 'path';

function browserCompiler() {
	return {
		compile() {
			throw new Error('Instances must override method \'compile\'');
		},
		getBrowserifyOptionsForEntry(entries, sourcesFolder, standalone) {
			check.definedArray('entries', entries);
			check.definedString('sourcesFolder', sourcesFolder);
			const babelifyOptions = {
				presets: ['es2015'],
				sourceMaps: true
			};
			const opts = {
				entries: entries,
				transform: [['babelify', babelifyOptions]],
				debug: true,
				basedir: sourcesFolder
			};
			if (standalone) {
				opts.standalone = standalone;
			}
			return opts;
		},
		addSemicolonToOutput(content) {
			if (!content.match(/;\s*\/\/# sourceMappingURL=\S*/)) {
				return content.replace(/(\/\/# sourceMappingURL=)/, ';\n$1');
			}
			return content;
		},
		validateImport({pkg, dependencies, projectId}) {
			check.definedObject('pkg', pkg);
			check.definedArray('dependencies', dependencies);
			check.definedString('projectId', projectId);
			const name = pkg.name;
			const isNodeModule = isInNodeModules(pkg.__dirname);
			if (isNodeModule && !isDeclaredDependency(name, dependencies)) {
				throw new Error(`Module ${name} is imported within ${projectId} but is not` +
					' declared as a dependency in project.json');
			}
		}
	};
}

function isDeclaredDependency(dependency, declaredDependencies) {
	return (declaredDependencies.indexOf(dependency) > -1);
}

function isInNodeModules(dir) {
	const parentDir = path.basename(path.dirname(dir));
	return parentDir === 'node_modules';
}

export default {
	create: browserCompiler
}
