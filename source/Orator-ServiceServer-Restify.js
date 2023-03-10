const libOratorServiceServerBase = require('orator').ServiceServerBase;
const libRestify = require('restify');

class OratorServiceServerRestify extends libOratorServiceServerBase
{
	constructor(pOrator)
	{
		super(pOrator);

		this.ServiceServerType = 'Restify';

		this.server = libRestify.createServer();
	}

	/*
	 * Service Lifecycle Functions
	 *************************************************************************/
	listen(pPort, fCallback)
	{
		this.server.listen(pPort, (pError) =>
			{
				this.Active = true;
				this.log.info(`RESTIFY server [${this.server.name}] listening on [${this.server.url}].`);
				return fCallback(pError);
			});
	}

	close(fCallback)
	{
		this.server.close((pError) =>
			{
				this.Active = false;
				this.log.info(`RESTIFY server closed.`)
				return fCallback(pError);
			});
	}
	/*************************************************************************
	 * End of Service Lifecycle Functions
	 */



	bodyParser()
	{
		// Restify has a built-in bodyParser plugin that returns a standard
		// f(Request, Response, Next) => {}; function.
		return libRestify.plugins.bodyParser(
			{
				maxBodySize: 0,
				mapParams: false,
				mapFiles: false,
				overrideParams: false,
/*
				multipartHandler: function(part)
					{
						part.on('data', function(data) {
						// do something with the multipart data
						});
					},
				multipartFileHandler: function(part)
					{
						part.on('data', function(data) {
						// do something with the multipart file data
						});
					},
				keepExtensions: false,
				uploadDir: os.tmpdir(),
*/
				multiples: true,
				hash: 'sha1'
			});
	}

	/*
	 * Service Route Functions
	 *************************************************************************/
	doGet(pRoute, ...fRouteProcessingFunctions)
	{
		return this.server.get(pRoute, ...fRouteProcessingFunctions);
	}

	doPut(pRoute, ...fRouteProcessingFunctions)
	{
		return this.server.put(pRoute, ...fRouteProcessingFunctions);
	}

	doPost(pRoute, ...fRouteProcessingFunctions)
	{
		return this.server.post(pRoute, ...fRouteProcessingFunctions);
	}

	doDel(pRoute, ...fRouteProcessingFunctions)
	{
		return this.server.del(pRoute, ...fRouteProcessingFunctions);
	}

	doPatch(pRoute, ...fRouteProcessingFunctions)
	{
		return this.server.patch(pRoute, ...fRouteProcessingFunctions);
	}

	doOpts(pRoute, ...fRouteProcessingFunctions)
	{
		return this.server.opts(pRoute, ...fRouteProcessingFunctions);
	}

	doHead(pRoute, ...fRouteProcessingFunctions)
	{
		return this.server.head(pRoute, ...fRouteProcessingFunctions);
	}
	/*************************************************************************
	 * End of Service Route Creation Functions
	 */
}

module.exports = OratorServiceServerRestify;
