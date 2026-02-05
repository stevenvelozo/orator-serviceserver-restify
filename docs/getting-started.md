# Getting Started

## Installation

```bash
npm install fable orator orator-serviceserver-restify
```

## Setup

The Restify service server is registered with Fable as the `OratorServiceServer` service type. Orator will use it automatically once it's instantiated:

```javascript
const libFable = require('fable');
const libOrator = require('orator');
const libOratorServiceServerRestify = require('orator-serviceserver-restify');

const _Fable = new libFable({
	Product: 'MyAPIServer',
	ProductVersion: '1.0.0',
	ServicePort: 8080
});

// Register service types
_Fable.serviceManager.addServiceType('Orator', libOrator);
_Fable.serviceManager.addServiceType('OratorServiceServer', libOratorServiceServerRestify);

// Instantiate (order doesn't matter -- Orator finds the service server during initialization)
_Fable.serviceManager.instantiateServiceProvider('Orator');
_Fable.serviceManager.instantiateServiceProvider('OratorServiceServer');
```

## Defining Routes

Register route handlers on the service server using standard HTTP verb methods:

```javascript
const tmpServiceServer = _Fable.Orator.serviceServer;

// GET request
tmpServiceServer.get('/api/items',
	(pRequest, pResponse, fNext) =>
	{
		pResponse.send([{ id: 1, name: 'Item One' }]);
		return fNext();
	});

// GET with URL parameters
tmpServiceServer.get('/api/items/:id',
	(pRequest, pResponse, fNext) =>
	{
		pResponse.send({ id: pRequest.params.id });
		return fNext();
	});

// POST with body parsing
tmpServiceServer.postWithBodyParser('/api/items',
	(pRequest, pResponse, fNext) =>
	{
		let tmpNewItem = pRequest.body;
		pResponse.send({ created: true, item: tmpNewItem });
		return fNext();
	});

// PUT with body parsing
tmpServiceServer.putWithBodyParser('/api/items/:id',
	(pRequest, pResponse, fNext) =>
	{
		pResponse.send({ updated: true, id: pRequest.params.id });
		return fNext();
	});

// DELETE
tmpServiceServer.del('/api/items/:id',
	(pRequest, pResponse, fNext) =>
	{
		pResponse.send({ deleted: true });
		return fNext();
	});
```

## Starting the Server

```javascript
_Fable.Orator.startService(
	() =>
	{
		_Fable.log.info('Server is ready');
	});
```

## Stopping the Server

```javascript
_Fable.Orator.stopService(
	() =>
	{
		_Fable.log.info('Server stopped');
	});
```

## Next Steps

- [Configuration](configuration.md) - Customize the Restify server
- [Middleware](middleware.md) - Add request processing middleware
- [Body Parsing](body-parsing.md) - Configure request body parsing
