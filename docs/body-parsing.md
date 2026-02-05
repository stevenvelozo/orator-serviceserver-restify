# Body Parsing

The Restify service server uses Restify's built-in body parser plugin to parse incoming request bodies. There are two ways to use body parsing: per-route convenience methods and manual registration.

## Per-Route Body Parsing

The simplest approach is to use the `*WithBodyParser` convenience methods, which automatically inject the body parser middleware before your route handler:

```javascript
_Fable.Orator.serviceServer.postWithBodyParser('/api/items',
	(pRequest, pResponse, fNext) =>
	{
		// pRequest.body is already parsed
		let tmpNewItem = pRequest.body;
		pResponse.send({ created: true, item: tmpNewItem });
		return fNext();
	});

_Fable.Orator.serviceServer.putWithBodyParser('/api/items/:id',
	(pRequest, pResponse, fNext) =>
	{
		let tmpUpdatedItem = pRequest.body;
		pResponse.send({ updated: true, item: tmpUpdatedItem });
		return fNext();
	});
```

Available for all HTTP verbs: `getWithBodyParser`, `postWithBodyParser`, `putWithBodyParser`, `delWithBodyParser`, `patchWithBodyParser`, `optsWithBodyParser`, `headWithBodyParser`.

## Global Body Parsing

To parse request bodies for all routes, register the body parser as middleware:

```javascript
_Fable.Orator.serviceServer.use(_Fable.Orator.serviceServer.bodyParser());
```

## Default Body Parser Configuration

The Restify body parser is configured with these defaults:

| Option | Default | Description |
|--------|---------|-------------|
| `maxBodySize` | `0` | Maximum body size (0 = unlimited) |
| `mapParams` | `false` | Do not map body parameters to `req.params` |
| `mapFiles` | `false` | Do not map file uploads |
| `overrideParams` | `false` | Do not override URL params with body params |
| `multiples` | `true` | Allow multiple file uploads |
| `hash` | `'sha1'` | Hash algorithm for file uploads |

## Content Types

The Restify body parser handles these content types automatically:

- `application/json` - Parsed as JSON
- `application/x-www-form-urlencoded` - Parsed as URL-encoded form data
- `multipart/form-data` - Parsed as multipart form data (file uploads)
