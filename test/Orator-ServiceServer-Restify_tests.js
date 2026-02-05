/**
* Unit tests for Orator ServiceServer Restify
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

const Chai = require("chai");
const Expect = Chai.expect;

const libFable = require('fable');
const libOrator = require('orator');
const libOratorServiceServerRestify = require('../source/Orator-ServiceServer-Restify.js');
const libHTTP = require('http');

const defaultFableSettings = (
	{
		Product: 'OratorRestify-Tests',
		ProductVersion: '0.0.0',
		APIServerPort: 0
	});

// A small test port range -- using 0 would be ideal but Restify picks a random
// port that is hard to discover. Instead, we use a high ephemeral port and
// increment for each test to prevent collisions.
let _TestPort = 18200;
function getNextTestPort()
{
	return _TestPort++;
}

/**
 * Helper to create a Fable + Orator harness wired to the Restify service server.
 *
 * @param {object} pFableSettings - Extra fable settings to merge.
 * @param {object} pOratorOptions - Options for the Orator instance.
 * @param {object} pRestifyServerOptions - Options for the OratorServiceServer instance.
 * @returns {object} Harness with fable, orator, restifyServer properties.
 */
function createHarness(pFableSettings, pOratorOptions, pRestifyServerOptions)
{
	let tmpFableSettings = Object.assign({}, defaultFableSettings, pFableSettings || {});
	let tmpFable = new libFable(tmpFableSettings);

	tmpFable.serviceManager.addServiceType('OratorServiceServer', libOratorServiceServerRestify);
	tmpFable.serviceManager.addServiceType('Orator', libOrator);

	let tmpRestifyServer = tmpFable.serviceManager.instantiateServiceProvider('OratorServiceServer', pRestifyServerOptions || {});
	let tmpOrator = tmpFable.serviceManager.instantiateServiceProvider('Orator', pOratorOptions || {});

	return (
		{
			fable: tmpFable,
			orator: tmpOrator,
			restifyServer: tmpRestifyServer
		});
}

/**
 * Helper to make a simple HTTP request to the test server.
 *
 * @param {string} pMethod - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {number} pPort - Port to connect to.
 * @param {string} pPath - URL path.
 * @param {string|null} pBody - Request body (JSON string) or null.
 * @param {Function} fCallback - Called with (error, statusCode, responseBody).
 */
function makeRequest(pMethod, pPort, pPath, pBody, fCallback)
{
	let tmpOptions = (
		{
			hostname: '127.0.0.1',
			port: pPort,
			path: pPath,
			method: pMethod,
			headers: {}
		});

	if (pBody)
	{
		tmpOptions.headers['Content-Type'] = 'application/json';
		tmpOptions.headers['Content-Length'] = Buffer.byteLength(pBody);
	}

	let tmpResponseData = '';
	let tmpRequest = libHTTP.request(tmpOptions,
		(pResponse) =>
		{
			pResponse.on('data', (pChunk) => { tmpResponseData += pChunk; });
			pResponse.on('end', () =>
			{
				return fCallback(null, pResponse.statusCode, tmpResponseData);
			});
		});

	tmpRequest.on('error', (pError) =>
	{
		return fCallback(pError, null, null);
	});

	if (pBody)
	{
		tmpRequest.write(pBody);
	}

	tmpRequest.end();
}

