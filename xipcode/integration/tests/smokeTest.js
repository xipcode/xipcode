import { expect } from 'chai';
import testFixture from '../testFixture';
import fs from 'fs-extra';

describe('smokeTest', () => {

	it('builds', () => {
		const fixture = testFixture.create('smokeTest');
		return fixture.execute('install')
			.then(() => {
				expect(fs.existsSync(fixture.getPath('build/release/package.json'))).equal(true);
				expect(fs.existsSync(fixture.getPath('build/release/project.json'))).equal(true);
				expect(fs.existsSync(fixture.getPath('build/release/smoke-test.bundle.js'))).equal(true);
				expect(fs.existsSync(fixture.getPath('build/release/smoke-test.bundle.js.map'))).equal(true);
				expect(fs.existsSync(fixture.getPath('build/release/src/module.js'))).equal(true);
				expect(fs.existsSync(fixture.getPath('build/release/src/module.js.map'))).equal(true);
			});
	});
});