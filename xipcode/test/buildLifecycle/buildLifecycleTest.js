import { expect } from 'chai';
import { describe, it } from 'mocha';
import buildLifecycle from '../../src/buildLifecycle/buildLifecycle'
import logger from '../../src/core/logger';
import sinon from 'sinon';

describe('buildLifecycle', () => {

	const lifecycle = buildLifecycle.create();

	describe('create', () => {

		it('returns the build lifecycle', () => {
			expect(lifecycle.id).equals('build');
		});

		it('creates lifecycle with phases', () => {
			expect(lifecycle.phases.length).equals(7);
			expect(lifecycle.phases[0].id).equals('initialize');
			expect(lifecycle.phases[1].id).equals('lint');
			expect(lifecycle.phases[2].id).equals('compile');
			expect(lifecycle.phases[3].id).equals('compile-tests');
			expect(lifecycle.phases[4].id).equals('test');
			expect(lifecycle.phases[5].id).equals('package');
			expect(lifecycle.phases[6].id).equals('install');
		});

		it('creates lifecycle with scenarios', () => {
			expect(lifecycle.scenarios.length).equals(5);
			expect(lifecycle.scenarios[0].id).equals('baseScenario');
			expect(lifecycle.scenarios[1].id).equals('sourcesScenario');
			expect(lifecycle.scenarios[2].id).equals('node');
			expect(lifecycle.scenarios[3].id).equals('browser');
			expect(lifecycle.scenarios[4].id).equals('product');
		});

		it('creates lifecycle with initialize function', () => {
			expect(lifecycle.initialize).not.to.be.undefined;
			expect(typeof(lifecycle.initialize)).equal('function');
		});
	});

	describe('initialize', () => {

		let sandbox;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
		});
		afterEach(() => {
			sandbox.restore();
		});

		it('logs the environment variables', () => {
			const logStub = sandbox.stub(logger, 'log');
			lifecycle.initialize();
			expect(logStub.callCount).to.equal(8);
			expect(logStub.calledWithMatch(/Operating System Type/)).to.be.true;
			expect(logStub.calledWithMatch(/Operating System Release/)).to.be.true;
			expect(logStub.calledWithMatch(/Hostname/)).to.be.true;
			expect(logStub.calledWithMatch(/Free System Memory /)).to.be.true;
			expect(logStub.calledWithMatch(/Total System Memory /)).to.be.true;
			expect(logStub.calledWithMatch(/Node Version/)).to.be.true;
			expect(logStub.calledWithMatch(/User/)).to.be.true;
			expect(logStub.calledWithMatch(/Home Directory/)).to.be.true;
		});

	});
});