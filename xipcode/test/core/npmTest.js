import { expect, fail } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import npm from '../../src/core/npm';
import sinon from 'sinon';
import fs from 'fs-extra';
import path from 'path';

describe('npm', () => {

	let removeError;
	function removeMock(folder, callback) {
		if (removeError) {
			callback(removeError);
		}
		callback();
	}

	let copyError;
	function copyMock(fromFolder, toFolder, callback) {
		if (copyError) {
			callback(copyError);
		}
		callback();
	}

	let sandbox;
	let fsRemoveStub;
	let fsExistsStub;
	let fsCopyStub;
	let fsReadJsonStub;
	let fsMkdirsStub;
	beforeEach(() => {
		sandbox = sinon.sandbox.create();
		fsRemoveStub = sandbox.stub(fs, 'remove', removeMock);
		fsExistsStub = sandbox.stub(fs, 'existsSync');
		fsCopyStub = sandbox.stub(fs, 'copy', copyMock);
		fsReadJsonStub = sandbox.stub(fs, 'readJsonSync').returns({ name: 'package-name' });
		fsMkdirsStub = sandbox.stub(fs, 'mkdirsSync');
	});
	afterEach(() => {
		removeError = undefined;
		copyError = undefined;
		sandbox.restore()
	});

	describe('install', () => {

		it('requires codebaseRoot', () => {
			expect(() => npm.install(undefined, 'installFromFolder')).throw('codebaseRoot must be defined');
		});

		it('requires installFromFolder', () => {
			expect(() => npm.install('codebaseRoot', undefined)).throw('installFromFolder must be defined');
		});

		it('rejects non-existent installFromFolder', () => {
			fsExistsStub.withArgs('non-existent-folder').returns(false);
			expect(() => npm.install('codebaseRoot', 'non-existent-folder')).throw('npm install folder does not exist: non-existent-folder');
		});

		it('installs', () => {
			fsExistsStub.withArgs('installFromFolder').returns(true);
			return npm.install('codebaseRoot', 'installFromFolder').then(() => {
				sinon.assert.calledWith(fsMkdirsStub, 'codebaseRoot/node_modules/package-name');
				sinon.assert.calledWith(fsCopyStub, 'installFromFolder', 'codebaseRoot/node_modules/package-name');
			});
		});

		it('handles errors', () => {
			fsExistsStub.withArgs('folder').returns(true);
			copyError = 'error copying folder';
			return npm.install('root', 'folder')
				.then(() => {
					throw new Error('expected install to throw an error');
				})
				.catch((error) => {
					expect(error).equals(copyError);
				});
		});
	});

	describe('uninstall', () => {

		it('requires codebaseRoot', () => {
			expect(() => npm.uninstall(undefined, 'packageName')).throw('codebaseRoot must be defined');
		});

		it('requires packageName', () => {
			expect(() => npm.uninstall('codebaseRoot', undefined)).throw('packageName must be defined');
		});

		it('removes folder', () => {
			fsExistsStub.withArgs('codebaseRoot/node_modules/package-name').returns(true);
			return npm.uninstall('codebaseRoot', 'package-name').then(() => {
				sinon.assert.calledWith(fsRemoveStub, 'codebaseRoot/node_modules/package-name');
			});
		});

		it('handles errors', () => {
			fsExistsStub.withArgs('codebaseRoot/node_modules/package-name').returns(true);
			removeError = 'error removing folder';
			return npm.uninstall('codebaseRoot', 'package-name')
				.then(() => {
					throw new Error('expected uninstall to throw an error');
				})
				.catch((error) => {
					expect(error).equals(removeError);
				});
		});
	});

	describe('getTransitiveDependencies', () => {

		const mockNodeModulesFolder = 'path/to/node_modules';

		function stubXipcodeModule(moduleName, dependencies, devDependencies) {
			const moduleFolder = path.join(mockNodeModulesFolder, moduleName);
			const projectJsonFile = path.join(moduleFolder, 'project.json');
			const projectJson = {
				dependencies,
				devDependencies
			};
			fsExistsStub.withArgs(moduleFolder).returns(true);
			fsExistsStub.withArgs(projectJsonFile).returns(true);
			fsReadJsonStub.withArgs(projectJsonFile, 'utf-8').returns(projectJson);
		}

		function stubThirdPartyModule(moduleName) {
			const moduleFolder = path.join(mockNodeModulesFolder, moduleName);
			const projectJsonFile = path.join(moduleFolder, 'project.json');
			fsExistsStub.withArgs(moduleFolder).returns(true);
			fsExistsStub.withArgs(projectJsonFile).returns(false);
		}

		it('requires nodeModulesFolder', () => {
			expect(() => npm.getTransitiveDependencies(undefined)).throw('nodeModulesFolder must be defined');
		});

		it('requires moduleNames', () => {
			expect(() => npm.getTransitiveDependencies('folder', undefined)).throw('moduleNames must be defined');
		});

		it('returns empty array for empty moduleNames', () => {
			const dependencies = npm.getTransitiveDependencies(mockNodeModulesFolder, []);
			expect(dependencies).eql([]);
		});

		it('handles single module with no dependencies', () => {
			stubXipcodeModule('module-1', [], []);
			const dependencies = npm.getTransitiveDependencies(mockNodeModulesFolder, ['module-1']);
			expect(dependencies).eql(['module-1']);
		});

		it('handles multiple modules with no dependencies', () => {
			stubXipcodeModule('module-1', [], []);
			stubXipcodeModule('module-2', [], []);
			stubXipcodeModule('module-3', [], []);
			const dependencies = npm.getTransitiveDependencies(mockNodeModulesFolder, ['module-1','module-2', 'module-3']);
			expect(dependencies).eql(['module-1','module-2', 'module-3']);
		});

		it('handles multiple modules with dependencies', () => {
			stubXipcodeModule('module-1', ['module-2'], ['module-3']);
			stubXipcodeModule('module-2', ['module-3'], []);
			stubXipcodeModule('module-3', [], []);
			const dependencies = npm.getTransitiveDependencies(mockNodeModulesFolder, ['module-1','module-2']);
			expect(dependencies).eql(['module-3','module-2', 'module-1']);
		});

		it('handles dependencies on third party modules', () => {
			stubXipcodeModule('module-1', ['module-2', 'module-3'], []);
			stubThirdPartyModule('module-2');
			stubThirdPartyModule('module-3');
			const dependencies = npm.getTransitiveDependencies(mockNodeModulesFolder, ['module-1']);
			expect(dependencies).eql(['module-2','module-3', 'module-1']);
		});

		it('handles only third party modules', () => {
			stubThirdPartyModule('module-1');
			stubThirdPartyModule('module-2');
			const dependencies = npm.getTransitiveDependencies(mockNodeModulesFolder, ['module-1', 'module-2']);
			expect(dependencies).eql(['module-1','module-2']);
		});

		it('rejects non-existent module', () => {
			const call = () => npm.getTransitiveDependencies(mockNodeModulesFolder, ['invalid-module']);
			expect(call).throws('Folder for module invalid-module does not exist: path/to/node_modules/invalid-module');
		});
	});

	describe('isXipcodeModule', () => {

		const nodeModulesFolder = 'path/to/node/modules/folder';
		const moduleName = 'some-node-module';
		const projectJsonFile = path.join(nodeModulesFolder, moduleName, 'project.json');

		it('returns true if a module is a xipcode dependency', () => {
			fsExistsStub.withArgs(projectJsonFile).returns(true);
			expect(npm.isXipcodeModule(nodeModulesFolder, moduleName)).to.equal(true);
		});

		it('returns false if a module is not a xipcode dependency', () => {
			fsExistsStub.withArgs(projectJsonFile).returns(false);
			expect(npm.isXipcodeModule(nodeModulesFolder, moduleName)).to.equal(false);
		});
	});
});
