import files from '../core/files';
import fs from 'fs-extra';
import path from 'path';
import project from '../model/project';
import check from '../core/check';
import { LoadProjectError }  from '../errors/error';

const projectConfigFileName = 'project.json';

function projectLoader(buildProfile) {
	check.definedString('buildProfile', buildProfile);
	return {
		loadProjects(folder) {
			check.definedString('folder', folder);
			try {
				const fileName = files.findFileInPath(projectConfigFileName, folder);
				const projects = readProject(fileName, []);
				validateUniqueProjectIds(projects);
				return projects;
			}
			catch (e) {
				if (e instanceof LoadProjectError) {
					throw e;
				}
				// project.json loading is optional
				return null;
			}
		}
	};

	function readProject(fileName, visited) {
		checkForCycles(fileName, visited);
		const rootFolder = path.dirname(fileName);
		const projectJson = tryReadJSON(fileName);
		const newProject = createProject(rootFolder, projectJson, fileName);
		let projects = [];
		newProject.projects.forEach((projectPath) => {
			const childProjectFile = path.join(rootFolder, projectPath, projectConfigFileName);
			validateChildProjectFile(childProjectFile, fileName);
			const childProjects = readProject(childProjectFile, visited);
			projects = projects.concat(childProjects);
		});
		projects.push(newProject);
		return projects;
	}

	function tryReadJSON(fileName) {
		try {
			return fs.readJSONSync(fileName);
		}
		catch(e) {
			throw new LoadProjectError(`Failed to load project from ${fileName}`, e);
		}
	}

	function checkForCycles(fileName, visited) {
		if (visited.indexOf(fileName) >= 0) {
			const files = visited.join('   \n');
			throw new LoadProjectError(`Found cycle in project hierarchy:\n   ${files}`);
		}
		visited.push(fileName);
	}

	function createProject(rootFolder, projectJson, fileName) {
		try {
			return project.create({
				id: projectJson.id,
				version: projectJson.version,
				main: projectJson.main,
				bin: projectJson.bin,
				scenarioIds: projectJson.scenarios || [],
				lint: projectJson.lint,
				browserCompiler: projectJson.browserCompiler,
				rootFolder,
				dependencies: projectJson.dependencies,
				devDependencies: projectJson.devDependencies,
				projects: projectJson.projects || [],
				buildProfile: buildProfile
			});
		}
		catch (e) {
			throw new LoadProjectError(`Invalid project.json: ${e.message} (${fileName})`, e);
		}
	}

	function validateChildProjectFile(childFileName, parentProjectJson) {
		if (!fs.existsSync(childFileName)) {
			const invalidProjectId = path.basename(path.dirname(childFileName));
			throw new LoadProjectError(`Invalid child project in ${parentProjectJson}. Project [${invalidProjectId}] does not exist.`);
		}
	}

	function validateUniqueProjectIds(projects) {
		const projectMap = projects.reduce((map, project) => {
			const id = project.id;
			const path = project.rootFolder;
			map[id] = map[id] ? map[id].concat(path) : [path];
			return map;
		}, {});
		for (let key in projectMap) {
			if (projectMap[key].length > 1) {
				const paths = projectMap[key].map(path => {
					return path + '/project.json';
				});
				throw new LoadProjectError('Duplicate project ids found in: [' + paths.join(', ') + ']');
			}
		}
	}
}

export default {
	create: projectLoader
}
