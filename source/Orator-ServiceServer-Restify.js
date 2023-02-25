const libOratorServiceServerBase = require('orator-serviceserver');
const libRestify = require('restify');

class OratorServiceServerRestify extends libOratorServiceServerBase
{
	constructor(pOrator)
	{
		super(pOrator);

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

	get(pRoute, ...fRouteProcessingFunctions)
	{
		if (!super.get(pRoute, ...fRouteProcessingFunctions))
		{
			this.log.error(`RESTIFY provider failed to map GET route [${pRoute}]!`);
			return false;
		}

		return this.server.get(pRoute, ...fRouteProcessingFunctions);
	}

	put(pRoute, ...fRouteProcessingFunctions)
	{
		if (!super.put(pRoute, ...fRouteProcessingFunctions))
		{
			this.log.error(`RESTIFY provider failed to map PUT route [${pRoute}]!`);
			return false;
		}

		return this.server.put(pRoute, ...fRouteProcessingFunctions);
	}

	post(pRoute, ...fRouteProcessingFunctions)
	{
		if (!super.post(pRoute, ...fRouteProcessingFunctions))
		{
			this.log.error(`RESTIFY provider failed to map POST route [${pRoute}]!`);
			return false;
		}

		return this.server.post(pRoute, ...fRouteProcessingFunctions);
	}

	del(pRoute, ...fRouteProcessingFunctions)
	{
		if (!super.del(pRoute, ...fRouteProcessingFunctions))
		{
			this.log.error(`RESTIFY provider failed to map DEL route [${pRoute}]!`);
			return false;
		}

		return this.server.del(pRoute, ...fRouteProcessingFunctions);
	}

	patch(pRoute, ...fRouteProcessingFunctions)
	{
		if (!super.patch(pRoute, ...fRouteProcessingFunctions))
		{
			this.log.error(`RESTIFY provider failed to map PATCH route [${pRoute}]!`);
			return false;
		}

		return this.server.patch(pRoute, ...fRouteProcessingFunctions);
	}

	opts(pRoute, ...fRouteProcessingFunctions)
	{
		if (!super.opts(pRoute, ...fRouteProcessingFunctions))
		{
			this.log.error(`RESTIFY provider failed to map OPTS route [${pRoute}]!`);
			return false;
		}

		return this.server.opts(pRoute, ...fRouteProcessingFunctions);
	}

	head(pRoute, ...fRouteProcessingFunctions)
	{
		if (!super.head(pRoute, ...fRouteProcessingFunctions))
		{
			this.log.error(`RESTIFY provider failed to map HEAD route [${pRoute}]!`);
			return false;
		}

		return this.server.head(pRoute, ...fRouteProcessingFunctions);
	}

	/*************************************************************************
	 * End of Service Route Creation Functions
	 */
}

module.exports = OratorServiceServerRestify;