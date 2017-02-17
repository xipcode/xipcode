import files from '../core/files';
import projectLoader from './projectLoader';
import check from '../core/check';
import { LoadProjectError }  from '../errors/error';

function codebaseLoader(buildProfile) {
	check.definedString('buildProfile', buildProfile);
	return {
		loadProjects(folder) {
			check.definedString('folder', folder);
			try {
				const codebaseRoot = files.findCodebaseRoot(folder);
				return projectLoader.create(buildProfile).loadProjects(codebaseRoot);
			}
			catch (e) {
				if (e instanceof LoadProjectError) {
					throw e;
				}
				// there may not be a project.json at the codebaseRoot
				return null;
			}
		}
	}
}

export default {
	create: codebaseLoader
}