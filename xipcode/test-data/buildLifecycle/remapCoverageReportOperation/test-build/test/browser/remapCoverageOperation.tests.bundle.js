(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

function doSomething() {
	return 'test';
}

exports.default = {
	doSomething: doSomething
};

},{}],2:[function(require,module,exports){
'use strict';

var _chai = require('chai');

var _mocha = require('mocha');

var _module2 = require('../src/module');

var _module3 = _interopRequireDefault(_module2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _mocha.describe)('module', function () {

	(0, _mocha.describe)('doSomething', function () {

		(0, _mocha.it)('returns the correct string', function () {
			(0, _chai.expect)(_module3.default.doSomething()).to.equal('test');
		});
	});
});

},{"../src/module":1,"chai":"chai","mocha":"mocha"}]},{},[2])


;
//# sourceMappingURL=remapCoverageOperation.tests.bundle.js.map