suite
(
	'Orator ServiceServer Restify',
	() =>
	{
		suite
		(
			'Object Sanity',
			() =>
			{
				test
				(
					'the restify service server should initialize as a proper object',
					(fDone) =>
					{
						let tmpHarness = createHarness();

						Expect(tmpHarness.restifyServer).to.be.an('object');
						Expect(tmpHarness.restifyServer.ServiceServerType).to.equal('Restify');
						Expect(tmpHarness.restifyServer.Active).to.equal(false);
						Expect(tmpHarness.restifyServer).to.have.a.property('server');
						Expect(tmpHarness.restifyServer.server).to.be.an('object');

						return fDone();
					}
				);

				test
				(
					'orator should detect the restify service server as the active server provider',
					(fDone) =>
					{
						let tmpHarness = createHarness();

						tmpHarness.orator.initialize(
							(pError) =>
							{
								Expect(tmpHarness.orator.serviceServer.ServiceServerType).to.equal('Restify');
								return fDone();
							});
					}
				);

				test
				(
					'the restify server should have all required route methods from the base class',
					(fDone) =>
					{
						let tmpHarness = createHarness();

						// Base class route methods (the public API)
						Expect(tmpHarness.restifyServer.get).to.be.a('function');
						Expect(tmpHarness.restifyServer.put).to.be.a('function');
						Expect(tmpHarness.restifyServer.post).to.be.a('function');
						Expect(tmpHarness.restifyServer.del).to.be.a('function');
						Expect(tmpHarness.restifyServer.patch).to.be.a('function');
						Expect(tmpHarness.restifyServer.opts).to.be.a('function');
						Expect(tmpHarness.restifyServer.head).to.be.a('function');

						// Implementation methods
						Expect(tmpHarness.restifyServer.doGet).to.be.a('function');
						Expect(tmpHarness.restifyServer.doPut).to.be.a('function');
						Expect(tmpHarness.restifyServer.doPost).to.be.a('function');
						Expect(tmpHarness.restifyServer.doDel).to.be.a('function');
						Expect(tmpHarness.restifyServer.doPatch).to.be.a('function');
						Expect(tmpHarness.restifyServer.doOpts).to.be.a('function');
						Expect(tmpHarness.restifyServer.doHead).to.be.a('function');

						// WithBodyParser convenience methods
						Expect(tmpHarness.restifyServer.getWithBodyParser).to.be.a('function');
						Expect(tmpHarness.restifyServer.putWithBodyParser).to.be.a('function');
						Expect(tmpHarness.restifyServer.postWithBodyParser).to.be.a('function');
						Expect(tmpHarness.restifyServer.delWithBodyParser).to.be.a('function');
						Expect(tmpHarness.restifyServer.patchWithBodyParser).to.be.a('function');

						// Lifecycle methods
						Expect(tmpHarness.restifyServer.listen).to.be.a('function');
						Expect(tmpHarness.restifyServer.close).to.be.a('function');
						Expect(tmpHarness.restifyServer.use).to.be.a('function');
						Expect(tmpHarness.restifyServer.pre).to.be.a('function');
						Expect(tmpHarness.restifyServer.bodyParser).to.be.a('function');

						return fDone();
					}
				);
			}
		);

		suite
		(
			'Restify Configuration',
			() =>
			{
				test
				(
					'the restify server should use default configuration when no RestifyConfiguration is provided',
					(fDone) =>
					{
						let tmpHarness = createHarness();

						// The server should exist and be a restify server instance
						Expect(tmpHarness.restifyServer.server).to.be.an('object');
						Expect(tmpHarness.restifyServer.server.listen).to.be.a('function');

						return fDone();
					}
				);

				test
				(
					'the restify server should accept configuration via the options parameter',
					(fDone) =>
					{
						let tmpHarness = createHarness(null, null,
							{
								RestifyConfiguration:
								{
									name: 'CustomTestServer'
								}
							});

						Expect(tmpHarness.restifyServer.server.name).to.equal('CustomTestServer');

						return fDone();
					}
				);

				test
				(
					'the restify server should accept configuration via fable settings',
					(fDone) =>
					{
						let tmpHarness = createHarness(
							{
								RestifyConfiguration:
								{
									name: 'FableSettingsServer'
								}
							});

						// Note: fable settings RestifyConfiguration is only used when
						// options does not have RestifyConfiguration
						Expect(tmpHarness.restifyServer.server.name).to.equal('FableSettingsServer');

						return fDone();
					}
				);

				test
				(
					'the options RestifyConfiguration should take precedence over fable settings',
					(fDone) =>
					{
						let tmpHarness = createHarness(
							{
								RestifyConfiguration:
								{
									name: 'FableSettingsServer'
								}
							},
							null,
							{
								RestifyConfiguration:
								{
									name: 'OptionsServer'
								}
							});

						Expect(tmpHarness.restifyServer.server.name).to.equal('OptionsServer');

						return fDone();
					}
				);
			}
		);

		suite
		(
			'Service Lifecycle',
			() =>
			{
				test
				(
					'the restify server should listen on a port and set Active to true',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness();

						Expect(tmpHarness.restifyServer.Active).to.equal(false);

						tmpHarness.restifyServer.listen(tmpPort,
							(pError) =>
							{
								Expect(pError).to.not.exist;
								Expect(tmpHarness.restifyServer.Active).to.equal(true);
								Expect(tmpHarness.restifyServer.Port).to.equal(tmpPort);

								tmpHarness.restifyServer.close(
									(pCloseError) =>
									{
										Expect(tmpHarness.restifyServer.Active).to.equal(false);
										return fDone();
									});
							});
					}
				);

				test
				(
					'orator should initialize and start with restify as the service server',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								Expect(tmpHarness.orator.serviceServer.ServiceServerType).to.equal('Restify');
								Expect(tmpHarness.orator.serviceServer.Active).to.equal(true);

								tmpHarness.orator.stopService(
									() =>
									{
										Expect(tmpHarness.orator.serviceServer.Active).to.equal(false);
										return fDone();
									});
							});
					}
				);

				test
				(
					'the restify server should start and stop cleanly',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								Expect(tmpHarness.orator.serviceServer.Active).to.equal(true);

								// Make a health check request to verify it's really listening
								makeRequest('GET', tmpPort, '/not-a-real-route', null,
									(pError, pStatus, pBody) =>
									{
										// A 404 still proves the server is running
										Expect(pError).to.be.null;

										tmpHarness.orator.stopService(
											() =>
											{
												Expect(tmpHarness.orator.serviceServer.Active).to.equal(false);
												return fDone();
											});
									});
							});
					}
				);
			}
		);

		suite
		(
			'Route Registration and HTTP Requests',
			() =>
			{
				test
				(
					'GET routes should serve responses via HTTP',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								tmpHarness.orator.serviceServer.get('/api/status',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send({ Status: 'OK', Server: 'Restify' });
										return fNext();
									});

								makeRequest('GET', tmpPort, '/api/status', null,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(200);
										let tmpResponse = JSON.parse(pBody);
										Expect(tmpResponse.Status).to.equal('OK');
										Expect(tmpResponse.Server).to.equal('Restify');

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);

				test
				(
					'GET routes should handle URL parameters',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								tmpHarness.orator.serviceServer.get('/api/user/:id',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send({ UserID: pRequest.params.id });
										return fNext();
									});

								makeRequest('GET', tmpPort, '/api/user/42', null,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(200);
										let tmpResponse = JSON.parse(pBody);
										Expect(tmpResponse.UserID).to.equal('42');

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);

				test
				(
					'POST routes should accept and process request bodies',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								// bodyParser() returns an array of handler functions in Restify,
								// so we apply it directly to the underlying server rather than
								// through the base class use() which validates for a single function.
								tmpHarness.restifyServer.server.use(tmpHarness.orator.serviceServer.bodyParser());

								tmpHarness.orator.serviceServer.post('/api/items',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send({ Created: true, Body: pRequest.body });
										return fNext();
									});

								let tmpBody = JSON.stringify({ Name: 'TestItem', Value: 42 });

								makeRequest('POST', tmpPort, '/api/items', tmpBody,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(200);
										let tmpResponse = JSON.parse(pBody);
										Expect(tmpResponse.Created).to.equal(true);
										Expect(tmpResponse.Body).to.be.an('object');
										Expect(tmpResponse.Body.Name).to.equal('TestItem');
										Expect(tmpResponse.Body.Value).to.equal(42);

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);

				test
				(
					'PUT routes should accept request bodies and URL parameters',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								tmpHarness.restifyServer.server.use(tmpHarness.orator.serviceServer.bodyParser());

								tmpHarness.orator.serviceServer.put('/api/items/:id',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send({ Updated: true, ID: pRequest.params.id, Body: pRequest.body });
										return fNext();
									});

								let tmpBody = JSON.stringify({ Name: 'UpdatedItem' });

								makeRequest('PUT', tmpPort, '/api/items/99', tmpBody,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(200);
										let tmpResponse = JSON.parse(pBody);
										Expect(tmpResponse.Updated).to.equal(true);
										Expect(tmpResponse.ID).to.equal('99');
										Expect(tmpResponse.Body.Name).to.equal('UpdatedItem');

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);

				test
				(
					'DELETE routes should respond with confirmation',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								tmpHarness.orator.serviceServer.del('/api/items/:id',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send({ Deleted: true, ID: pRequest.params.id });
										return fNext();
									});

								makeRequest('DELETE', tmpPort, '/api/items/55', null,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(200);
										let tmpResponse = JSON.parse(pBody);
										Expect(tmpResponse.Deleted).to.equal(true);
										Expect(tmpResponse.ID).to.equal('55');

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);

				test
				(
					'PATCH routes should respond via HTTP',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								tmpHarness.restifyServer.server.use(tmpHarness.orator.serviceServer.bodyParser());

								tmpHarness.orator.serviceServer.patch('/api/items/:id',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send({ Patched: true, ID: pRequest.params.id, Body: pRequest.body });
										return fNext();
									});

								let tmpBody = JSON.stringify({ Name: 'PatchedItem' });

								makeRequest('PATCH', tmpPort, '/api/items/77', tmpBody,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(200);
										let tmpResponse = JSON.parse(pBody);
										Expect(tmpResponse.Patched).to.equal(true);
										Expect(tmpResponse.ID).to.equal('77');

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);

				test
				(
					'OPTIONS routes should respond via HTTP',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								tmpHarness.orator.serviceServer.opts('/api/items',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send(200, { Methods: ['GET', 'POST', 'PUT', 'DELETE'] });
										return fNext();
									});

								makeRequest('OPTIONS', tmpPort, '/api/items', null,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(200);
										let tmpResponse = JSON.parse(pBody);
										Expect(tmpResponse.Methods).to.be.an('array');
										Expect(tmpResponse.Methods).to.include('GET');
										Expect(tmpResponse.Methods).to.include('DELETE');

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);

				test
				(
					'HEAD routes should respond with headers but no body',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								// Note: The base class head() method has a known issue where it
								// returns true without calling doHead(), so we call doHead directly
								// on the restify service server to register the HEAD route.
								tmpHarness.orator.serviceServer.doHead('/api/status',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.header('X-Custom-Header', 'TestValue');
										pResponse.send(200);
										return fNext();
									});

								makeRequest('HEAD', tmpPort, '/api/status', null,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(200);
										// HEAD responses should have no body
										Expect(pBody).to.equal('');

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);
			}
		);

		suite
		(
			'Middleware',
			() =>
			{
				test
				(
					'use() should add middleware that runs on every request',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								// Add middleware that sets a custom property on every request
								tmpHarness.orator.serviceServer.use(
									(pRequest, pResponse, fNext) =>
									{
										pRequest.CustomDecoration = 'DecoratedByMiddleware';
										return fNext();
									});

								tmpHarness.orator.serviceServer.get('/api/decorated',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send({ Decoration: pRequest.CustomDecoration });
										return fNext();
									});

								makeRequest('GET', tmpPort, '/api/decorated', null,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(200);
										let tmpResponse = JSON.parse(pBody);
										Expect(tmpResponse.Decoration).to.equal('DecoratedByMiddleware');

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);

				test
				(
					'use() should reject non-function parameters',
					(fDone) =>
					{
						let tmpHarness = createHarness();

						let tmpResult = tmpHarness.restifyServer.use('not-a-function');
						Expect(tmpResult).to.equal(false);

						return fDone();
					}
				);

				test
				(
					'pre() should add middleware that runs before routing',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								tmpHarness.orator.serviceServer.pre(
									(pRequest, pResponse, fNext) =>
									{
										pRequest.PreMiddlewareRan = true;
										return fNext();
									});

								tmpHarness.orator.serviceServer.get('/api/pre-test',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send({ PreRan: pRequest.PreMiddlewareRan === true });
										return fNext();
									});

								makeRequest('GET', tmpPort, '/api/pre-test', null,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(200);
										let tmpResponse = JSON.parse(pBody);
										Expect(tmpResponse.PreRan).to.equal(true);

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);

				test
				(
					'pre() should reject non-function parameters',
					(fDone) =>
					{
						let tmpHarness = createHarness();

						let tmpResult = tmpHarness.restifyServer.pre(42);
						Expect(tmpResult).to.equal(false);

						return fDone();
					}
				);

				test
				(
					'bodyParser() should return a restify body parser plugin function',
					(fDone) =>
					{
						let tmpHarness = createHarness();

						let tmpParser = tmpHarness.restifyServer.bodyParser();

						// bodyParser returns an array of functions (restify plugins can be arrays)
						Expect(tmpParser).to.satisfy(
							(pValue) =>
							{
								return (typeof pValue === 'function') || (Array.isArray(pValue));
							});

						return fDone();
					}
				);

				test
				(
					'multiple use() calls should chain middleware in order',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								tmpHarness.orator.serviceServer.use(
									(pRequest, pResponse, fNext) =>
									{
										pRequest.MiddlewareChain = ['First'];
										return fNext();
									});

								tmpHarness.orator.serviceServer.use(
									(pRequest, pResponse, fNext) =>
									{
										pRequest.MiddlewareChain.push('Second');
										return fNext();
									});

								tmpHarness.orator.serviceServer.use(
									(pRequest, pResponse, fNext) =>
									{
										pRequest.MiddlewareChain.push('Third');
										return fNext();
									});

								tmpHarness.orator.serviceServer.get('/api/chain',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send({ Chain: pRequest.MiddlewareChain });
										return fNext();
									});

								makeRequest('GET', tmpPort, '/api/chain', null,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(200);
										let tmpResponse = JSON.parse(pBody);
										Expect(tmpResponse.Chain).to.be.an('array');
										Expect(tmpResponse.Chain).to.deep.equal(['First', 'Second', 'Third']);

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);
			}
		);

		suite
		(
			'Complex Routes',
			() =>
			{
				test
				(
					'multiple routes should coexist and respond independently',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								tmpHarness.orator.serviceServer.get('/api/users',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send({ Type: 'Users', Method: 'GET' });
										return fNext();
									});

								tmpHarness.orator.serviceServer.get('/api/items',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send({ Type: 'Items', Method: 'GET' });
										return fNext();
									});

								tmpHarness.orator.serviceServer.post('/api/users',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send({ Type: 'Users', Method: 'POST' });
										return fNext();
									});

								tmpHarness.fable.Utility.waterfall(
									[
										(fStageComplete) =>
										{
											makeRequest('GET', tmpPort, '/api/users', null,
												(pError, pStatus, pBody) =>
												{
													Expect(pError).to.be.null;
													Expect(pStatus).to.equal(200);
													let tmpResponse = JSON.parse(pBody);
													Expect(tmpResponse.Type).to.equal('Users');
													Expect(tmpResponse.Method).to.equal('GET');
													return fStageComplete();
												});
										},
										(fStageComplete) =>
										{
											makeRequest('GET', tmpPort, '/api/items', null,
												(pError, pStatus, pBody) =>
												{
													Expect(pError).to.be.null;
													Expect(pStatus).to.equal(200);
													let tmpResponse = JSON.parse(pBody);
													Expect(tmpResponse.Type).to.equal('Items');
													return fStageComplete();
												});
										},
										(fStageComplete) =>
										{
											makeRequest('POST', tmpPort, '/api/users', null,
												(pError, pStatus, pBody) =>
												{
													Expect(pError).to.be.null;
													Expect(pStatus).to.equal(200);
													let tmpResponse = JSON.parse(pBody);
													Expect(tmpResponse.Type).to.equal('Users');
													Expect(tmpResponse.Method).to.equal('POST');
													return fStageComplete();
												});
										}
									],
									(pError) =>
									{
										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);

				test
				(
					'routes with multiple URL parameters should parse correctly',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								tmpHarness.orator.serviceServer.get('/api/org/:orgId/user/:userId',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send(
											{
												OrgID: pRequest.params.orgId,
												UserID: pRequest.params.userId
											});
										return fNext();
									});

								makeRequest('GET', tmpPort, '/api/org/AcmeCorp/user/jsmith', null,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(200);
										let tmpResponse = JSON.parse(pBody);
										Expect(tmpResponse.OrgID).to.equal('AcmeCorp');
										Expect(tmpResponse.UserID).to.equal('jsmith');

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);

				test
				(
					'routes should handle wildcard paths',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								tmpHarness.orator.serviceServer.get('/api/proxy/:path',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send({ Path: pRequest.params.path });
										return fNext();
									});

								makeRequest('GET', tmpPort, '/api/proxy/some-deep-path', null,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(200);
										let tmpResponse = JSON.parse(pBody);
										Expect(tmpResponse.Path).to.equal('some-deep-path');

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);

				test
				(
					'routes should support multiple handler functions in sequence',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								tmpHarness.orator.serviceServer.get('/api/chained',
									(pRequest, pResponse, fNext) =>
									{
										// First handler decorates
										pRequest.HandlerOneRan = true;
										return fNext();
									},
									(pRequest, pResponse, fNext) =>
									{
										// Second handler sends response
										pResponse.send({ HandlerOneRan: pRequest.HandlerOneRan === true });
										return fNext();
									});

								makeRequest('GET', tmpPort, '/api/chained', null,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(200);
										let tmpResponse = JSON.parse(pBody);
										Expect(tmpResponse.HandlerOneRan).to.equal(true);

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);

				test
				(
					'undefined routes should return 404',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								makeRequest('GET', tmpPort, '/nonexistent/route', null,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(404);

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);
			}
		);

		suite
		(
			'Base Class Route Validation',
			() =>
			{
				test
				(
					'get() should return false for non-string route parameters',
					(fDone) =>
					{
						let tmpHarness = createHarness();

						let tmpResult = tmpHarness.restifyServer.get(123, () => {});
						Expect(tmpResult).to.equal(false);

						return fDone();
					}
				);

				test
				(
					'put() should return false for non-string route parameters',
					(fDone) =>
					{
						let tmpHarness = createHarness();

						let tmpResult = tmpHarness.restifyServer.put(null, () => {});
						Expect(tmpResult).to.equal(false);

						return fDone();
					}
				);

				test
				(
					'post() should return false for non-string route parameters',
					(fDone) =>
					{
						let tmpHarness = createHarness();

						let tmpResult = tmpHarness.restifyServer.post(undefined, () => {});
						Expect(tmpResult).to.equal(false);

						return fDone();
					}
				);

				test
				(
					'del() should return false for non-string route parameters',
					(fDone) =>
					{
						let tmpHarness = createHarness();

						let tmpResult = tmpHarness.restifyServer.del({}, () => {});
						Expect(tmpResult).to.equal(false);

						return fDone();
					}
				);

				test
				(
					'patch() should return false for non-string route parameters',
					(fDone) =>
					{
						let tmpHarness = createHarness();

						let tmpResult = tmpHarness.restifyServer.patch(42, () => {});
						Expect(tmpResult).to.equal(false);

						return fDone();
					}
				);

				test
				(
					'opts() should return false for non-string route parameters',
					(fDone) =>
					{
						let tmpHarness = createHarness();

						let tmpResult = tmpHarness.restifyServer.opts([], () => {});
						Expect(tmpResult).to.equal(false);

						return fDone();
					}
				);

				test
				(
					'head() should return false for non-string route parameters',
					(fDone) =>
					{
						let tmpHarness = createHarness();

						let tmpResult = tmpHarness.restifyServer.head(true, () => {});
						Expect(tmpResult).to.equal(false);

						return fDone();
					}
				);
			}
		);

		suite
		(
			'WithBodyParser Convenience Methods',
			() =>
			{
				test
				(
					'postWithBodyParser should parse JSON bodies automatically',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								tmpHarness.orator.serviceServer.postWithBodyParser('/api/auto-parse',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send({ Received: pRequest.body });
										return fNext();
									});

								let tmpBody = JSON.stringify({ AutoParsed: true, Count: 7 });

								makeRequest('POST', tmpPort, '/api/auto-parse', tmpBody,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(200);
										let tmpResponse = JSON.parse(pBody);
										Expect(tmpResponse.Received).to.be.an('object');
										Expect(tmpResponse.Received.AutoParsed).to.equal(true);
										Expect(tmpResponse.Received.Count).to.equal(7);

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);

				test
				(
					'putWithBodyParser should parse JSON bodies automatically',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								tmpHarness.orator.serviceServer.putWithBodyParser('/api/auto-put/:id',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send({ ID: pRequest.params.id, Body: pRequest.body });
										return fNext();
									});

								let tmpBody = JSON.stringify({ Updated: true });

								makeRequest('PUT', tmpPort, '/api/auto-put/123', tmpBody,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(200);
										let tmpResponse = JSON.parse(pBody);
										Expect(tmpResponse.ID).to.equal('123');
										Expect(tmpResponse.Body.Updated).to.equal(true);

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);

				test
				(
					'patchWithBodyParser should parse JSON bodies automatically',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								tmpHarness.orator.serviceServer.patchWithBodyParser('/api/auto-patch/:id',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send({ ID: pRequest.params.id, Body: pRequest.body });
										return fNext();
									});

								let tmpBody = JSON.stringify({ Patched: true });

								makeRequest('PATCH', tmpPort, '/api/auto-patch/456', tmpBody,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(200);
										let tmpResponse = JSON.parse(pBody);
										Expect(tmpResponse.ID).to.equal('456');
										Expect(tmpResponse.Body.Patched).to.equal(true);

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);
			}
		);

		suite
		(
			'Response Status Codes',
			() =>
			{
				test
				(
					'routes should support custom HTTP status codes',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								tmpHarness.orator.serviceServer.post('/api/created',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send(201, { Created: true });
										return fNext();
									});

								makeRequest('POST', tmpPort, '/api/created', null,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(201);
										let tmpResponse = JSON.parse(pBody);
										Expect(tmpResponse.Created).to.equal(true);

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);

				test
				(
					'routes should support returning error status codes',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								tmpHarness.orator.serviceServer.get('/api/forbidden',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send(403, { Error: 'Forbidden' });
										return fNext();
									});

								makeRequest('GET', tmpPort, '/api/forbidden', null,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(403);
										let tmpResponse = JSON.parse(pBody);
										Expect(tmpResponse.Error).to.equal('Forbidden');

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);

				test
				(
					'routes should support 204 no content responses',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								tmpHarness.orator.serviceServer.del('/api/no-content/:id',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.send(204);
										return fNext();
									});

								makeRequest('DELETE', tmpPort, '/api/no-content/1', null,
									(pError, pStatus, pBody) =>
									{
										Expect(pError).to.be.null;
										Expect(pStatus).to.equal(204);

										tmpHarness.orator.stopService(() => { return fDone(); });
									});
							});
					}
				);
			}
		);

		suite
		(
			'Response Headers',
			() =>
			{
				test
				(
					'routes should support setting custom response headers',
					(fDone) =>
					{
						let tmpPort = getNextTestPort();
						let tmpHarness = createHarness({ APIServerPort: tmpPort });

						tmpHarness.orator.startService(
							() =>
							{
								tmpHarness.orator.serviceServer.get('/api/custom-headers',
									(pRequest, pResponse, fNext) =>
									{
										pResponse.header('X-Custom-Header', 'CustomValue');
										pResponse.header('X-Request-ID', '12345');
										pResponse.send({ Headers: 'Set' });
										return fNext();
									});

								let tmpOptions = (
									{
										hostname: '127.0.0.1',
										port: tmpPort,
										path: '/api/custom-headers',
										method: 'GET'
									});

								let tmpResponseData = '';
								let tmpResponseHeaders = {};
								let tmpRequest = libHTTP.request(tmpOptions,
									(pResponse) =>
									{
										tmpResponseHeaders = pResponse.headers;
										pResponse.on('data', (pChunk) => { tmpResponseData += pChunk; });
										pResponse.on('end', () =>
										{
											Expect(tmpResponseHeaders['x-custom-header']).to.equal('CustomValue');
											Expect(tmpResponseHeaders['x-request-id']).to.equal('12345');

											tmpHarness.orator.stopService(() => { return fDone(); });
										});
									});
								tmpRequest.end();
							});
					}
				);
			}
		);
	}
);
