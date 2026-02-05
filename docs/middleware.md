# Middleware

The Restify service server supports two types of middleware, matching Restify's own middleware pipeline.

## Post-Routing Middleware (use)

Middleware registered with `use()` runs after the route has been matched but before the route handler executes:

```javascript
_Fable.Orator.serviceServer.use(
	(pRequest, pResponse, fNext) =>
	{
		_Fable.log.trace(`${pRequest.method} ${pRequest.url}`);
		return fNext();
	});
```

This is the standard middleware pattern. The base class validates that the parameter is a function, then the Restify implementation passes it to the underlying Restify server's `use()` method.

## Pre-Routing Middleware (pre)

Middleware registered with `pre()` runs before the route is even matched. This is useful for things like request sanitization, CORS headers, or URL rewriting:

```javascript
_Fable.Orator.serviceServer.pre(
	(pRequest, pResponse, fNext) =>
	{
		// Runs before routing
		return fNext();
	});
```

## Middleware Order

```
Incoming Request
    ↓
pre() middleware (before routing)
    ↓
Route Matching
    ↓
use() middleware (after routing)
    ↓
Route Handler(s)
    ↓
Response
```

## Example: Request Logging

```javascript
_Fable.Orator.serviceServer.use(
	(pRequest, pResponse, fNext) =>
	{
		let tmpStartTime = Date.now();

		pResponse.on('finish',
			() =>
			{
				let tmpDuration = Date.now() - tmpStartTime;
				_Fable.log.info(`${pRequest.method} ${pRequest.url} ${pResponse.statusCode} ${tmpDuration}ms`);
			});

		return fNext();
	});
```

## Example: CORS Headers

```javascript
_Fable.Orator.serviceServer.pre(
	(pRequest, pResponse, fNext) =>
	{
		pResponse.header('Access-Control-Allow-Origin', '*');
		pResponse.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
		pResponse.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		return fNext();
	});
```
