const libOratorServiceServerBase = require('orator-serviceserver-base');
const libRestify = require('restify');

const _DefaultRestifyConfiguration =
{
	maxParamLength: Number.MAX_SAFE_INTEGER,
};
/**
 * @extends {libOratorServiceServerBase<import('restify').Request, import('restify').Response, import('restify').Server>}
 */
class OratorServiceServerRestify extends libOratorServiceServerBase
{
	/**
	 * @param {import('fable')|Record<string, any>} [pFable] - (optional) The fable instance, or the options object if there is no fable
	 * @param {Record<string, any>|string} [pOptions] - (optional) The options object, or the service hash if there is no fable
	 * @param {string} [pServiceHash] - (optional) The service hash to identify this service instance
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
        super(pFable, pOptions, pServiceHash);

		this.ServiceServerType = 'Restify';

		let tmpRestifyConfiguration = (this.options.hasOwnProperty('RestifyConfiguration')) ? this.options.RestifyConfiguration :
			(this.fable.settings.hasOwnProperty('RestifyConfiguration')) ? this.fable.settings.RestifyConfiguration :
			{};

		/** @type {import('restify').Server} */
		this.server = libRestify.createServer(Object.assign({}, _DefaultRestifyConfiguration, tmpRestifyConfiguration));
	}

	/*
	 * Service Lifecycle Functions
	 *************************************************************************/
	/**
	 * Listens for network calls on the specified port (or starts a virtual serviceserver for that "port").
	 * @param {number} pPort - The port number to listen on.
	 * @param {(pError?: Error) => void} fCallback - The callback function to execute after listening.
	 * @return {any} The result of the callback function.
	 */
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

	/**
	 * Closes the service server.
	 *
	 * @param {(pError?: Error) => any} fCallback - The callback function to be executed after closing the server.
	 * @return {any} - The result of the callback function.
	 */
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

	/**
	 * Registers a global handler function to be used by the Orator service server.
	 *
	 * @param {import('orator-serviceserver-base').RequestHandler<import('restify').Request, import('restify').Response>} fHandlerFunction - The handler function to be registered. It should have the prototype function(Request, Response, Next).
	 * @returns {any} - The result of adding the route to the concrete service provider (ex. a route object, a boolean).
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

	/**
	 * Registers a global handler function to be used by the Orator service server that runs before routing.
	 *
	 * @param {import('orator-serviceserver-base').RequestHandler<import('restify').Request, import('restify').Response>} fHandlerFunction - The handler function to be registered. It should have the prototype function(Request, Response, Next).
	 * @returns {any} - The result of adding the route to the concrete service provider (ex. a route object, a boolean).
	 */
	pre(fHandlerFunction)
	{
		if (!super.pre(fHandlerFunction))
		{
			this.log.error(`RESTIFY provider failed to map PRE handler function!`);
			return false;
		}

		this.server.pre(fHandlerFunction);
	}

	/**
	 * Middleware function for parsing the request body.
	 *
	 * @param {Record<string, any>} [pOptions] - The options for the body parser.
	 * @return {import('restify').RequestHandler[]} - The middleware function.
	 */
	bodyParser(pOptions)
	{
		// Restify has a built-in bodyParser plugin that returns a standard
		// f(Request, Response, Next) => {}; function.
		return libRestify.plugins.bodyParser(Object.assign(
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
			}, pOptions));
	}

	/*
	 * Service Route Functions
	 *************************************************************************/
	/**
	 * Handles HTTP GET requests -- this is a base function that does nothing; override by the serviceserver is expected.
	 *
	 * @param {string} pRoute - The route of the request.
	 * @param {...import('restify').RequestHandlerType} fRouteProcessingFunctions - The processing functions for the route.
	 * @returns {any} - The result of adding the route to the concrete service provider (ex. a route object, a boolean).
	 */
	doGet(pRoute, ...fRouteProcessingFunctions)
	{
		return this.server.get(pRoute, ...fRouteProcessingFunctions);
	}

	/**
	 * Handles HTTP PUT requests -- this is a base function that does nothing; override by the serviceserver is expected.
	 *
	 * @param {string} pRoute - The route to handle.
	 * @param {...import('restify').RequestHandlerType} fRouteProcessingFunctions - The processing functions to execute for the route.
	 * @returns {any} - The result of adding the route to the concrete service provider (ex. a route object, a boolean).
	 */
	doPut(pRoute, ...fRouteProcessingFunctions)
	{
		return this.server.put(pRoute, ...fRouteProcessingFunctions);
	}

	/**
	 * Handles the HTTP POST request for a specific route.
	 *
	 * @param {string} pRoute - The route to handle the POST request for.
	 * @param {...import('restify').RequestHandlerType} fRouteProcessingFunctions - The processing functions to execute for the route.
	 * @returns {any} - The result of adding the route to the concrete service provider (ex. a route object, a boolean).
	 */
	doPost(pRoute, ...fRouteProcessingFunctions)
	{
		return this.server.post(pRoute, ...fRouteProcessingFunctions);
	}

	/**
	 * Handles HTTP DELETE requests -- this is a base function that does nothing; override by the serviceserver is expected.
	 *
	 * @param {string} pRoute - The route of the resource to delete.
	 * @param {...import('restify').RequestHandlerType} fRouteProcessingFunctions - The processing functions to be executed to delete the resource.
	 * @returns {any} - The result of adding the route to the concrete service provider (ex. a route object, a boolean).
	 */
	doDel(pRoute, ...fRouteProcessingFunctions)
	{
		return this.server.del(pRoute, ...fRouteProcessingFunctions);
	}

	/**
	 * Handles HTTP PATCH requests -- this is a base function that does nothing; override by the serviceserver is expected.
	 *
	 * @param {string} pRoute - The route to send the PATCH request to.
	 * @param {...import('restify').RequestHandlerType} fRouteProcessingFunctions - The processing functions to apply to the route.
	 * @returns {any} - The result of adding the route to the concrete service provider (ex. a route object, a boolean).
	 */
	doPatch(pRoute, ...fRouteProcessingFunctions)
	{
		return this.server.patch(pRoute, ...fRouteProcessingFunctions);
	}

	/**
	 * Handles HTTP OPT requests -- this is a base function that does nothing; override by the serviceserver is expected.
	 *
	 * @param {string} pRoute - The route.
	 * @param {...import('restify').RequestHandlerType} fRouteProcessingFunctions - The processing functions to apply to the route.
	 * @returns {any} - The result of adding the route to the concrete service provider (ex. a route object, a boolean).
	 */
	doOpts(pRoute, ...fRouteProcessingFunctions)
	{
		return this.server.opts(pRoute, ...fRouteProcessingFunctions);
	}

	/**
	 * Handles HTTP HEAD requests -- this is a base function that does nothing; override by the serviceserver is expected.
	 *
	 * @param {string} pRoute - The route to handle the HEAD request for.
	 * @param {...import('restify').RequestHandlerType} fRouteProcessingFunctions - The processing functions to execute for the route.
	 * @returns {any} - The result of adding the route to the concrete service provider (ex. a route object, a boolean).
	 */
	doHead(pRoute, ...fRouteProcessingFunctions)
	{
		return this.server.head(pRoute, ...fRouteProcessingFunctions);
	}
	/*************************************************************************
	 * End of Service Route Creation Functions
	 */
}

module.exports = OratorServiceServerRestify;
