import phase from '../model/phase';
import lifecycle from '../model/lifecycle';
import baseScenario from '../baseScenario/baseScenario';
import sourcesScenario from '../sourcesScenario/sourcesScenario';
import browserScenario from '../browserScenario/browserScenario';
import productScenario from '../productScenario/productScenario';
import nodeScenario from '../nodeScenario/nodeScenario';
import logger from '../core/logger';
import os from 'os';

const initializePhase = phase.create({ id: 'initialize' });
const lintPhase = phase.create({ id: 'lint' });
const compileTestsPhase = phase.create({ id: 'compile-tests' });
const compilePhase = phase.create({ id: 'compile' });
const testPhase = phase.create({ id: 'test' });
const packagePhase = phase.create({ id: 'package' });
const installPhase = phase.create({ id: 'install' });

function buildLifecycle() {
	return lifecycle.create({
		id: 'build',
		phases: [
			initializePhase,
			lintPhase,
			compilePhase,
			compileTestsPhase,
			testPhase,
			packagePhase,
			installPhase
		],
		scenarios: [
			baseScenario.create(),
			sourcesScenario.create(),
			nodeScenario.create(),
			browserScenario.create(),
			productScenario.create()
		],
		initialize: () => {
			logEnvironment();
		}
	});
}

function logEnvironment() {
	logger.log('Operating System Type     : ' + os.type());
	logger.log('Operating System Release  : ' + os.release());
	logger.log('Hostname                  : ' + os.hostname());
	logger.log('Free System Memory        : ' + toGB(os.freemem()));
	logger.log('Total System Memory       : ' + toGB(os.totalmem()));
	logger.log('Node Version              : ' + process.versions.node);
	logger.log('User                      : ' + os.userInfo().username);
	logger.log('Home Directory            : ' + os.homedir());
}

function toGB(bytes) {
	return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}

export default {
	create: buildLifecycle
}
