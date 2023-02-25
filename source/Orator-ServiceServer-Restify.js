const libOratorServiceServerBase = require('orator-serviceserver');
const libRestify = require('restify');

class OratorServiceServerRestify extends libOratorServiceServerBase
{
	constructor(pOrator)
	{
		super(pOrator);

		this.server = restify.createServer();			
	}

	/*
	 * Service Lifecycle Functions
	 *************************************************************************/
	listen(pPort, fCallback)
	{
		this.server.listen(pPort, (pError) =>
			{
				this.Active = true;
				this.log.info(`RESTIFY server [${server.name}] listening on [${server.url}].`);
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

		return this.server.get('/hello/:name', ...fRouteProcessingFunctions);
	}

	/*************************************************************************
	 * End of Service Route Creation Functions
	 */
}

module.exports = OratorServiceServerRestify;