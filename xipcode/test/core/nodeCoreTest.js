import { expect } from 'chai';
import { describe, it } from 'mocha';
import nodeCore from '../../src/core/nodeCore'

describe('nodeCore', () => {

	describe('isCoreModule', () => {

		const coreNodeModules = [
			'assert',
			'buffer',
			'child_process',
			'cluster',
			'crypto',
			'dgram',
			'dns',
			'domain',
			'events',
			'fs',
			'http',
			'https',
			'net',
			'os',
			'path',
			'punycode',
			'querystring',
			'readline',
			'repl',
			'stream',
			'string_decoder',
			'tls',
			'tty',
			'url',
			'util',
			'v8',
			'vm',
			'zlib'
		];

		it('returns true for a core node module', () => {
			coreNodeModules.forEach(module => {
				expect(nodeCore.isCoreModule(module)).to.equal(true);
			});
		});

		it('returns false for a non-core node module', () => {
			expect(nodeCore.isCoreModule('non-core')).to.equal(false);
		});
	});
});