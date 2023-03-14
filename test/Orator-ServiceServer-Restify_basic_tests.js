/**
* Unit tests for Orator
* @license     MIT
* @author      Steven Velozo <steven@velozo.com>
*/

const Chai = require("chai");
const Expect = Chai.expect;
const Assert = Chai.assert;

const libFable = require('fable');

const _Fable = new libFable({
	"Product": "Orator-ServiceServier-Restify-BasicTests",
	"ProductVersion": "0.0.0"
})

const libOrator = require('orator');
const libOratorServiceServerRestify = require('../source/Orator-ServiceServer-Restify.js');

//const libSuperTest = require('supertest');

suite
(
	'Meadow-Endpoints-Core',
	() =>
	{
		suite
		(
			'Object Sanity',
			() =>
			{
				test
				(
					'The class should initialize itself into a happy little object.',
					function (fDone)
					{
						let tmpOrator = new libOrator(_Fable, libOratorServiceServerRestify);
						Expect(tmpOrator).to.be.an('object', 'Orator should initialize as an object directly from the require statement.');
						Expect(tmpOrator.startService).to.be.an('function');
						Expect(tmpOrator.settings).to.be.an('object');
						tmpOrator.initializeServiceServer(
							(pError)=>
							{
								Expect(tmpOrator.serviceServer.ServiceServerType).to.equal('Restify', 'The service server provider should be Restify.');
								fDone();
							});
					}
				);
			}
		);
	}
);