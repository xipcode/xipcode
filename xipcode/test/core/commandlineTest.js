import {expect} from 'chai';
import {describe, it} from 'mocha';
import sinon from 'sinon';

import commandline from '../../src/core/commandline';

describe('commandline', () => {

	let sandbox;
	beforeEach(() => {
		sandbox = sinon.sandbox.create();
	});

	afterEach(() => {
		sandbox.restore();
	});

	const createSliceStub = function(args) {
		sandbox.stub(process.argv, 'slice', function() {
			return args;
		});
	};

	describe('getParsedArgs', () => {

		it('returns an empty object when there are no command line arguments given', () => {
			const args = commandline.getParsedArgs();
			expect(args).to.eql({});
		});

		it('returns a dictionary of command line arguments', () => {
			createSliceStub(['--arg1=value1', '--arg2=value2', '--arg3=value3']);
			expect(commandline.getParsedArgs()).to.eql({
				arg1: 'value1',
				arg2: 'value2',
				arg3: 'value3'
			});
		});

		it('returns flag args', () => {
			createSliceStub(['--arg']);
			expect(commandline.getParsedArgs()).eql({arg: true});
		});

		it('ignores args with empty value', () => {
			createSliceStub(['--arg=']);
			expect(commandline.getParsedArgs()).eql({});
		});

		it('ignores args with non equals sign separator', () => {
			createSliceStub(['--arg:value']);
			expect(commandline.getParsedArgs()).eql({});
		});

		it('ignores args with missing double dashes', () => {
			createSliceStub(['arg=value']);
			expect(commandline.getParsedArgs()).eql({});
		});

		it('returns the value for an existing key', () => {
			createSliceStub(['--arg=value']);
			expect(commandline.getParsedArgs('arg')).to.eql({ arg: 'value' });
		});
	});
});
