import { expect } from 'chai';
import testFixture from '../testFixture';
import fs from 'fs-extra';

describe('sourceMapTest', () => {

	const fixture = testFixture.create('sourceMapTest');

	describe('browser library source maps', () => {

		it('writes sourcemaps', () => {
			return fixture.execute('install')
				.then(() => {
					expect(fs.existsSync(fixture.getPath('build/browser-libs/chai.bundle.js.map'))).equal(true);
				});
		});

		it('writes correct sourceRoot', () => {
			return fixture.execute('install')
				.then(() => {
					const mapFile = fixture.getPath('build/browser-libs/chai.bundle.js.map');
					const sourceRoot = fs.readJSONSync(mapFile).sourceRoot;
					expect(sourceRoot).to.equal('../..');
				});
		});

		it('writes correct source path for target module', () => {
			return fixture.execute('install')
				.then(() => {
					const mapFile = fixture.getPath('build/browser-libs/chai.bundle.js.map');
					const sources = fs.readJSONSync(mapFile).sources;
					expect(sources.includes('../../../../node_modules/chai/index.js')).to.be.true;
				});
		});

	});

	describe('test libraries source maps', () => {

		it('writes sourcemaps', () => {
			return fixture.execute('install')
				.then(() => {
					expect(fs.existsSync(fixture.getPath('build/test/browser/sourcemap-test.libs.bundle.js.map'))).equal(true);
				});
		});

		it('writes correct sourceRoot', () => {
			return fixture.execute('install')
				.then(() => {
					const mapFile = fixture.getPath('build/test/browser/sourcemap-test.libs.bundle.js.map');
					const sourceRoot = fs.readJSONSync(mapFile).sourceRoot;
					expect(sourceRoot).to.equal('../../..');
				});
		});

		it('writes correct source path for polyfill bundle', () => {
			return fixture.execute('install')
				.then(() => {
					const mapFile = fixture.getPath('build/test/browser/sourcemap-test.libs.bundle.js.map');
					const sources = fs.readJSONSync(mapFile).sources;
					expect(sources.includes('build/browser-libs/babel-polyfill.bundle.js')).to.be.true;
				});
		});

		it('writes correct source paths', () => {
			return fixture.execute('install')
				.then(() => {
					const mapFile = fixture.getPath('build/test/browser/sourcemap-test.libs.bundle.js.map');
					const sources = fs.readJSONSync(mapFile).sources.slice(1);
					sources.forEach(source => {
						expect(source.match(/(\.\.\/){2}((\.\.\/){4})?node_modules/));
					});
				});
		});

	});

	describe('test source maps', () => {

		it('writes sourcemaps', () => {
			return fixture.execute('install')
				.then(() => {
					expect(fs.existsSync(fixture.getPath('build/test/browser/sourcemap-test.tests.bundle.js.map'))).equal(true);
				});
		});

		it('writes correct sourceRoot', () => {
			return fixture.execute('install')
				.then(() => {
					const mapFile = fixture.getPath('build/test/browser/sourcemap-test.tests.bundle.js.map');
					const sourceRoot = fs.readJSONSync(mapFile).sourceRoot;
					expect(sourceRoot).to.equal('../../../test');
				});
		});

		it('writes correct source paths', () => {
			return fixture.execute('install')
				.then(() => {
					const mapFile = fixture.getPath('build/test/browser/sourcemap-test.tests.bundle.js.map');
					const sources = fs.readJSONSync(mapFile).sources.slice(1);
					expect(sources.includes('../src/module.js')).to.be.true;
					expect(sources.includes('moduleTest.js')).to.be.true;
				});
		});

	});

});