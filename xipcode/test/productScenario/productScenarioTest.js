import { expect } from 'chai';
import { describe, it } from 'mocha';
import productScenario from '../../src/productScenario/productScenario'

describe('productScenario', () => {

	describe('create', () => {

		it('creates the product scenario', () => {
			const scenario = productScenario.create();
			expect(scenario.id).equals('product');
			expect(scenario.isDefault).equals(false);
			expect(scenario.requires).eql(['baseScenario']);
			expect(scenario.getParticipatingPhases()).eql(['package']);
			expect(scenario.getOperationsForPhase('package').length).equals(2);
			expect(scenario.getOperationsForPhase('package')[0].id).equals('create-product-file');
			expect(scenario.getOperationsForPhase('package')[1].id).equals('uglify-product-file');
		});
	});
});