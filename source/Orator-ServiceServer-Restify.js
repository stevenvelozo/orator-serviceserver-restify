const libOratorServiceServerBase = require('orator-serviceserver-base');
const libRestify = require('restify');

const _DefaultRestifyConfiguration =
{
	maxParamLength: Number.MAX_SAFE_INTEGER,
};
class OratorServiceServerRestify extends libOratorServiceServerBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
        super(pFable, pOptions, pServiceHash);

		this.ServiceServerType = 'Restify';

		let tmpRestifyConfiguration = (this.options.hasOwnProperty('RestifyConfiguration')) ? this.options.RestifyConfiguration :
			(this.fable.settings.hasOwnProperty('RestifyConfiguration')) ? this.fable.settings.RestifyConfiguration :
			{};

		this.server = libRestify.createServer(Object.assign({}, _DefaultRestifyConfiguration, tmpRestifyConfiguration));
	}

	/*
	 * Service Lifecycle Functions
	 *************************************************************************/
	listen(pPort, fCallback)
	{
		this.server.listen(pPort, (pError) =>
			{
				this.Active = true;
				this.Port = pPort;
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

	use(fHandlerFunction)
	{
		if (!super.use(fHandlerFunction))
		{
			this.log.error(`RESTIFY provider failed to map USE handler function!`);
			return false;
		}

		this.server.use(fHandlerFunction);
	}

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
