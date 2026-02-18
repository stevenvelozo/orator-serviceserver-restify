# Orator ServiceServer Restify

> Production HTTP service server for Orator, powered by Restify

This is the Restify implementation of the Orator service server interface. It wraps [Restify](https://restify.com/) to provide a full-featured HTTP API server with body parsing, middleware, and all standard HTTP verbs. When you need a real network-facing API server, this is the module you reach for.

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

// Register routes
_Fable.Orator.serviceServer.get('/api/status',
	(pRequest, pResponse, fNext) =>
	{
		pResponse.send({ status: 'ok' });
		return fNext();
	});

_Fable.Orator.serviceServer.postWithBodyParser('/api/items',
	(pRequest, pResponse, fNext) =>
	{
		pResponse.send({ created: true, item: pRequest.body });
		return fNext();
	});

// Start the server
_Fable.Orator.startService();
```

## Installation

```bash
npm install orator-serviceserver-restify
```

## Configuration

Restify-specific configuration is passed through the `RestifyConfiguration` setting:

```javascript
const _Fable = new libFable({
	ServicePort: 8080,
	RestifyConfiguration: {
		strictNext: true
	}
});
```

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `RestifyConfiguration` | object | `{}` | Options passed to `restify.createServer()` |
| `RestifyConfiguration.maxParamLength` | number | `Number.MAX_SAFE_INTEGER` | Maximum URL parameter length |

## Middleware

The Restify server supports two types of middleware:

```javascript
const tmpServiceServer = _Fable.Orator.serviceServer;

// Post-routing middleware (runs after route matching)
tmpServiceServer.use(
	(pRequest, pResponse, fNext) =>
	{
		return fNext();
	});

// Pre-routing middleware (runs before route matching)
tmpServiceServer.pre(
	(pRequest, pResponse, fNext) =>
	{
		return fNext();
	});
```

## Documentation

Full documentation is available in the [`docs`](./docs) folder, or served locally:

```bash
npx docsify-cli serve docs
```

## Related Packages

- [orator](https://github.com/stevenvelozo/orator) - API server abstraction
- [orator-serviceserver-base](https://github.com/stevenvelozo/orator-serviceserver-base) - Abstract service server base class
- [fable](https://github.com/stevenvelozo/fable) - Application services framework

## License

MIT

## Contributing

Pull requests are welcome. For details on our code of conduct, contribution process, and testing requirements, see the [Retold Contributing Guide](https://github.com/stevenvelozo/retold/blob/main/docs/contributing.md).
