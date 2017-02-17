import { describe, it } from 'mocha';
import { expect } from 'chai';
import check from '../../src/core/check';

describe('check', () => {

	describe('defined', () => {

		it('returns defined value', ()=> {
			expect(check.defined('name', 123)).to.equal(123);
		});

		it('requires name', ()=> {
			expect(() => { check.defined() }).to.throw('name must be defined');
		});

		it('rejects null values', ()=> {
			expect(() => { check.defined('paramName', null) }).to.throw('paramName must be defined');
		});

		it('rejects undefined values', ()=> {
			expect(() => { check.defined('paramName', undefined) }).to.throw('paramName must be defined');
		});
	});

	describe('definedString', () => {

		it('requires name', ()=> {
			expect(() => { check.definedString() }).to.throw('name must be defined');
		});

		it('returns defined value', ()=> {
			const string = 'my string';
			const stringObject = new String('my string');
			expect(check.definedString('paramName', string)).to.equal(string);
			expect(check.definedString('paramName', stringObject)).to.equal(stringObject);
			expect(check.definedString('paramName', stringObject)).to.not.equal(new String('my string'));
		});

		it('rejects null values', ()=> {
			expect(() => { check.definedString('paramName', null) }).to.throw('paramName must be defined');
		});

		it('rejects undefined values', ()=> {
			expect(() => { check.definedString('paramName') }).to.throw('paramName must be defined');
		});

		it('rejects non-string values', ()=> {
			expect(() => { check.definedString('paramName', 123) }).to.throw('paramName must be of type string. Found: [object Number]');
		});
	});

	describe('nonEmptyString', () => {

		it('requires name', ()=> {
			expect(() => { check.nonEmptyString() }).to.throw('name must be defined');
		});

		it('returns defined value', ()=> {
			const string = 'testString';
			expect(check.nonEmptyString('paramName', string)).to.equal(string);
		});

		it('rejects null values', ()=> {
			expect(() => check.nonEmptyString('paramName', null)).to.throw('paramName must be defined');
		});

		it('rejects undefined values', ()=> {
			expect(() => check.nonEmptyString('paramName')).to.throw('paramName must be defined');
		});

		it('rejects empty values', ()=> {
			expect(() => check.nonEmptyString('paramName', '')).to.throw('paramName must not be empty');
		});

		it('rejects non-string values', ()=> {
			expect(() => check.nonEmptyString('paramName', 123)).to.throw('paramName must be of type string. Found: [object Number]');
		});
	});

	describe('definedBoolean', () => {

		it('requires name', ()=> {
			expect(() => { check.definedBoolean() }).to.throw('name must be defined');
		});

		it('returns defined value', ()=> {
			const boolean = true;
			expect(check.definedBoolean('paramName', boolean)).to.equal(true);
		});

		it('rejects null values', ()=> {
			expect(() => { check.definedBoolean('paramName', null) }).to.throw('paramName must be defined');
		});

		it('rejects undefined values', ()=> {
			expect(() => { check.definedBoolean('paramName') }).to.throw('paramName must be defined');
		});

		it('rejects non-boolean values', ()=> {
			expect(() => { check.definedBoolean('paramName', 123) }).to.throw('paramName must be of type boolean. Found: [object Number]');
		});
	});

	describe('definedNumber', () => {

		it('requires name', ()=> {
			expect(() => { check.definedNumber() }).to.throw('name must be defined');
		});

		it('returns defined value', ()=> {
			const number = 1235;
			expect(check.definedNumber('paramName', number)).to.equal(1235);
		});

		it('rejects null values', ()=> {
			expect(() => { check.definedNumber('paramName', null) }).to.throw('paramName must be defined');
		});

		it('rejects undefined values', ()=> {
			expect(() => { check.definedNumber('paramName') }).to.throw('paramName must be defined');
		});

		it('rejects non-number values', ()=> {
			expect(() => { check.definedNumber('paramName', false) }).to.throw('paramName must be of type number. Found: [object Boolean]');
		});
	});

	describe('definedArray', () => {

		it('requires name', ()=> {
			expect(() => { check.definedArray() }).to.throw('name must be defined');
		});

		it('returns defined value', ()=> {
			const array = [123, 456];
			expect(check.definedArray('paramName', array)).to.equal(array);
			expect(check.definedArray('paramName', array)).to.not.equal([123, 456]);
		});

		it('rejects null values', ()=> {
			expect(() => { check.definedArray('paramName', null) }).to.throw('paramName must be defined');
		});

		it('rejects undefined values', ()=> {
			expect(() => { check.definedArray('paramName') }).to.throw('paramName must be defined');
		});

		it('rejects non-array values', ()=> {
			expect(() => { check.definedArray('paramName', 'string') }).to.throw('paramName must be of type array. Found: [object String]');
		});
	});

	describe('nonEmptyArray', () => {

		it('requires name', ()=> {
			expect(() => { check.nonEmptyArray() }).to.throw('name must be defined');
		});

		it('returns defined value', ()=> {
			const array = [123, 456];
			expect(check.nonEmptyArray('paramName', array)).to.equal(array);
			expect(check.nonEmptyArray('paramName', array)).to.not.equal([123, 456]);
		});

		it('rejects null values', ()=> {
			expect(() => { check.nonEmptyArray('paramName', null) }).to.throw('paramName must be defined');
		});

		it('rejects undefined values', ()=> {
			expect(() => { check.nonEmptyArray('paramName') }).to.throw('paramName must be defined');
		});

		it('rejects non-array values', ()=> {
			expect(() => { check.nonEmptyArray('paramName', 'string') }).to.throw('paramName must be of type array. Found: [object String]');
		});

		it('rejects empty array value', ()=> {
			expect(() => { check.nonEmptyArray('paramName', []) }).to.throw('paramName must not be empty');
		});

	});

	describe('definedObject', () => {

		it('requires name', ()=> {
			expect(() => { check.definedObject() }).to.throw('name must be defined');
		});

		it('returns defined value', ()=> {
			const object = {};
			const other = {};
			expect(check.definedObject('paramName', object)).to.equal(object);
			expect(check.definedObject('paramName', object)).to.equal(object);
			expect(check.definedObject('paramName', object)).to.not.equal(other);
		});

		it('rejects null values', ()=> {
			expect(() => { check.definedObject('paramName', null) }).to.throw('paramName must be defined');
		});

		it('rejects undefined values', ()=> {
			expect(() => { check.definedObject('paramName') }).to.throw('paramName must be defined');
		});

		it('rejects non-object values', ()=> {
			expect(() => { check.definedObject('paramName', 123) }).to.throw('paramName must be of type object. Found: [object Number]');
		});
	});

	describe('definedFunction', () => {

		it('requires name', ()=> {
			expect(() => { check.definedFunction() }).to.throw('name must be defined');
		});

		it('returns defined value', ()=> {
			const func = () => {};
			const other = () => {};
			expect(check.definedFunction('paramName', func)).to.equal(func);
			expect(check.definedFunction('paramName', func)).to.not.equal(other);
		});

		it('rejects null values', ()=> {
			expect(() => { check.definedFunction('paramName', null) }).to.throw('paramName must be defined');
		});

		it('rejects undefined values', ()=> {
			expect(() => { check.definedFunction('paramName') }).to.throw('paramName must be defined');
		});

		it('rejects non-function values', ()=> {
			expect(() => { check.definedFunction('paramName', {}) }).to.throw('paramName must be of type function. Found: [object Object]');
		});
	});
});