import { expect } from 'chai';
import { describe, it } from 'mocha';
import dependency from '../../src/core/dependency'

describe('dependency', () => {

	describe('getForFolder', () => {

		const testFolder = 'test-data/core/dependency';

		it('requires folder', () => {
			expect(() => dependency.getForFolder()).throw('folder must be defined');
		});

		it('returns a list of dependencies for a given folder of modules', () => {
			const deps = dependency.getForFolder(testFolder);
			expect(deps).to.eql(['module1', 'module2', './internalModule', 'fs', 'moduleA', 'moduleB']);
		});
	});
});