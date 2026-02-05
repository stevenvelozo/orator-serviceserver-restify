# Orator ServiceServer Restify

> Production HTTP service server for Orator, powered by Restify

This is the Restify implementation of the Orator service server interface. It wraps [Restify](https://restify.com/) to provide a production-ready HTTP API server. The module extends `orator-serviceserver-base`, overriding the `do*` methods to delegate route registration directly to the underlying Restify server instance.

## Features

- **Full HTTP Support** - All standard HTTP verbs (GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD)
- **Restify Middleware** - Both `use` (post-routing) and `pre` (pre-routing) middleware support
- **Body Parsing** - Built-in Restify body parser with multipart support
- **Configurable** - Restify server options passed through from Fable settings
- **Fable Service Provider** - Registers as `OratorServiceServer` in the Fable service manager

## Quick Start

```javascript
const libFable = require('fable');
const libOrator = require('orator');
const libOratorServiceServerRestify = require('orator-serviceserver-restify');

const _Fable = new libFable({
	Product: 'MyAPIServer',
	ProductVersion: '1.0.0',
	ServicePort: 8080
});

_Fable.serviceManager.addServiceType('Orator', libOrator);
_Fable.serviceManager.addServiceType('OratorServiceServer', libOratorServiceServerRestify);
_Fable.serviceManager.instantiateServiceProvider('Orator');
_Fable.serviceManager.instantiateServiceProvider('OratorServiceServer');

_Fable.Orator.serviceServer.get('/api/hello',
	(pRequest, pResponse, fNext) =>
	{
		pResponse.send({ message: 'Hello from Restify!' });
		return fNext();
	});

_Fable.Orator.startService();
```

## Installation

```bash
npm install orator-serviceserver-restify
```

## How It Works

The Restify service server creates a Restify server instance in its constructor and delegates all route and middleware registration directly to it:

```
Orator → serviceServer.get('/path', handler)
  → OratorServiceServerBase.get() [validates route]
    → OratorServiceServerRestify.doGet() [calls this.server.get()]
      → Restify server handles the route
```

## Accessing the Raw Restify Server

The underlying Restify server instance is available at `serviceServer.server`:

```javascript
const tmpRestifyServer = _Fable.Orator.serviceServer.server;
```

This gives you direct access to any Restify-specific features not exposed through the Orator interface.

## Related Packages

- [orator](https://github.com/stevenvelozo/orator) - Main Orator service abstraction
- [orator-serviceserver-base](https://github.com/stevenvelozo/orator-serviceserver-base) - Abstract base class
- [fable](https://github.com/stevenvelozo/fable) - Service provider framework
