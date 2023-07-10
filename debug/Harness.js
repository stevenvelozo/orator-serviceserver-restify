const libFable = require('fable');
const defaultFableSettings = (
	{
		Product:'Orator-ServiceServer-Restify-Harness',
		ProductVersion: '1.0.0',
		APIServerPort: 8086
	});

// Initialize Fable
let _Fable = new libFable(defaultFableSettings);

// Now initialize the Restify ServiceServer Fable Service
// If we don't initialize this, orator will initialize IPC by default.
// TODO: Should that be different in node than browser?  Easy to change.
_Fable.serviceManager.addServiceType('OratorServiceServer', require('../source/Orator-ServiceServer-Restify.js'));
_Fable.serviceManager.instantiateServiceProvider('OratorServiceServer', 
	{
		RestifyConfiguration: { strictNext: true }
	});

// Now add the orator service to Fable
_Fable.serviceManager.addServiceType('Orator', require('orator'));
let _Orator = _Fable.serviceManager.instantiateServiceProvider('Orator', {});

_Fable.Utility.waterfall(
	[
		_Orator.initialize.bind(_Orator),
		(fStageComplete)=>
		{
			// Create an endpoint.  This can also be done after the service is started.
			_Orator.serviceServer.get
			(
				'/test/:hash',
				(pRequest, pResponse, fNext) =>
				{
					// Send back the request parameters
					pResponse.send(pRequest.params);
					_Orator.fable.log.info(`Endpoint sent parameters object:`,pRequest.params);
					// Restify will be unhappy with this due to strictNext
					fNext()
					return fNext();
				}
			);
			return fStageComplete();
		},
		_Orator.startService.bind(_Orator),
	],
	(pError)=>
	{
		if (pError)
		{
			_Fable.log.error('Error initializing Orator Service Server: '+pError.message, pError);
		}
		_Fable.log.info('Orator Service Server Initialized.');
	});
