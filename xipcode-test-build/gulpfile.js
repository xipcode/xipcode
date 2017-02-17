const xipcode = require('xipcode');
const gulp = require('gulp');
const fs = require('fs-extra');

xipcode.initialize();

gulp.task('default', ['install']);

gulp.task('register-test-project', () => {
	const projectConfig = 'project.json';
	const projectJson = fs.readJsonSync(projectConfig);
	projectJson.projects.push('test');
	fs.writeJsonSync(projectConfig, projectJson);
});

gulp.task('deregister-test-project', () => {
	const projectConfig = 'project.json';
	const projectJson = fs.readJsonSync(projectConfig);
	const projectCount = projectJson.projects.length;
	projectJson.projects.splice(projectCount - 1, 1);
	fs.writeJsonSync(projectConfig, projectJson);
});

gulp.task('remove-test-project', () => {
	fs.removeSync('test');
	fs.removeSync('node_modules/test');
});